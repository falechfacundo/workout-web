"use server";

import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("analytics-actions");

type ExerciseLogSet = {
  id: string;
  workout_log_id: string;
  exercise_id: string;
  reps: number;
  weight: number;
  rir?: number;
  workout_logs: {
    date: string;
  };
};

export async function getVolumeByMuscleGroup(
  userId: string,
  period: "week" | "month" | "year" = "month"
) {
  return safeAction(async () => {
    logger.debug("Iniciando getVolumeByMuscleGroup", { userId, period });

    const startDate = new Date();

    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const supabase = await createClient();
    const { data: workouts, error: workoutsError } = await (supabase as any)
      .from("workout_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0]);

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
      });
      return [];
    }

    const workoutIds = workouts.map((w: any) => w.id);

    const { data: sets, error: setsError } = await (supabase as any)
      .from("exercise_logs")
      .select(
        `
        id,
        workout_log_id,
        exercise_id,
        reps
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
      return [];
    }

    const exerciseIds = [...new Set(sets.map((s: any) => s.exercise_id))];

    const { data: exerciseMuscleGroups, error: emgError } = await (supabase as any)
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
        exerciseMuscleGroups as any[]
      ).filter((emg) => emg.exercise_id === set.exercise_id);

      for (const mg of muscleGroups) {
        const mgId = mg.muscle_group_id;
        const mgName = Array.isArray(mg.muscle_groups) ? mg.muscle_groups[0]?.name : mg.muscle_groups?.name;
        const isPrimary = mg.is_primary;

        const volumeMultiplier = isPrimary ? 1 : 0.5;
        const setVolume = set.reps * volumeMultiplier;

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
    const { data: workouts, error: workoutsError } = await (supabase as any)
      .from("workout_logs")
      .select("id, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
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

    const workoutIds = workouts.map((w: any) => w.id);

    const { data: sets, error: setsError } = await (supabase as any)
      .from("exercise_logs")
      .select(
        `
        id,
        workout_log_id,
        set_number,
        reps,
        weight,
        rir,
        workout_logs(date)
      `
      )
      .eq("exercise_id", exerciseId)
      .in("workout_log_id", workoutIds)
      .order("workout_logs.date", { ascending: false });

    if (setsError) {
      return {
        data: null,
        error: "No se pudo obtener los datos de los ejercicios.",
      };
    }

    const workoutMap = new Map();

    for (const set of sets as ExerciseLogSet[]) {
      const workoutId = set.workout_log_id;
      const date = set.workout_logs.date;
      const volume = set.weight * set.reps;

      if (
        !workoutMap.has(workoutId) ||
        workoutMap.get(workoutId).volume < volume
      ) {
        workoutMap.set(workoutId, {
          date,
          weight: set.weight,
          reps: set.reps,
          volume,
        });
      }
    }

    return Array.from(workoutMap.values())
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
    let intervalType: "day" | "month" = "day";

    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
      intervalType = "month";
    }

    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("workout_logs")
      .select(
        `
        id,
        date
      `
      )
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date");

    if (error) {
      return {
        data: null,
        error: "No se pudo obtener la frecuencia de entrenamientos.",
      };
    }

    const frequencyMap = new Map();

    for (const workout of data) {
      const date = new Date(workout.date);
      let key: string;

      if (intervalType === "day") {
        key = workout.date;
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
    const { count: totalWorkouts, error: workoutsError } = await (supabase as any)
      .from("workout_logs")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (workoutsError) {
      return {
        data: null,
        error: "No se pudo obtener el total de entrenamientos.",
      };
    }

    const { data: workoutIds, error: idsError } = await (supabase as any)
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
      const ids = workoutIds.map((w: any) => w.id);

    const { data: sets, error: setsError } = await (supabase as any)
        .from("exercise_logs")
        .select("weight, reps")
        .in("workout_log_id", ids);

      if (setsError) {
        return {
          data: null,
          error: "No se pudo obtener los datos de los ejercicios.",
        };
      }

      totalSets = sets.length;
      totalVolume = sets.reduce(
        (sum: number, set: any) => sum + (set.weight || 0) * set.reps,
        0
      );
    }

    try {
      const { data: durations, error: durationsError } = await (supabase as any)
        .from("workout_logs")
        .select("duration_minutes")
        .eq("user_id", userId)
        .not("duration_minutes", "is", null);

      if (durationsError || !durations || durations.length === 0) {
        return {
          data: {
            totalWorkouts: totalWorkouts || 0,
            totalVolume,
            totalSets,
            avgDuration: 0,
          },
          error: null,
        };
      }

      const avgDuration =
        durations.reduce((sum: number, log: any) => sum + log.duration_minutes, 0) /
        durations.length;

      return {
        data: {
          totalWorkouts: totalWorkouts || 0,
          totalVolume,
          totalSets,
          avgDuration: Math.round(avgDuration),
        },
        error: null,
      };
    } catch (e) {
      console.error("Error al calcular la duración promedio:", e);
      return {
        data: {
          totalWorkouts: totalWorkouts || 0,
          totalVolume,
          totalSets,
          avgDuration: 0,
        },
        error: null,
      };
    }
  });
}
