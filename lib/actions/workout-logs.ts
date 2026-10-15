"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getServerUser } from "@/lib/auth";
import { safeAction } from "@/lib/utils/safe-action";

const logger = createLogger("workout-logs-actions");

// Schema for validation
const WorkoutLogSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  training_session_id: z.string().optional(),
  mesocycle_id: z.string().optional(),
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type WorkoutLogFormData = z.infer<typeof WorkoutLogSchema>;

// Schema for set in workout
const ExerciseLogSetSchema = z.object({
  id: z.string().optional(),
  workout_log_id: z.string().optional(),
  exercise_id: z.string(),
  set_number: z.number().min(1),
  reps: z.number().min(0),
  weight: z.number().min(0).optional().nullable(),
  rir: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional(),
});

export type ExerciseLogSetFormData = z.infer<typeof ExerciseLogSetSchema>;

type WorkoutLogWithSets =
  any & {
    exercise_logs: any[];
    session?: {
      name: string;
    };
    mesocycle?: {
      name: string;
    };
  };

export async function createWorkoutLog(
  formData: WorkoutLogFormData
): Promise<{ data: WorkoutLogWithSets | null; error: string | null }> {
  try {
    logger.debug("Iniciando creación de workout log", {
      trainingSessionId: formData.training_session_id,
      mesocycleId: formData.mesocycle_id,
    });
    const startTime = performance.now();

    const validatedData = WorkoutLogSchema.parse(formData);

    const workoutLog = await db.workoutLog.create({
      data: {
        user_id: validatedData.user_id,
        training_session_id: validatedData.training_session_id || null,
        mesocycle_id: validatedData.mesocycle_id || null,
        date: new Date(validatedData.date),
        start_time: validatedData.start_time
          ? new Date(validatedData.start_time)
          : new Date(),
        notes: validatedData.notes || null,
        duration_minutes: validatedData.duration_minutes || null,
        rating: validatedData.rating || null,
      },
      include: {
        exercise_logs: true,
      },
    });

    logger.info("Workout log creado con éxito", {
      logId: workoutLog.id,
      userId: workoutLog.user_id,
      duration: Math.round(performance.now() - startTime),
    });

    return { data: workoutLog as WorkoutLogWithSets, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0].message };
    }
    return { data: null, error: "Error al crear el registro de entrenamiento" };
  }
}

export async function updateWorkoutLog(
  id: string,
  formData: WorkoutLogFormData
): Promise<{ data: WorkoutLogWithSets | null; error: string | null }> {
  try {
    const user = await getServerUser();
    if (!user?.id) {
      return { data: null, error: "Debes iniciar sesión" };
    }

    const validatedData = WorkoutLogSchema.parse(formData);

    const { count } = await db.workoutLog.updateMany({
      where: { id, user_id: user.id },
      data: {
        training_session_id: validatedData.training_session_id || null,
        mesocycle_id: validatedData.mesocycle_id || null,
        date: new Date(validatedData.date),
        end_time: validatedData.end_time ? new Date(validatedData.end_time) : null,
        notes: validatedData.notes || null,
        duration_minutes: validatedData.duration_minutes || null,
        rating: validatedData.rating || null,
      },
    });

    if (count === 0) {
      return { data: null, error: "Registro de entrenamiento no encontrado" };
    }

    const workoutLog = await db.workoutLog.findFirst({
      where: { id, user_id: user.id },
      include: { exercise_logs: true },
    });

    return { data: workoutLog as WorkoutLogWithSets, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0].message };
    }
    return {
      data: null,
      error: "Error al actualizar el registro de entrenamiento",
    };
  }
}

export async function deleteWorkoutLog(
  id: string
): Promise<{ error: string | null }> {
  try {
    const user = await getServerUser();
    if (!user?.id) {
      return { error: "Debes iniciar sesión" };
    }

    const { count } = await db.workoutLog.deleteMany({
      where: { id, user_id: user.id },
    });

    if (count === 0) {
      return { error: "Registro de entrenamiento no encontrado" };
    }

    return { error: null };
  } catch {
    return { error: "Error al eliminar el registro de entrenamiento" };
  }
}

