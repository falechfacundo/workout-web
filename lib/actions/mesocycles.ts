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