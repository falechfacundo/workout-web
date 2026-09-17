"use server";

import { db } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
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

export async function getMuscleVolumeByRegion(
  userId: string,
  options: { period?: "week" | "month" | "all"; mesocycleId?: string } = {}
) {
  return safeAction(async () => {
    const { period = "month", mesocycleId } = options;

    const dateFilter: { gte?: Date } = {};
    if (!mesocycleId) {
      const start = new Date();
      if (period === "week") start.setDate(start.getDate() - 7);
      else if (period === "month") start.setMonth(start.getMonth() - 1);
      if (period !== "all") dateFilter.gte = start;
    }

    const workouts = await db.workoutLog.findMany({
      where: {
        user_id: userId,
        ...(mesocycleId ? { mesocycle_id: mesocycleId } : { date: dateFilter }),
      },
      select: { id: true },
    });

    if (!workouts?.length) return [];

    const workoutIds = workouts.map((w) => w.id);

    const sets = await db.exerciseLog.findMany({
      where: { workout_log_id: { in: workoutIds } },
      select: {
        exercise_id: true,
        reps: true,
        weight: true,
        rir: true,
      },
    });

    if (!sets?.length) return [];

    const exerciseIds = [...new Set(sets.map((s) => s.exercise_id))];

    const muscleGroups = await db.exerciseMuscleGroup.findMany({
      where: { exercise_id: { in: exerciseIds } },
      select: {
        exercise_id: true,
        muscle_group_id: true,
        is_primary: true,
        muscle_group: { select: { name: true } },
      },
    });

    interface RegionStat {
      muscle_group_id: string;
      name: string;
      sets: number;
      effective_sets: number;
      tonelaje: number;
    }

    const byMuscle = new Map<string, RegionStat>();

    for (const set of sets) {
      const weight = Number(set.weight) || 0;
      const isEffective = set.rir != null && set.rir <= 2;
      const groups = muscleGroups.filter((mg) => mg.exercise_id === set.exercise_id);
      const primaryCount = groups.filter((mg) => mg.is_primary).length || 1;

      for (const mg of groups) {
        const share = mg.is_primary ? 1 / primaryCount : 0.5 / primaryCount;
        const id = mg.muscle_group_id;
        const current = byMuscle.get(id);
        if (current) {
          current.sets += share;
          current.effective_sets += isEffective ? share : 0;
          current.tonelaje += weight * set.reps * share;
        } else {
          byMuscle.set(id, {
            muscle_group_id: id,
            name: mg.muscle_group?.name || "Unknown",
            sets: share,
            effective_sets: isEffective ? share : 0,
            tonelaje: weight * set.reps * share,
          });
        }
      }
    }

    return Array.from(byMuscle.values());
  });
}

export async function getRirWeeklyTrend(userId: string, weeks = 10) {
  return safeAction(async () => {
    const start = new Date();
    start.setDate(start.getDate() - weeks * 7);

    const sets = await db.exerciseLog.findMany({
      where: {
        workout_log: { user_id: userId, date: { gte: start } },
      },
      select: {
        reps: true,
        weight: true,
        rir: true,
        workout_log: { select: { date: true } },
      },
    });

    interface WeekStat {
      weekStart: string;
      sets: number;
      effectiveSets: number;
      rirCount: number;
      rirSum: number;
      tonelaje: number;
    }

    const weekMap = new Map<string, WeekStat>();

    for (const set of sets) {
      const date = new Date(set.workout_log.date);
      const day = (date.getDay() + 6) % 7;
      const monday = new Date(date);
      monday.setDate(date.getDate() - day);
      const key = monday.toISOString().split("T")[0];

      const current = weekMap.get(key);
      const weight = Number(set.weight) || 0;
      if (current) {
        current.sets += 1;
        if (set.rir != null && set.rir <= 2) current.effectiveSets += 1;
        if (set.rir != null) {
          current.rirCount += 1;
          current.rirSum += set.rir;
        }
        current.tonelaje += weight * set.reps;
      } else {
        weekMap.set(key, {
          weekStart: key,
          sets: 1,
          effectiveSets: set.rir != null && set.rir <= 2 ? 1 : 0,
          rirCount: set.rir != null ? 1 : 0,
          rirSum: set.rir ?? 0,
          tonelaje: weight * set.reps,
        });
      }
    }

    return Array.from(weekMap.values())
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map((w) => ({
        weekStart: w.weekStart,
        sets: w.sets,
        effectiveSets: w.effectiveSets,
        avgRir: w.rirCount > 0 ? Number((w.rirSum / w.rirCount).toFixed(1)) : null,
        tonelaje: Math.round(w.tonelaje),
      }));
  });
}