export async function getWorkoutLog(
  id: string
): Promise<{ data: WorkoutLogWithSets | null; error: string | null }> {
  try {
    const user = await getServerUser();
    if (!user?.id) {
      return { data: null, error: "Debes iniciar sesión" };
    }

    const workoutLog = await db.workoutLog.findFirst({
      where: { id, user_id: user.id },
      include: {
        exercise_logs: true,
      },
    });

    if (!workoutLog) {
      return { data: null, error: "Registro de entrenamiento no encontrado" };
    }

    return { data: workoutLog as WorkoutLogWithSets, error: null };
  } catch {
    return {
      data: null,
      error: "Error al obtener el registro de entrenamiento",
    };
  }
}

export async function getWorkoutLogs(
  userId: string
): Promise<{ data: WorkoutLogWithSets[] | null; error: string | null }> {
  try {
    const workoutLogs = await db.workoutLog.findMany({
      where: { user_id: userId },
      include: {
        exercise_logs: true,
        training_session: { select: { name: true } },
        mesocycle: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    return {
      data: workoutLogs.map((log) => ({
        ...log,
        session: log.training_session,
        mesocycle: log.mesocycle,
      })) as unknown as WorkoutLogWithSets[],
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "Error al obtener los registros de entrenamiento",
    };
  }
}

export async function getWorkoutLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ data: WorkoutLogWithSets[] | null; error: string | null }> {
  try {
    const workoutLogs = await db.workoutLog.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        exercise_logs: true,
        training_session: { select: { name: true } },
        mesocycle: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    return {
      data: workoutLogs.map((log) => ({
        ...log,
        session: log.training_session,
        mesocycle: log.mesocycle,
      })) as unknown as WorkoutLogWithSets[],
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "Error al obtener los registros de entrenamiento",
    };
  }
}

export async function createExerciseLogSet(formData: ExerciseLogSetFormData): Promise<{
  data: any | null;
  error: string | null;
}> {
  try {
    const user = await getServerUser();
    if (!user?.id) {
      return { data: null, error: "Debes iniciar sesión" };
    }

    const validatedData = ExerciseLogSetSchema.parse(formData);

    // El set se cuelga de un workout_log por FK — verificar que ese log sea
    // del usuario actual, si no cualquiera podría agregar sets al
    // entrenamiento de otro pasando su workout_log_id.
    const workoutLog = await db.workoutLog.findFirst({
      where: { id: validatedData.workout_log_id!, user_id: user.id },
      select: { id: true },
    });
    if (!workoutLog) {
      return { data: null, error: "Registro de entrenamiento no encontrado" };
    }

    const exerciseLog = await db.exerciseLog.create({
      data: {
        workout_log_id: validatedData.workout_log_id!,
        exercise_id: validatedData.exercise_id,
        set_number: validatedData.set_number,
        reps: validatedData.reps,
        weight: validatedData.weight || null,
        rir: validatedData.rir || null,
        notes: validatedData.notes || null,
      },
    });

    return { data: exerciseLog, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0].message };
    }
    return { data: null, error: "Error al crear el set" };
  }
}

export async function updateExerciseLogSet(
  id: string,
  formData: ExerciseLogSetFormData
): Promise<{
  data: any | null;
  error: string | null;
}> {
  try {
    const user = await getServerUser();
    if (!user?.id) {
      return { data: null, error: "Debes iniciar sesión" };
    }

    const validatedData = ExerciseLogSetSchema.parse(formData);

    const { count } = await db.exerciseLog.updateMany({
      where: { id, workout_log: { user_id: user.id } },
      data: {
        exercise_id: validatedData.exercise_id,
        set_number: validatedData.set_number,
        reps: validatedData.reps,
        weight: validatedData.weight || null,
        rir: validatedData.rir || null,
        notes: validatedData.notes || null,
      },
    });

    if (count === 0) {
      return { data: null, error: "Set no encontrado" };
    }

    const exerciseLog = await db.exerciseLog.findUnique({ where: { id } });

    return { data: exerciseLog, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0].message };
    }
    return { data: null, error: "Error al actualizar el set" };
  }
}

export async function deleteExerciseLogSet(
  id: string
): Promise<{ error: string | null }> {
  try {
    const user = await getServerUser();
    if (!user?.id) {
      return { error: "Debes iniciar sesión" };
    }

    const { count } = await db.exerciseLog.deleteMany({
      where: { id, workout_log: { user_id: user.id } },
    });

    if (count === 0) {
      return { error: "Set no encontrado" };
    }

    return { error: null };
  } catch {
    return { error: "Error al eliminar el set" };
  }
}

