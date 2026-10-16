import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type LastSet = {
  set_number: number;
  weight: number | null;
  reps: number;
  rir: number | null;
};

export type LastSession = { date: string; sets: LastSet[] };

export type ExerciseRecord = {
  /** Mejor 1RM estimado: Epley ajustado por RIR (reps + RIR al fallo, tope 12). Igual que la app. */
  best_e1rm: number;
  best_weight: number;
};

const PAGE = 20;
const MAX_PAGES = 3;

/**
 * Todos los sets del último entrenamiento que incluyó cada ejercicio, ordenados por `set_number`.
 * Recorre los entrenamientos más recientes del usuario de a 20 (máximo 60) en vez de traer todo el
 * historial: un ejercicio que no aparece en los últimos 60 entrenamientos se trata como nuevo.
 */
export async function getLastSessions(
  userId: string,
  exerciseIds: string[]
): Promise<Record<string, LastSession>> {
  const result: Record<string, LastSession> = {};
  const missing = new Set(exerciseIds);

  for (let page = 0; page < MAX_PAGES && missing.size > 0; page++) {
    const logs = await db.workoutLog.findMany({
      where: { user_id: userId, exercise_logs: { some: { exercise_id: { in: [...missing] } } } },
      orderBy: [{ date: "desc" }, { start_time: "desc" }],
      skip: page * PAGE,
      take: PAGE,
      select: {
        id: true,
        date: true,
        exercise_logs: {
          where: { exercise_id: { in: [...missing] } },
          orderBy: { set_number: "asc" },
          select: { exercise_id: true, set_number: true, weight: true, reps: true, rir: true },
        },
      },
    });

    // Los logs vienen del más reciente al más viejo: el primero que trae un ejercicio es el que vale.
    // Se compara por id de entrenamiento (no por fecha) para no mezclar dos sesiones del mismo día.
    const owner = new Map<string, string>();
    for (const log of logs) {
      for (const el of log.exercise_logs) {
        if (!missing.has(el.exercise_id)) continue;
        if (!owner.has(el.exercise_id)) {
          owner.set(el.exercise_id, log.id);
          result[el.exercise_id] = { date: log.date.toISOString().slice(0, 10), sets: [] };
        }
        if (owner.get(el.exercise_id) !== log.id) continue;
        result[el.exercise_id].sets.push({
          set_number: el.set_number,
          weight: el.weight != null ? Number(el.weight) : null,
          reps: el.reps,
          rir: el.rir,
        });
      }
    }
    for (const id of owner.keys()) missing.delete(id);
    if (logs.length < PAGE) break;
  }
  return result;
}

/** Récords por ejercicio, agregados en la base (una fila por ejercicio, no todo el historial). */
export async function getRecords(
  userId: string,
  exerciseIds: string[]
): Promise<Record<string, ExerciseRecord>> {
  if (exerciseIds.length === 0) return {};
  const rows = await db.$queryRaw<Array<{ exercise_id: string; best_e1rm: Prisma.Decimal | null; best_weight: Prisma.Decimal | null }>>`
    SELECT el.exercise_id,
           MAX(CASE
                 WHEN el.reps + COALESCE(el.rir, 0) <= 1 THEN el.weight
                 ELSE el.weight * (1 + LEAST(el.reps + COALESCE(el.rir, 0), 12)::numeric / 30)
               END) AS best_e1rm,
           MAX(el.weight) AS best_weight
    FROM exercise_logs el
    JOIN workout_logs wl ON wl.id = el.workout_log_id
    WHERE wl.user_id = ${userId}
      AND el.exercise_id IN (${Prisma.join(exerciseIds)})
      AND el.weight > 0
      AND el.reps > 0
    GROUP BY el.exercise_id
  `;
  const out: Record<string, ExerciseRecord> = {};
  for (const r of rows) {
    if (r.best_e1rm == null || r.best_weight == null) continue;
    out[r.exercise_id] = {
      best_e1rm: Math.round(Number(r.best_e1rm) * 10) / 10,
      best_weight: Number(r.best_weight),
    };
  }
  return out;
}
