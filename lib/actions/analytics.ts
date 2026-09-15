"use server";

import { db } from "@/lib/db";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("analytics-actions");

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

    const workouts = await db.workoutLog.findMany({
      where: {
        user_id: userId,
        date: { gte: startDate },
      },
      select: { id: true },
    });

    if (!workouts?.length) {
      logger.info("No se encontraron entrenamientos en el período", {
        userId,
        period,
      });
      return [];
    }

    const workoutIds = workouts.map((w) => w.id);

    const sets = await db.exerciseLog.findMany({
      where: {
        workout_log_id: { in: workoutIds },
      },
      select: {
        id: true,
        workout_log_id: true,
        exercise_id: true,
        reps: true,
      },
    });

    if (!sets?.length) {
      return [];
    }

    const exerciseIds = [...new Set(sets.map((s) => s.exercise_id))];

    const exerciseMuscleGroups = await db.exerciseMuscleGroup.findMany({
      where: {
        exercise_id: { in: exerciseIds },
      },
      select: {
        exercise_id: true,
        muscle_group_id: true,
        is_primary: true,
        muscle_group: { select: { name: true } },
      },
    });

    const volumeByMuscleGroup = new Map();

    for (const set of sets) {
      const muscleGroups = exerciseMuscleGroups.filter(
        (emg) => emg.exercise_id === set.exercise_id
      );

      for (const mg of muscleGroups) {
        const mgId = mg.muscle_group_id;
        const mgName = mg.muscle_group?.name || "Unknown";
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
    const workouts = await db.workoutLog.findMany({
      where: {
        user_id: userId,
      },
      select: { id: true, date: true },
      orderBy: { date: "desc" },
      take: 50,
    });

    if (!workouts?.length) {
      return [];
    }

    const workoutIds = workouts.map((w) => w.id);

    const sets = await db.exerciseLog.findMany({
      where: {
        exercise_id: exerciseId,
        workout_log_id: { in: workoutIds },
      },
      select: {
        id: true,
        workout_log_id: true,
        set_number: true,
        reps: true,
        weight: true,
        rir: true,
        workout_log: { select: { date: true } },
      },
      orderBy: { workout_log: { date: "desc" } },
    });

    const workoutMap = new Map();

    for (const set of sets as any[]) {
      const workoutId = set.workout_log_id;
      const date = set.workout_log.date;
      const volume = (Number(set.weight) || 0) * set.reps;

      if (
        !workoutMap.has(workoutId) ||
        workoutMap.get(workoutId).volume < volume
      ) {
        workoutMap.set(workoutId, {
          date,
          weight: Number(set.weight) || 0,
          reps: set.reps,
          volume,
        });
      }
    }

    return Array.from(workoutMap.values())
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
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

    const data = await db.workoutLog.findMany({
      where: {
        user_id: userId,
        date: { gte: startDate },
      },
      select: { id: true, date: true },
      orderBy: { date: "asc" },
    });

    const frequencyMap = new Map();

    for (const workout of data as any[]) {
      const date = new Date(workout.date);
      let key: string;

      if (intervalType === "day") {
        const dateStr =
          typeof workout.date === "string"
            ? workout.date
            : workout.date.toISOString().split("T")[0];
        key = dateStr;
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
    const totalWorkouts = await db.workoutLog.count({
      where: { user_id: userId },
    });

    const workoutIds = await db.workoutLog.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    let totalVolume = 0;
    let totalSets = 0;

    if (workoutIds?.length > 0) {
      const ids = workoutIds.map((w) => w.id);

      const sets = await db.exerciseLog.findMany({
        where: { workout_log_id: { in: ids } },
        select: { weight: true, reps: true },
      });

      totalSets = sets.length;
      totalVolume = sets.reduce(
        (sum, set) => sum + (Number(set.weight) || 0) * set.reps,
        0
      );
    }

    try {
      const durations = await db.workoutLog.findMany({
        where: {
          user_id: userId,
          duration_minutes: { not: null },
        },
        select: { duration_minutes: true },
      });

      if (!durations || durations.length === 0) {
        return {
          data: {
            totalWorkouts,
            totalVolume,
            totalSets,
            avgDuration: 0,
          },
          error: null,
        };
      }

      const avgDuration =
        durations.reduce(
          (sum, log) => sum + (log.duration_minutes || 0),
          0
        ) / durations.length;

      return {
        data: {
          totalWorkouts,
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
          totalWorkouts,
          totalVolume,
          totalSets,
          avgDuration: 0,
        },
        error: null,
      };
    }
  });
}