export async function completeWorkoutLog(
  id: string,
  duration: number,
  notes?: string
) {
  const user = await getServerUser();
  if (!user?.id) {
    return;
  }

  const { count } = await db.workoutLog.updateMany({
    where: { id, user_id: user.id },
    data: {
      end_time: new Date(),
      duration_minutes: duration,
      notes: notes || null,
    },
  });

  if (count === 0) {
    return;
  }

  revalidatePath("/dashboard/workout-logs");
  redirect("/dashboard/workout-logs");
}

const LiveWorkoutSchema = z.object({
  training_session_id: z.string().uuid(),
  mesocycle_id: z.string().uuid().optional(),
  date: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  duration_minutes: z.number().int().min(0),
  sets: z
    .array(
      z.object({
        exercise_id: z.string().uuid(),
        set_number: z.number().int().min(1),
        reps: z.number().int().min(0),
        weight: z.number().min(0).nullable().optional(),
        rir: z.number().int().min(0).max(10).nullable().optional(),
      })
    )
    .default([]),
});

export type LiveWorkoutInput = z.input<typeof LiveWorkoutSchema>;

export async function saveLiveWorkout(input: LiveWorkoutInput) {
  return safeAction<{ id: string }>(async () => {
    const user = await getServerUser();
    if (!user?.id) {
      return { data: null, error: "Debes iniciar sesión" };
    }

    const parsed = LiveWorkoutSchema.safeParse(input);
    if (!parsed.success) {
      return { data: null, error: parsed.error.errors[0].message };
    }
    const data = parsed.data;

    const session = await db.trainingSession.findFirst({
      where: { id: data.training_session_id, mesocycle: { user_id: user.id } },
      select: { id: true, mesocycle_id: true },
    });
    if (!session) {
      return { data: null, error: "Sesión no encontrada" };
    }

    const mesocycleId = data.mesocycle_id ?? session.mesocycle_id;
    if (mesocycleId !== session.mesocycle_id) {
      return { data: null, error: "Mesociclo no encontrado" };
    }

    const log = await db.$transaction(async (tx) => {
      const created = await tx.workoutLog.create({
        data: {
          user_id: user.id,
          training_session_id: session.id,
          mesocycle_id: mesocycleId,
          date: new Date(data.date),
          start_time: new Date(data.start_time),
          end_time: new Date(data.end_time),
          duration_minutes: data.duration_minutes,
        },
        select: { id: true },
      });

      if (data.sets.length > 0) {
        await tx.exerciseLog.createMany({
          data: data.sets.map((s) => ({
            workout_log_id: created.id,
            exercise_id: s.exercise_id,
            set_number: s.set_number,
            reps: s.reps,
            weight: s.weight ?? null,
            rir: s.rir ?? null,
          })),
        });
      }

      await tx.trainingSession.update({
        where: { id: session.id },
        data: { status: "completed", completed_date: new Date(data.date) },
      });

      return created;
    });

    logger.info("Live workout guardado", {
      logId: log.id,
      sets: data.sets.length,
    });

    revalidatePath("/dashboard/workout-logs");
    revalidatePath("/dashboard/mesocycles");

    return { data: log, error: null };
  });
}

export async function getWorkoutSets(workoutId: string) {
  const user = await getServerUser();
  if (!user?.id) return [];

  const data = await db.exerciseLog.findMany({
    where: { workout_log_id: workoutId, workout_log: { user_id: user.id } },
    include: {
      exercise: true,
    },
    orderBy: [{ exercise_id: "asc" }, { set_number: "asc" }],
  });

  return data;
}

export async function getWorkoutStats(
  userId: string,
  period: "week" | "month" | "year" = "month"
) {
  const startDate = new Date();

  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const data = await db.workoutLog.findMany({
    where: {
      user_id: userId,
      date: { gte: startDate },
    },
    select: {
      id: true,
      date: true,
      start_time: true,
      end_time: true,
      duration_minutes: true,
    },
    orderBy: { date: "asc" },
  });

  return data;
}