export async function getLastExercisePerformance(userId: string) {
  return safeAction(async () => {
    const logs = await db.workoutLog.findMany({
      where: { user_id: userId },
      orderBy: { date: "desc" },
      take: 60,
      select: { id: true, date: true },
    });

    if (!logs?.length) return [];

    const logIds = logs.map((l) => l.id);

    const sets = await db.exerciseLog.findMany({
      where: { workout_log_id: { in: logIds } },
      select: {
        exercise_id: true,
        weight: true,
        reps: true,
        rir: true,
        workout_log: { select: { date: true } },
        exercise: { select: { name: true } },
      },
    });

    interface LastPerf {
      exercise_id: string;
      exercise_name: string;
      date: string;
      weight: number | null;
      reps: number;
      rir: number | null;
    }

    const byExercise = new Map<string, LastPerf>();

    for (const set of sets) {
      const date = new Date(set.workout_log.date).toISOString().split("T")[0];
      const current = byExercise.get(set.exercise_id);
      const weight = set.weight != null ? Number(set.weight) : null;

      if (
        !current ||
        date > current.date ||
        (date === current.date &&
          ((weight ?? 0) > (current.weight ?? 0) ||
            ((weight ?? 0) === (current.weight ?? 0) &&
              set.reps > current.reps)))
      ) {
        byExercise.set(set.exercise_id, {
          exercise_id: set.exercise_id,
          exercise_name: set.exercise?.name || "Unknown",
          date,
          weight,
          reps: set.reps,
          rir: set.rir ?? null,
        });
      }
    }

    return Array.from(byExercise.values());
  });
}

export async function compareMesocycleBlocks(mesocycleId: string) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const current = await db.mesocycle.findFirst({
      where: { id: mesocycleId, user_id: user.id },
    });

    if (!current) {
      return { data: null, error: "Mesociclo no encontrado" };
    }

    const previous = await db.mesocycle.findFirst({
      where: {
        user_id: user.id,
        start_date: { lt: current.start_date },
      },
      orderBy: { start_date: "desc" },
    });

    interface BlockStats {
      name: string;
      startDate: string;
      weeks: number;
      completedSessions: number;
      totalSets: number;
      effectiveSets: number;
      tonelaje: number;
    }

    async function statsFor(
      meso: { id: string; name: string; start_date: Date; end_date: Date }
    ): Promise<BlockStats> {
      const logs = await db.workoutLog.findMany({
        where: { mesocycle_id: meso.id },
        select: { id: true },
      });

      const logIds = logs.map((l) => l.id);
      const sets =
        logIds.length > 0
          ? await db.exerciseLog.findMany({
              where: { workout_log_id: { in: logIds } },
              select: { reps: true, weight: true, rir: true },
            })
          : [];

      const days =
        Math.max(
          1,
          Math.ceil(
            (new Date(meso.end_date).getTime() -
              new Date(meso.start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        ) + 1;

      const completedSessions = await db.trainingSession.count({
        where: { mesocycle_id: meso.id, status: "completed" },
      });

      return {
        name: meso.name,
        startDate: new Date(meso.start_date).toISOString().split("T")[0],
        weeks: Math.ceil(days / 7),
        completedSessions,
        totalSets: sets.length,
        effectiveSets: sets.filter((s) => s.rir != null && s.rir <= 2).length,
        tonelaje: sets.reduce(
          (sum, s) => sum + (Number(s.weight) || 0) * s.reps,
          0
        ),
      };
    }

    const currentStats = await statsFor(current);
    const previousStats = previous ? await statsFor(previous) : null;

    return {
      data: { current: currentStats, previous: previousStats },
      error: null,
    };
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