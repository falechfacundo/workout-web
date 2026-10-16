"use server";

import { db } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
import { safeAction } from "@/lib/utils/safe-action";
import * as queries from "@/lib/queries/analytics";

const UNAUTHENTICATED: { data: null; error: string } = {
  data: null,
  error: "Debes iniciar sesión",
};

export async function getVolumeByMuscleGroup(
  period: "week" | "month" | "year" = "month"
) {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getVolumeByMuscleGroup(user.id, period);
}

export async function getExerciseProgress(exerciseId: string, limit = 10) {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getExerciseProgress(user.id, exerciseId, limit);
}

export async function getWorkoutFrequency(
  period: "week" | "month" | "year" = "month"
) {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getWorkoutFrequency(user.id, period);
}

export async function getPerformanceMetrics() {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getPerformanceMetrics(user.id);
}

export async function getPersonalRecords(limit = 10) {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getPersonalRecords(user.id, limit);
}

export async function getWorkoutStreak() {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getWorkoutStreak(user.id);
}

export async function getWorkoutHeatmap(weeks = 20) {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getWorkoutHeatmap(user.id, weeks);
}

export async function getMuscleVolumeByRegion(
  options: { period?: "week" | "month" | "all"; mesocycleId?: string } = {}
) {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getMuscleVolumeByRegion(user.id, options);
}

export async function getRirWeeklyTrend(weeks = 10) {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getRirWeeklyTrend(user.id, weeks);
}

export async function getLastExercisePerformance() {
  const user = await getServerUser();
  if (!user?.id) return UNAUTHENTICATED;
  return queries.getLastExercisePerformance(user.id);
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
    const user = await getServerUser();
    if (!user?.id) return UNAUTHENTICATED;

    const mesocycle = await db.mesocycle.findFirst({
      where: { id: mesocycleId, user_id: user.id },
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
