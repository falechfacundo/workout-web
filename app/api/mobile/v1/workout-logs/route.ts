import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/apiResponse";
import { toPlainJSON } from "@/lib/utils/serialize";

const setInputSchema = z.object({
  exercise_id: z.string().uuid(),
  set_number: z.number().int().min(1),
  reps: z.number().int().min(0),
  weight: z.number().min(0).nullable().optional(),
  rir: z.number().int().min(0).max(10).nullable().optional(),
});

const createWorkoutLogSchema = z.object({
  training_session_id: z.string().uuid().nullable().optional(),
  mesocycle_id: z.string().uuid().nullable().optional(),
  date: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  duration_minutes: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  sets: z.array(setInputSchema).default([]),
  // Si viene de un training_session, marcarla como completada en el mismo
  // request (evita un segundo round-trip desde un dispositivo con mala señal).
  complete_session: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const logs = await db.workoutLog.findMany({
      where: { user_id: apiUser.id },
      include: {
        exercise_logs: true,
        training_session: { select: { name: true } },
        mesocycle: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    return successResponse(toPlainJSON(logs));
  } catch (error) {
    console.error("[MOBILE_WORKOUT_LOGS_LIST]", error);
    return serverErrorResponse();
  }
}

/**
 * Crea un workout log + todos sus sets en una sola transacción atómica.
 * A diferencia del flujo web (que hace createWorkoutLog + N x
 * createExerciseLogSet + updateWorkoutLog en llamadas secuenciales), acá va
 * todo en un solo request: en una red mobile inestable, una falla a mitad
 * de esa secuencia dejaría un log sin sets o sin duración. El cliente mobile
 * mantiene el estado del entrenamiento 100% local hasta terminar y lo manda
 * completo recién al finalizar (ver docs/MOBILE-API-CONTRACT.md).
 */
export async function POST(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const parsed = createWorkoutLogSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400);
    }
    const input = parsed.data;

    if (input.training_session_id) {
      const session = await db.trainingSession.findFirst({
        where: { id: input.training_session_id, mesocycle: { user_id: apiUser.id } },
        select: { id: true },
      });
      if (!session) return errorResponse("Sesión no encontrada.", 404);
    }

    if (input.mesocycle_id) {
      const mesocycle = await db.mesocycle.findFirst({
        where: { id: input.mesocycle_id, user_id: apiUser.id },
        select: { id: true },
      });
      if (!mesocycle) return errorResponse("Mesociclo no encontrado.", 404);
    }

    const workoutLog = await db.$transaction(async (tx) => {
      const log = await tx.workoutLog.create({
        data: {
          user_id: apiUser.id,
          training_session_id: input.training_session_id ?? null,
          mesocycle_id: input.mesocycle_id ?? null,
          date: new Date(input.date),
          start_time: new Date(input.start_time),
          end_time: new Date(input.end_time),
          duration_minutes: input.duration_minutes ?? null,
          notes: input.notes ?? null,
          rating: input.rating ?? null,
        },
      });

      if (input.sets.length > 0) {
        await tx.exerciseLog.createMany({
          data: input.sets.map((s) => ({
            workout_log_id: log.id,
            exercise_id: s.exercise_id,
            set_number: s.set_number,
            reps: s.reps,
            weight: s.weight ?? null,
            rir: s.rir ?? null,
          })),
        });
      }

      if (input.training_session_id && input.complete_session) {
        await tx.trainingSession.update({
          where: { id: input.training_session_id },
          data: { status: "completed", completed_date: new Date(input.date) },
        });
      }

      return tx.workoutLog.findUniqueOrThrow({
        where: { id: log.id },
        include: { exercise_logs: true },
      });
    });

    return createdResponse(toPlainJSON(workoutLog), "Entrenamiento guardado.");
  } catch (error) {
    console.error("[MOBILE_WORKOUT_LOGS_CREATE]", error);
    return serverErrorResponse();
  }
}
