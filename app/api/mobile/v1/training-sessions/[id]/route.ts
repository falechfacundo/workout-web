import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { getLastSessions, getRecords } from "@/lib/mobile/exercise-history";
import { deleteSession, replaceSession, sessionInputSchema } from "@/lib/mobile/planning";
import { parseBody, planningErrorResponse } from "@/lib/mobile/route-helpers";
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

    // Historial para el Workout Player, solo de los ejercicios de esta sesión:
    // - last_sets: todos los sets del último entrenamiento de cada ejercicio (columna "Anterior").
    // - records: mejor e1RM y peso máximo histórico (detección de PR en vivo).
    // - last_performance: compatibilidad con APKs viejos. Antes era un set cualquiera del último
    //   entrenamiento (sin orden por set) y traía todo el historial sin límite; ahora es el set más
    //   pesado de la última sesión.
    const exerciseIds = [...new Set(session.session_exercises.map((se) => se.exercise_id))];
    const [lastSessions, records] = await Promise.all([
      getLastSessions(apiUser.id, exerciseIds),
      getRecords(apiUser.id, exerciseIds),
    ]);

    const lastPerformance: Record<
      string,
      { weight: number | null; reps: number; rir: number | null; date: string }
    > = {};
    for (const [exerciseId, last] of Object.entries(lastSessions)) {
      const top = last.sets.reduce((best, set) =>
        (set.weight ?? -1) > (best.weight ?? -1) ? set : best
      );
      lastPerformance[exerciseId] = { weight: top.weight, reps: top.reps, rir: top.rir, date: last.date };
    }

    return successResponse({
      ...session,
      last_performance: lastPerformance,
      last_sets: lastSessions,
      records,
    });
  } catch (error) {
    console.error("[MOBILE_TRAINING_SESSION_DETAIL]", error);
    return serverErrorResponse();
  }
}

/** Reemplaza la sesión completa: datos y lista de ejercicios (el orden es el del array). */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    const body = await parseBody(request, sessionInputSchema);
    if (body.response) return body.response;

    const session = await replaceSession(apiUser.id, id, body.data);
    if (!session) return notFoundResponse("Sesión no encontrada.");
    return successResponse(session);
  } catch (error) {
    return planningErrorResponse("[MOBILE_SESSION_REPLACE]", error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();
    const { id } = await params;

    if (!(await deleteSession(apiUser.id, id))) return notFoundResponse("Sesión no encontrada.");
    return successResponse(null, "Sesión eliminada.");
  } catch (error) {
    return planningErrorResponse("[MOBILE_SESSION_DELETE]", error);
  }
}
