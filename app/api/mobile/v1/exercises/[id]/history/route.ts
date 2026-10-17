import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { summarizeHistory, type SetType } from "@/lib/mobile/exercise-history";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";

/**
 * Progreso de un ejercicio para la pantalla de detalle de la app: serie para graficar (e1RM, peso top
 * y volumen por entrenamiento), récords por rango de reps y las últimas 50 sesiones con sus sets.
 * Trae los sets de UN ejercicio del usuario: acotado aunque el historial general crezca.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const { id } = await params;
    const exercise = await db.exercise.findFirst({
      where: { id, OR: [{ is_default: true }, { user_id: apiUser.id }] },
      select: {
        id: true,
        name: true,
        equipment_needed: true,
        is_default: true,
        exercise_muscle_groups: {
          select: { is_primary: true, muscle_group: { select: { id: true, name: true } } },
          orderBy: { incidence_level: "desc" },
        },
      },
    });
    if (!exercise) return notFoundResponse("Ejercicio no encontrado.");

    const logs = await db.exerciseLog.findMany({
      where: { exercise_id: id, workout_log: { user_id: apiUser.id } },
      select: {
        set_number: true,
        weight: true,
        reps: true,
        rir: true,
        set_type: true,
        workout_log: { select: { id: true, date: true } },
      },
    });

    const history = summarizeHistory(
      logs.map((l) => ({
        workout_log_id: l.workout_log.id,
        date: l.workout_log.date.toISOString().slice(0, 10),
        set_number: l.set_number,
        weight: l.weight != null ? Number(l.weight) : null,
        reps: l.reps,
        rir: l.rir,
        set_type: l.set_type as SetType,
      }))
    );

    return successResponse({
      exercise: {
        id: exercise.id,
        name: exercise.name,
        equipment: exercise.equipment_needed,
        is_custom: !exercise.is_default,
        primary_muscle_group: exercise.exercise_muscle_groups.find((m) => m.is_primary)?.muscle_group ?? null,
        secondary_muscle_groups: exercise.exercise_muscle_groups.filter((m) => !m.is_primary).map((m) => m.muscle_group),
      },
      ...history,
    });
  } catch (error) {
    console.error("[MOBILE_EXERCISE_HISTORY]", error);
    return serverErrorResponse();
  }
}
