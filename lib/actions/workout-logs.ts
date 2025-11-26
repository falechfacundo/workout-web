"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/server";
import { z } from "zod";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";
import {
  workoutLogSchema,
  workoutLogWithRelationsSchema,
  type WorkoutLogWithRelations,
  type WorkoutLog,
} from "../schemas/workout-log";
import {
  workoutSetSchema,
  workoutSetFormSchema,
  type WorkoutSet,
  type WorkoutSetFormValues,
} from "../schemas/workout-set";
import { exerciseLogSchema, type ExerciseLog } from "../schemas/exercise-log";

// Create a specific logger for this module
const logger = createLogger("workout-logs-actions");

// Schema for validation
const WorkoutLogSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  session_template_id: z.string().optional(),
  mesocycle_id: z.string().optional(),
  start_time: z.string().default(() => new Date().toISOString()),
  end_time: z.string().optional(),
  notes: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
});

export type WorkoutLogFormData = z.infer<typeof WorkoutLogSchema>;

// Schema for set in workout
const WorkoutSetSchema = z.object({
  id: z.string().optional(),
  workout_log_id: z.string().optional(),
  exercise_id: z.string(),
  set_number: z.number().min(1),
  reps_performed: z.number().min(0),
  weight_lifted: z.number().min(0),
  rpe: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
});

export type WorkoutSetFormData = z.infer<typeof WorkoutSetSchema>;

type WorkoutLogWithSets =
  Database["public"]["Tables"]["workout_logs"]["Row"] & {
    sets: Database["public"]["Tables"]["workout_log_sets"]["Row"][];
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
      sessionTemplateId: formData.session_template_id,
      mesocycleId: formData.mesocycle_id,
    });
    const startTime = performance.now();

    const validatedData = WorkoutLogSchema.parse(formData);
    const supabase = await createClient();

    const { data: workoutLog, error: workoutError } = await supabase
      .from("workout_logs")
      .insert(validatedData)
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

    if (!workoutLog) {
      return {
        data: null,
        error: "No se pudo crear el registro de entrenamiento",
      };
    }

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
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (workoutError) {
      return { data: null, error: workoutError.message };
    }

    if (!workoutLog) {
      return {
        data: null,
        error: "No se pudo actualizar el registro de entrenamiento",
      };
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
  } catch (error) {
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
        sets:workout_sets(*)
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
  } catch (error) {
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
        sets:workout_log_sets(*),
        session:training_sessions_template(name),
        mesocycle:mesocycles(name)
      `
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: workoutLogs as WorkoutLogWithSets[], error: null };
  } catch (error) {
    return {
      data: null,
      error: "Error al obtener los registros de entrenamiento",
    };
  }
}

export async function createWorkoutSet(formData: WorkoutSetFormData): Promise<{
  data: Database["public"]["Tables"]["workout_log_sets"]["Row"] | null;
  error: string | null;
}> {
  try {
    const validatedData = WorkoutSetSchema.parse(formData);
    const supabase = await createClient();

    const { data: workoutSet, error: setError } = await supabase
      .from("workout_log_sets")
      .insert(validatedData)
      .select()
      .single();

    if (setError) {
      return { data: null, error: setError.message };
    }

    if (!workoutSet) {
      return { data: null, error: "No se pudo crear el set" };
    }

    return { data: workoutSet, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0].message };
    }
    return { data: null, error: "Error al crear el set" };
  }
}

export async function updateWorkoutSet(
  id: string,
  formData: WorkoutSetFormData
): Promise<{
  data: Database["public"]["Tables"]["workout_log_sets"]["Row"] | null;
  error: string | null;
}> {
  try {
    const validatedData = WorkoutSetSchema.parse(formData);
    const supabase = await createClient();

    const { data: workoutSet, error: setError } = await supabase
      .from("workout_log_sets")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (setError) {
      return { data: null, error: setError.message };
    }

    if (!workoutSet) {
      return { data: null, error: "No se pudo actualizar el set" };
    }

    return { data: workoutSet, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors[0].message };
    }
    return { data: null, error: "Error al actualizar el set" };
  }
}

export async function deleteWorkoutSet(
  id: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("workout_log_sets")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
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
      completed_at: new Date().toISOString(),
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
    .from("workout_log_sets")
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
      start_time,
      end_time,
      duration_minutes
    `
    )
    .eq("user_id", userId)
    .gte("start_time", startDate.toISOString())
    .order("start_time");

  if (error) {
    throw new Error(`Error fetching workout stats: ${error.message}`);
  }

  return data;
}
