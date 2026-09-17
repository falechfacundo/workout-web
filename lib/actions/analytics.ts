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

export async function getPersonalRecords(userId: string, limit = 10) {
  return safeAction(async () => {
    const workoutLogs = await db.workoutLog.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!workoutLogs?.length) {
      return [];
    }

    const workoutIds = workoutLogs.map((w) => w.id);

    const sets = await db.exerciseLog.findMany({
      where: {
        workout_log_id: { in: workoutIds },
        weight: { not: null },
      },
      select: {
        exercise_id: true,
        reps: true,
        weight: true,
        workout_log: { select: { date: true } },
        exercise: { select: { name: true } },
      },
    });

    interface PersonalRecord {
      exercise_id: string;
      exercise_name: string;
      best_weight: number;
      best_reps: number;
      estimated_1rm: number;
      achieved_at: Date | string;
    }

    const prMap = new Map<string, PersonalRecord>();

    for (const set of sets) {
      const weight = Number(set.weight) || 0;
      if (weight <= 0) continue;
      const estimated1rm = weight * (1 + set.reps / 30);
      const current = prMap.get(set.exercise_id);
      if (!current || estimated1rm > current.estimated_1rm) {
        prMap.set(set.exercise_id, {
          exercise_id: set.exercise_id,
          exercise_name: set.exercise?.name || "Unknown",
          best_weight: weight,
          best_reps: set.reps,
          estimated_1rm: estimated1rm,
          achieved_at: set.workout_log.date,
        });
      }
    }

    return Array.from(prMap.values())
      .sort((a, b) => b.estimated_1rm - a.estimated_1rm)
      .slice(0, limit);
  });
}

export async function getWorkoutStreak(userId: string) {
  return safeAction(async () => {
    const logs = await db.workoutLog.findMany({
      where: { user_id: userId },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 365,
    });

    const dateSet = new Set(
      (logs || []).map((l) => new Date(l.date).toISOString().split("T")[0])
    );

    const dayMs = 24 * 60 * 60 * 1000;

    let currentStreak = 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    if (!dateSet.has(cursor.toISOString().split("T")[0])) {
      cursor.setTime(cursor.getTime() - dayMs);
    }
    while (dateSet.has(cursor.toISOString().split("T")[0])) {
      currentStreak++;
      cursor.setTime(cursor.getTime() - dayMs);
    }

    const sortedDates = Array.from(dateSet).sort();
    let longestStreak = 0;
    let run = 0;
    let prevTime: number | null = null;
    for (const d of sortedDates) {
      const time = new Date(`${d}T12:00:00`).getTime();
      run = prevTime !== null && time - prevTime === dayMs ? run + 1 : 1;
      longestStreak = Math.max(longestStreak, run);
      prevTime = time;
    }

    return {
      currentStreak,
      longestStreak,
      lastWorkout: sortedDates.length
        ? sortedDates[sortedDates.length - 1]
        : null,
    };
  });
}

export async function getWorkoutHeatmap(userId: string, weeks = 20) {
  return safeAction(async () => {
    const start = new Date();
    start.setDate(start.getDate() - weeks * 7);

    const logs = await db.workoutLog.findMany({
      where: {
        user_id: userId,
        date: { gte: start },
      },
      select: { date: true },
    });

    const counts = new Map<string, number>();
    for (const log of logs || []) {
      const key = new Date(log.date).toISOString().split("T")[0];
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  });
}

export async function getMesocycleCompliance(mesocycleId: string) {
  return safeAction(async () => {
    const mesocycle = await db.mesocycle.findUnique({
      where: { id: mesocycleId },
      select: { id: true, name: true, start_date: true, end_date: true },
    });

    if (!mesocycle) {
      return { data: null, error: "Mesociclo no encontrado" };
    }

    const sessions = await db.trainingSession.findMany({
      where: { mesocycle_id: mesocycleId },
      select: {
        id: true,
        status: true,
        scheduled_date: true,
        completed_date: true,
      },
    });

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (s) => s.status === "completed"
    ).length;
    const dueSessions = sessions.filter(
      (s) => s.scheduled_date && new Date(s.scheduled_date) <= today
    ).length;
    const overdueSessions = sessions.filter(
      (s) =>
        s.status !== "completed" &&
        s.scheduled_date &&
        new Date(s.scheduled_date) < today
    ).length;

    return {
      data: {
        mesocycleId,
        name: mesocycle.name,
        totalSessions,
        completedSessions,
        dueSessions,
        overdueSessions,
        compliance:
          dueSessions > 0
            ? Math.round((completedSessions / dueSessions) * 100)
            : null,
      },
      error: null,
    };
  });
}