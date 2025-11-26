"use server";

import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";

// Create a specific logger for this module
const logger = createLogger("analytics-actions");

type MuscleGroup = {
  id: string;
  name: string;
};

type ExerciseMuscleGroup = {
  exercise_id: string;
  muscle_group_id: string;
  is_primary: boolean;
  muscle_groups: MuscleGroup;
};

type WorkoutSet = {
  id: string;
  workout_log_id: string;
  exercise_id: string;
  reps_performed: number;
  weight_lifted: number;
  weight_unit: string;
  rir_achieved?: number;
  rest_taken_seconds?: number;
  notes?: string;
  workout_logs: {
    started_at: string;
  };
};

type WorkoutLog = {
  id: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
};

export async function getVolumeByMuscleGroup(
  userId: string,
  period: "week" | "month" | "year" = "month"
) {
  return safeAction(async () => {
    logger.debug("Iniciando getVolumeByMuscleGroup", { userId, period });
    const startTime = performance.now();

    const startDate = new Date();

    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    logger.debug("Cálculo de fecha de inicio", {
      startDate: startDate.toISOString(),
      period,
    });

    const supabase = await createClient();
    const { data: workouts, error: workoutsError } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("started_at", startDate.toISOString());

    if (workoutsError) {
      logger.error(
        "Error al obtener registros de entrenamiento",
        workoutsError,
        {
          userId,
          period,
          errorCode: workoutsError.code,
        }
      );
      return {
        data: null,
        error: "No se pudo obtener los registros de entrenamiento.",
      };
    }

    if (!workouts?.length) {
      logger.info("No se encontraron entrenamientos en el período", {
        userId,
        period,
        startDate: startDate.toISOString(),
      });
      return [];
    }

    logger.debug("Entrenamientos encontrados", { count: workouts.length });

    const workoutIds = workouts.map((w) => w.id);

    const { data: sets, error: setsError } = await supabase
      .from("workout_log_sets")
      .select(
        `
        id,
        workout_log_id,
        exercise_id,
        reps_performed
      `
      )
      .in("workout_log_id", workoutIds);

    if (setsError) {
      logger.error("Error al obtener sets de entrenamiento", setsError, {
        workoutCount: workoutIds.length,
        errorCode: setsError.code,
      });
      return {
        data: null,
        error: "No se pudo obtener los datos de los ejercicios.",
      };
    }

    if (!sets?.length) {
      logger.info("No se encontraron sets de entrenamiento", {
        userId,
        period,
        workoutCount: workoutIds.length,
      });
      return [];
    }

    logger.debug("Sets de entrenamiento encontrados", { count: sets.length });

    const exerciseIds = [...new Set(sets.map((s) => s.exercise_id))];

    const { data: exerciseMuscleGroups, error: emgError } = await supabase
      .from("exercise_muscle_groups")
      .select(
        `
        exercise_id,
        muscle_group_id,
        is_primary,
        muscle_groups(name)
      `
      )
      .in("exercise_id", exerciseIds);

    if (emgError) {
      return { data: null, error: "No se pudo obtener los grupos musculares." };
    }

    const volumeByMuscleGroup = new Map();

    for (const set of sets) {
      const muscleGroups = (
        exerciseMuscleGroups as ExerciseMuscleGroup[]
      ).filter((emg) => emg.exercise_id === set.exercise_id);

      for (const mg of muscleGroups) {
        const mgId = mg.muscle_group_id;
        const mgName = mg.muscle_groups.name;
        const isPrimary = mg.is_primary;

        const volumeMultiplier = isPrimary ? 1 : 0.5;
        const setVolume = set.reps_performed * volumeMultiplier;

        if (volumeByMuscleGroup.has(mgId)) {
          const current = volumeByMuscleGroup.get(mgId);
          volumeByMuscleGroup.set(mgId, {
            ...current,
            volume: current.volume + setVolume,
            sets: current.sets + volumeMultiplier,
          });
        } else {
          volumeByMuscleGroup.set(mgId, {
            id: mgId,
            name: mgName,
            volume: setVolume,
            sets: volumeMultiplier,
          });
        }
      }
    }

    return Array.from(volumeByMuscleGroup.values());
  });
}

