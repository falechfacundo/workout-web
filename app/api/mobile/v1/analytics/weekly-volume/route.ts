import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApiUser } from "@/lib/auth";
import { weekStarts, weeklyVolume } from "@/lib/mobile/weekly-volume";
import { successResponse, unauthorizedResponse, errorResponse, serverErrorResponse } from "@/lib/apiResponse";

const querySchema = z.object({
  weeks: z.coerce.number().int().min(1).max(26).default(8),
  // Fecha local del teléfono: decide cuál es "esta semana" (el servidor corre en UTC).
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/** Series por grupo muscular y por semana, para comparar contra los landmarks de volumen. */
export async function GET(request: NextRequest) {
  try {
    const apiUser = await getApiUser(request);
    if (!apiUser) return unauthorizedResponse();

    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) return errorResponse("Parámetros inválidos.", 400);
    const { weeks } = parsed.data;
    const today = parsed.data.today ?? new Date().toISOString().slice(0, 10);
    const from = weekStarts(today, weeks)[0];

    const logs = await db.exerciseLog.findMany({
      where: { workout_log: { user_id: apiUser.id, date: { gte: new Date(`${from}T00:00:00Z`) } } },
      select: { exercise_id: true, rir: true, workout_log: { select: { date: true } } },
    });

    const exerciseIds = [...new Set(logs.map((l) => l.exercise_id))];
    const emgs = exerciseIds.length
      ? await db.exerciseMuscleGroup.findMany({
          where: { exercise_id: { in: exerciseIds } },
          select: { exercise_id: true, muscle_group_id: true, is_primary: true, muscle_group: { select: { name: true } } },
        })
      : [];

    const muscles = new Map<string, Array<{ muscle_group_id: string; is_primary: boolean }>>();
    const names = new Map<string, string>();
    for (const e of emgs) {
      const list = muscles.get(e.exercise_id) ?? [];
      list.push({ muscle_group_id: e.muscle_group_id, is_primary: e.is_primary });
      muscles.set(e.exercise_id, list);
      names.set(e.muscle_group_id, e.muscle_group.name);
    }

    const result = weeklyVolume(
      logs.map((l) => ({ date: l.workout_log.date.toISOString().slice(0, 10), exercise_id: l.exercise_id, rir: l.rir })),
      muscles,
      today,
      weeks
    );

    return successResponse({
      weeks: result,
      muscle_groups: [...names.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error) {
    console.error("[MOBILE_WEEKLY_VOLUME]", error);
    return serverErrorResponse();
  }
}
