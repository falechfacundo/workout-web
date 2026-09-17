"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import {
  mesocycleSchema,
  type Mesocycle,
  type MesocycleWithRelations,
} from "@/lib/schemas/mesocycle";

// Crear logger específico para mesociclos
const logger = createLogger("mesocycles-actions");

export async function getMesocycles(userId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclos para usuario", { userId });
    const startTime = performance.now();

    try {
      const data = await db.mesocycle.findMany({
        where: { user_id: userId },
        orderBy: { start_date: "desc" },
      });

      const duration = Math.round(performance.now() - startTime);
      logger.info("Mesociclos obtenidos exitosamente", {
        userId,
        count: data.length,
        duration,
      });

      return {
        data: data as unknown as Mesocycle[],
        error: null,
      };
    } catch (error) {
      logger.error(
        "Error al obtener mesociclos",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      return {
        data: null,
        error: `Error fetching mesocycles: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function getActiveMesocycles(userId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclos activos para usuario", { userId });
    const startTime = performance.now();

    try {
      const data = await db.mesocycle.findMany({
        where: { user_id: userId, status: "in_progress" },
        orderBy: { start_date: "asc" },
      });

      const duration = Math.round(performance.now() - startTime);
      logger.info("Mesociclos activos obtenidos exitosamente", {
        userId,
        count: data.length,
        duration,
      });

      return {
        data: data as unknown as Mesocycle[],
        error: null,
      };
    } catch (error) {
      logger.error(
        "Error al obtener mesociclos activos",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      return {
        data: null,
        error: `Error fetching active mesocycles: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function getMesocycle(id: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclo por ID", { mesocycleId: id });
    const startTime = performance.now();

    const user = await getServerUser();
    if (!user) {
      return {
        data: null,
        error: "You must be logged in to view this mesocycle",
      };
    }

    try {
      const mesocycle = await db.mesocycle.findUnique({
        where: { id, user_id: user.id },
        include: {
          mesocycle_goals: true,
          mesocycle_muscle_group_focus: {
            include: { muscle_group: true },
          },
        },
      });

      if (!mesocycle) {
        return {
          data: null,
          error: "Error fetching mesocycle: not found",
        };
      }

      const fullMesocycleData = {
        ...mesocycle,
        goals: mesocycle.mesocycle_goals,
        focus_muscle_groups: mesocycle.mesocycle_muscle_group_focus.map(
          (item) => item.muscle_group_id
        ),
      };

      const duration = Math.round(performance.now() - startTime);
      logger.info("Mesociclo obtenido exitosamente", {
        mesocycleId: id,
        mesocycleName: mesocycle.name,
        goalsCount: mesocycle.mesocycle_goals.length,
        focusCount: mesocycle.mesocycle_muscle_group_focus.length,
        duration,
      });

      return {
        data: fullMesocycleData as unknown as MesocycleWithRelations,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Error al obtener mesociclo",
        error instanceof Error ? error : new Error(String(error)),
        { mesocycleId: id }
      );

      return {
        data: null,
        error: `Error fetching mesocycle: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function createMesocycle(formData: Mesocycle) {
  return safeAction(async () => {
    logger.debug("Iniciando creación de mesociclo", {
      userId: formData.user_id,
      mesocycleName: formData.name,
    });
    const startTime = performance.now();

    // Validar datos del formulario
    const validatedFields = mesocycleSchema.safeParse(formData);

    if (!validatedFields.success) {
      const formattedErrors = validatedFields.error.format();
      logger.warn("Validación fallida en formulario de mesociclo", {
        errors: formattedErrors,
        userId: formData.user_id,
      });

      return {
        data: null,
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const user = await getServerUser();
    if (!user) {
      return {
        data: null,
        error: "You must be logged in to create a mesocycle",
      };
    }

    const {
      name,
      start_date,
      end_date,
      description,
      status,
      goals,
      focus_muscle_groups,
    } = validatedFields.data;

    logger.info("Creando nuevo mesociclo", {
      userId: user.id,
      name,
      status,
      startDate: start_date,
      endDate: end_date,
      goalsCount: goals?.length || 0,
      focusMuscleGroupsCount: focus_muscle_groups?.length || 0,
    });

    try {
      const data = await db.mesocycle.create({
        data: {
          user_id: user.id,
          name,
          description: description || null,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          status,
          mesocycle_goals: {
            create:
              goals?.map((goal) => ({
                goal_type: goal.goal_type,
                target_value: goal.target_value || null,
                unit: goal.unit || null,
                notes: goal.notes || null,
              })) ?? [],
          },
          mesocycle_muscle_group_focus: {
            create:
              focus_muscle_groups?.map((muscleGroupId) => ({
                muscle_group_id: muscleGroupId,
              })) ?? [],
          },
        },
      });

      const duration = Math.round(performance.now() - startTime);
      logger.info("Mesociclo creado exitosamente", {
        mesocycleId: data.id,
        name,
        userId: user.id,
        duration,
        status,
      });

      revalidatePath("/dashboard/mesocycles");
      redirect("/dashboard/mesocycles");

      return {
        data: data as unknown as Mesocycle,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Error al crear mesociclo en la base de datos",
        error instanceof Error ? error : new Error(String(error)),
        {
          userId: user.id,
          name,
        }
      );

      return {
        data: null,
        error: `Error creating mesocycle: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function updateMesocycle(formData: Mesocycle) {
  return safeAction(async () => {
    // Validar datos del formulario
    const validatedFields = mesocycleSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        data: null,
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      id,
      name,
      start_date,
      end_date,
      description,
      status,
      goals,
      focus_muscle_groups,
    } = validatedFields.data;

    if (!id) {
      return {
        data: null,
        error: "Mesocycle ID is required for updates",
      };
    }

    const user = await getServerUser();
    if (!user) {
      return {
        data: null,
        error: "You must be logged in to update a mesocycle",
      };
    }

    try {
      const data = await db.mesocycle.update({
        where: { id, user_id: user.id },
        data: {
          user_id: user.id,
          name,
          description: description || null,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          status,
        },
      });

      await db.mesocycleGoal.deleteMany({ where: { mesocycle_id: id } });

      if (goals && goals.length > 0) {
        await db.mesocycleGoal.createMany({
          data: goals.map((goal) => ({
            mesocycle_id: id,
            goal_type: goal.goal_type,
            target_value: goal.target_value || null,
            unit: goal.unit || null,
            notes: goal.notes || null,
          })),
        });
      }

      await db.mesocycleMuscleGroupFocus.deleteMany({
        where: { mesocycle_id: id },
      });

      if (focus_muscle_groups && focus_muscle_groups.length > 0) {
        await db.mesocycleMuscleGroupFocus.createMany({
          data: focus_muscle_groups.map((muscleGroupId) => ({
            mesocycle_id: id,
            muscle_group_id: muscleGroupId,
          })),
        });
      }

      revalidatePath("/dashboard/mesocycles");
      redirect("/dashboard/mesocycles");

      return {
        data: data as unknown as Mesocycle,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: `Error updating mesocycle: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function deleteMesocycle(id: string) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user) {
      return {
        data: null,
        error: "You must be logged in to delete a mesocycle",
      };
    }

    try {
      await db.mesocycle.delete({ where: { id, user_id: user.id } });

      revalidatePath("/dashboard/mesocycles");

      return {
        data: { success: true },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: `Error deleting mesocycle: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function getSessionCountByMesocycle(id: string) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user) {
      return {
        data: null,
        error: "You must be logged in to view this mesocycle",
      };
    }

    try {
      const count = await db.trainingSession.count({
        where: { mesocycle_id: id, mesocycle: { user_id: user.id } },
      });

      return {
        data: count,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: `Error counting sessions: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function updateMesocycleStatus(id: string, status: string) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user) {
      return {
        data: null,
        error: "You must be logged in to update a mesocycle",
      };
    }

    try {
      const data = await db.mesocycle.update({
        where: { id, user_id: user.id },
        data: { status },
      });

      revalidatePath("/dashboard/mesocycles");
      revalidatePath(`/dashboard/mesocycles/${id}`);

      return {
        data: data as unknown as Mesocycle,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: `Error updating mesocycle status: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

// Type for the form data - exported for use in components
export type MesocycleFormData = Mesocycle;

export async function duplicateTrainingSession(
  sessionId: string
) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user) {
      return { data: null, error: "You must be logged in" };
    }

    try {
      const source = await db.trainingSession.findFirst({
        where: { id: sessionId, mesocycle: { user_id: user.id } },
        include: { session_exercises: { orderBy: { order_index: "asc" } } },
      });

      if (!source) {
        return { data: null, error: "Sesión no encontrada" };
      }

      const copy = await db.trainingSession.create({
        data: {
          mesocycle_id: source.mesocycle_id,
          name: `${source.name} (copy)`,
          description: source.description,
          day_of_week: source.day_of_week,
          duration_minutes: source.duration_minutes,
          status: "planned",
          session_exercises: {
            create: source.session_exercises.map((se) => ({
              exercise_id: se.exercise_id,
              sets: se.sets,
              reps: se.reps,
              rir: se.rir,
              rest_between_sets: se.rest_between_sets,
              rest_after_exercise: se.rest_after_exercise,
              notes: se.notes,
              order_index: se.order_index,
            })),
          },
        },
      });

      revalidatePath(`/dashboard/mesocycles/${source.mesocycle_id}`);

      return { data: copy, error: null };
    } catch (error) {
      return {
        data: null,
        error: `Error duplicando la sesión: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function duplicateMesocycle(mesocycleId: string) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user) {
      return { data: null, error: "You must be logged in" };
    }

    try {
      const source = await db.mesocycle.findFirst({
        where: { id: mesocycleId, user_id: user.id },
        include: {
          training_sessions: {
            include: { session_exercises: { orderBy: { order_index: "asc" } } },
            orderBy: { scheduled_date: "asc" },
          },
          mesocycle_goals: true,
          mesocycle_muscle_group_focus: true,
        },
      });

      if (!source) {
        return { data: null, error: "Mesociclo no encontrado" };
      }

      const copy = await db.mesocycle.create({
        data: {
          user_id: user.id,
          name: `${source.name} (copy)`,
          description: source.description,
          start_date: source.start_date,
          end_date: source.end_date,
          status: "planned",
          mesocycle_goals: {
            create: source.mesocycle_goals.map((g) => ({
              goal_type: g.goal_type,
              target_value: g.target_value,
              unit: g.unit,
              notes: g.notes,
            })),
          },
          mesocycle_muscle_group_focus: {
            create: source.mesocycle_muscle_group_focus.map((f) => ({
              muscle_group_id: f.muscle_group_id,
              priority: f.priority,
            })),
          },
          training_sessions: {
            create: source.training_sessions.map((s) => ({
              name: s.name,
              description: s.description,
              day_of_week: s.day_of_week,
              duration_minutes: s.duration_minutes,
              status: "planned",
              scheduled_date: s.scheduled_date,
              session_exercises: {
                create: s.session_exercises.map((se) => ({
                  exercise_id: se.exercise_id,
                  sets: se.sets,
                  reps: se.reps,
                  rir: se.rir,
                  rest_between_sets: se.rest_between_sets,
                  rest_after_exercise: se.rest_after_exercise,
                  notes: se.notes,
                  order_index: se.order_index,
                })),
              },
            })),
          },
        },
      });

      revalidatePath("/dashboard/mesocycles");

      return { data: copy, error: null };
    } catch (error) {
      return {
        data: null,
        error: `Error duplicando el mesociclo: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}

export async function instantiateMesocycleFromTemplate(
  templateId: string,
  startDate: string,
  name?: string
) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user) {
      return { data: null, error: "You must be logged in" };
    }

    try {
      const template = await db.mesocycleTemplate.findFirst({
        where: {
          id: templateId,
          OR: [{ user_id: user.id }, { is_public: true }],
        },
        include: {
          goals: true,
          muscle_focus: true,
          sessions: {
            include: {
              template_session_exercises: {
                orderBy: { order_index: "asc" },
              },
            },
            orderBy: { day_of_week: "asc" },
          },
        },
      });

      if (!template) {
        return { data: null, error: "Plantilla no encontrada" };
      }

      const start = new Date(`${startDate}T00:00:00`);
      if (Number.isNaN(start.getTime())) {
        return { data: null, error: "Fecha de inicio inválida" };
      }
      const end = new Date(start);
      end.setDate(end.getDate() + template.duration_weeks * 7 - 1);

      const mesocycle = await db.mesocycle.create({
        data: {
          user_id: user.id,
          name: name?.trim() || template.name,
          description: template.description,
          start_date: start,
          end_date: end,
          status: "planned",
          mesocycle_goals: {
            create: template.goals.map((g) => ({
              goal_type: g.goal_type,
              notes: g.priority != null ? `Prioridad ${g.priority}` : null,
            })),
          },
          mesocycle_muscle_group_focus: {
            create: template.muscle_focus.map((f) => ({
              muscle_group_id: f.muscle_group_id,
              priority: f.focus_level,
            })),
          },
          training_sessions: {
            create: template.sessions.map((s, idx) => ({
              name: s.name,
              description: s.description,
              day_of_week: s.day_of_week,
              duration_minutes: s.estimated_duration_minutes,
              status: "planned",
              scheduled_date: new Date(
                start.getTime() + idx * 7 * 24 * 60 * 60 * 1000
              ),
              session_exercises: {
                create: s.template_session_exercises.map((tse) => ({
                  exercise_id: tse.exercise_id,
                  sets: tse.sets,
                  reps: tse.reps,
                  rir: tse.rir,
                  rest_between_sets: tse.rest_between_sets,
                  rest_after_exercise: tse.rest_after_exercise,
                  notes: tse.notes,
                  order_index: tse.order_index,
                })),
              },
            })),
          },
        },
      });

      revalidatePath("/dashboard/mesocycles");

      return { data: mesocycle, error: null };
    } catch (error) {
      return {
        data: null,
        error: `Error instanciando la plantilla: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
}