export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  limit = 10
) {
  return safeAction(async () => {
    const supabase = await createClient();
    const { data: workouts, error: workoutsError } = await supabase
      .from("workout_logs")
      .select("id, started_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(50);

    if (workoutsError) {
      return {
        data: null,
        error: "No se pudo obtener los registros de entrenamiento.",
      };
    }

    if (!workouts?.length) {
      return [];
    }

    const workoutIds = workouts.map((w) => w.id);

    const { data: sets, error: setsError } = await supabase
      .from("workout_log_sets")
      .select(
        `
        id,
        workout_log_id,
        set_number,
        reps_performed,
        weight_lifted,
        weight_unit,
        rir_achieved,
        workout_logs(started_at)
      `
      )
      .eq("exercise_id", exerciseId)
      .in("workout_log_id", workoutIds)
      .order("workout_logs.started_at", { ascending: false });

    if (setsError) {
      return {
        data: null,
        error: "No se pudo obtener los datos de los ejercicios.",
      };
    }

    const workoutMap = new Map();

    for (const set of sets as WorkoutSet[]) {
      const workoutId = set.workout_log_id;
      const date = new Date(set.workout_logs.started_at);
      const volume = set.weight_lifted * set.reps_performed;

      if (
        !workoutMap.has(workoutId) ||
        workoutMap.get(workoutId).volume < volume
      ) {
        workoutMap.set(workoutId, {
          date: date.toISOString().split("T")[0],
          weight: set.weight_lifted,
          reps: set.reps_performed,
          volume,
          unit: set.weight_unit,
        });
      }
    }

    return Array.from(workoutMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
      .reverse();
  });
}

export async function getWorkoutFrequency(
  userId: string,
  period: "week" | "month" | "year" = "month"
) {
  return safeAction(async () => {
    const startDate = new Date();
    let intervalType: "day" | "week" | "month" = "day";

    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
      intervalType = "day";
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
      intervalType = "day";
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
      intervalType = "month";
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("workout_logs")
      .select(
        `
        id,
        started_at
      `
      )
      .eq("user_id", userId)
      .gte("started_at", startDate.toISOString())
      .order("started_at");

    if (error) {
      return {
        data: null,
        error: "No se pudo obtener la frecuencia de entrenamientos.",
      };
    }

    const frequencyMap = new Map();

    for (const workout of data as WorkoutLog[]) {
      const date = new Date(workout.started_at);
      let key: string;

      if (intervalType === "day") {
        key = date.toISOString().split("T")[0];
      } else if (intervalType === "week") {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
        );
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }

      frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    }

    return Array.from(frequencyMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  });
}

export async function getPerformanceMetrics(userId: string) {
  return safeAction(async () => {
    const supabase = await createClient();
    const { count: totalWorkouts, error: workoutsError } = await supabase
      .from("workout_logs")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (workoutsError) {
      return {
        data: null,
        error: "No se pudo obtener el total de entrenamientos.",
      };
    }

    const { data: workoutIds, error: idsError } = await supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", userId);

    if (idsError) {
      return {
        data: null,
        error: "No se pudo obtener los registros de entrenamiento.",
      };
    }

    let totalVolume = 0;
    let totalSets = 0;

    if (workoutIds?.length > 0) {
      const ids = workoutIds.map((w) => w.id);

      const { data: sets, error: setsError } = await supabase
        .from("workout_log_sets")
        .select("weight_lifted, reps_performed")
        .in("workout_log_id", ids);

      if (setsError) {
        return {
          data: null,
          error: "No se pudo obtener los datos de los ejercicios.",
        };
      }

      totalSets = sets.length;
      totalVolume = sets.reduce(
        (sum, set) => sum + set.weight_lifted * set.reps_performed,
        0
      );
    }

    // Consultar duración de los entrenamientos, pero no fallar si no hay datos
    try {
      const { data: durations, error: durationsError } = await supabase
        .from("workout_logs")
        .select("duration_minutes")
        .eq("user_id", userId)
        .not("duration_minutes", "is", null);

      // Si hay un error en la consulta o no hay duraciones, simplemente usamos 0 como duración promedio
      if (durationsError || !durations || durations.length === 0) {
        return {
          totalWorkouts: totalWorkouts || 0,
          totalVolume,
          totalSets,
          avgDuration: 0,
        };
      }

      const avgDuration =
        durations.reduce((sum, log) => sum + log.duration_minutes, 0) /
        durations.length;

      return {
        totalWorkouts: totalWorkouts || 0,
        totalVolume,
        totalSets,
        avgDuration: Math.round(avgDuration),
      };
    } catch (e) {
      // En caso de cualquier error, devolvemos los datos sin la duración promedio
      console.error("Error al calcular la duración promedio:", e);
      return {
        totalWorkouts: totalWorkouts || 0,
        totalVolume,
        totalSets,
        avgDuration: 0,
      };
    }
  });
}
