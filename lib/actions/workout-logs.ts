"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";

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
    const validatedData = WorkoutLogSchema.parse(formData);

    const workoutLog = await db.workoutLog.update({
      where: { id },
      data: {
        training_session_id: validatedData.training_session_id || null,
        mesocycle_id: validatedData.mesocycle_id || null,
        date: new Date(validatedData.date),
        end_time: validatedData.end_time ? new Date(validatedData.end_time) : null,
        notes: validatedData.notes || null,
        duration_minutes: validatedData.duration_minutes || null,
        rating: validatedData.rating || null,
      },
      include: {
        exercise_logs: true,
      },
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
    await db.workoutLog.delete({
      where: { id },
    });

    return { error: null };
  } catch {
    return { error: "Error al eliminar el registro de entrenamiento" };
  }
}

export async function getWorkoutLog(
  id: string
): Promise<{ data: WorkoutLogWithSets | null; error: string | null }> {
  try {
    const workoutLog = await db.workoutLog.findFirst({
      where: { id },
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
    const validatedData = ExerciseLogSetSchema.parse(formData);

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
    const validatedData = ExerciseLogSetSchema.parse(formData);

    const exerciseLog = await db.exerciseLog.update({
      where: { id },
      data: {
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
    return { data: null, error: "Error al actualizar el set" };
  }
}

export async function deleteExerciseLogSet(
  id: string
): Promise<{ error: string | null }> {
  try {
    await db.exerciseLog.delete({
      where: { id },
    });

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
  await db.workoutLog.update({
    where: { id },
    data: {
      end_time: new Date(),
      duration_minutes: duration,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/workout-logs");
  redirect("/dashboard/workout-logs");
}

export async function getWorkoutSets(workoutId: string) {
  const data = await db.exerciseLog.findMany({
    where: { workout_log_id: workoutId },
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