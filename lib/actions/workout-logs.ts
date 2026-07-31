"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/server";
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
    const supabase = await createClient();

    const { data: workoutLog, error: workoutError } = await supabase
      .from("workout_logs")
      .insert({
        user_id: validatedData.user_id,
        training_session_id: validatedData.training_session_id || null,
        mesocycle_id: validatedData.mesocycle_id || null,
        date: validatedData.date,
        start_time: validatedData.start_time || new Date().toISOString(),
        notes: validatedData.notes || null,
        duration_minutes: validatedData.duration_minutes || null,
        rating: validatedData.rating || null,
      })
      .select()
      .single();

    if (workoutError) {
      logger.error("Error al crear workout log", workoutError, {
        userId: formData.user_id,
        errorCode: workoutError.code,
      });
      return { data: null, error: workoutError.message };
    }

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
    const supabase = await createClient();

    const { data: workoutLog, error: workoutError } = await supabase
      .from("workout_logs")
      .update({
        training_session_id: validatedData.training_session_id || null,
        mesocycle_id: validatedData.mesocycle_id || null,
        date: validatedData.date,
        end_time: validatedData.end_time || null,
        notes: validatedData.notes || null,
        duration_minutes: validatedData.duration_minutes || null,
        rating: validatedData.rating || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (workoutError) {
      return { data: null, error: workoutError.message };
    }

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
    const supabase = await createClient();
    const { error } = await supabase.from("workout_logs").delete().eq("id", id);

    if (error) {
      return { error: error.message };
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
    const supabase = await createClient();
    const { data: workoutLog, error } = await supabase
      .from("workout_logs")
      .select(
        `
        *,
        exercise_logs:exercise_logs(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

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
    const supabase = await createClient();
    const { data: workoutLogs, error } = await supabase
      .from("workout_logs")
      .select(
        `
        *,
        exercise_logs:exercise_logs(*),
        session:training_sessions(name),
        mesocycle:mesocycles(name)
      `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: workoutLogs as WorkoutLogWithSets[], error: null };
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
    const supabase = await createClient();
    const { data: workoutLogs, error } = await supabase
      .from("workout_logs")
      .select(
        `
        *,
        exercise_logs:exercise_logs(*),
        session:training_sessions(name),
        mesocycle:mesocycles(name)
      `
      )
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: workoutLogs as WorkoutLogWithSets[], error: null };
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
    const supabase = await createClient();

    const { data: exerciseLog, error: setError } = await supabase
      .from("exercise_logs")
      .insert({
        workout_log_id: validatedData.workout_log_id!,
        exercise_id: validatedData.exercise_id,
        set_number: validatedData.set_number,
        reps: validatedData.reps,
        weight: validatedData.weight || null,
        rir: validatedData.rir || null,
        notes: validatedData.notes || null,
      })
      .select()
      .single();

    if (setError) {
      return { data: null, error: setError.message };
    }

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
    const supabase = await createClient();

    const { data: exerciseLog, error: setError } = await supabase
      .from("exercise_logs")
      .update({
        exercise_id: validatedData.exercise_id,
        set_number: validatedData.set_number,
        reps: validatedData.reps,
        weight: validatedData.weight || null,
        rir: validatedData.rir || null,
        notes: validatedData.notes || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (setError) {
      return { data: null, error: setError.message };
    }

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
    const supabase = await createClient();
    const { error } = await supabase
      .from("exercise_logs")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
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
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_logs")
    .update({
      end_time: new Date().toISOString(),
      duration_minutes: duration,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    return {
      error: `Error completing workout log: ${error.message}`,
    };
  }

  revalidatePath("/dashboard/workout-logs");
  redirect("/dashboard/workout-logs");
}

export async function getWorkoutSets(workoutId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercise_logs")
    .select(
      `
      *,
      exercise:exercises(*)
    `
    )
    .eq("workout_log_id", workoutId)
    .order("exercise_id")
    .order("set_number");

  if (error) {
    throw new Error(`Error fetching workout sets: ${error.message}`);
  }

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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      duration_minutes
    `
    )
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date");

  if (error) {
    throw new Error(`Error fetching workout stats: ${error.message}`);
  }

  return data;
}
