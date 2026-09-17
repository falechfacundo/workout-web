import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const { id } = await params;

    const session = await db.trainingSession.findFirst({
      where: { id, mesocycle: { user_id: apiUser.id } },
      include: {
        session_exercises: {
          orderBy: { order_index: "asc" },
          include: { exercise: true },
        },
      },
    });

    if (!session) return notFoundResponse("Sesión no encontrada.");

    // Última performance por ejercicio (solo para los ejercicios de esta
    // sesión), para prefillear el player en vivo.
    const exerciseIds = session.session_exercises.map((se) => se.exercise_id);
    const recentLogs = exerciseIds.length
      ? await db.exerciseLog.findMany({
          where: {
            exercise_id: { in: exerciseIds },
            workout_log: { user_id: apiUser.id },
          },
          select: {
            exercise_id: true,
            weight: true,
            reps: true,
            rir: true,
            workout_log: { select: { date: true } },
          },
          orderBy: { workout_log: { date: "desc" } },
        })
      : [];

    const lastPerformance: Record<
      string,
      { weight: number | null; reps: number; rir: number | null; date: string }
    > = {};
    for (const log of recentLogs) {
      if (lastPerformance[log.exercise_id]) continue; // ya tenemos la más reciente (orden desc)
      lastPerformance[log.exercise_id] = {
        weight: log.weight != null ? Number(log.weight) : null,
        reps: log.reps,
        rir: log.rir,
        date: log.workout_log.date.toISOString().split("T")[0],
      };
    }

    return successResponse({ ...session, last_performance: lastPerformance });
  } catch (error) {
    console.error("[MOBILE_TRAINING_SESSION_DETAIL]", error);
    return serverErrorResponse();
  }
}
