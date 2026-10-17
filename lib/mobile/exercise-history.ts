import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type SetType = "normal" | "warmup" | "drop" | "failure";

export type LastSet = {
  set_number: number;
  weight: number | null;
  reps: number;
  rir: number | null;
  set_type: SetType;
};

/** Los calentamientos se muestran, pero no cuentan para récords, e1RM, rep maxes ni volumen. */
export const isWorkSet = (s: { set_type?: string | null }) => s.set_type !== "warmup";

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
          select: { exercise_id: true, set_number: true, weight: true, reps: true, rir: true, set_type: true },
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
          set_type: el.set_type as SetType,
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
      AND el.set_type <> 'warmup'
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

/** Misma fórmula que el SQL de `getRecords` y que la app: Epley con reps + RIR al fallo, tope 12. */
export function e1rm(weight: number, reps: number, rir: number | null): number {
  const toFailure = reps + Math.max(0, rir ?? 0);
  if (toFailure <= 1) return weight;
  return weight * (1 + Math.min(toFailure, 12) / 30);
}

export const REP_MAX_TARGETS = [1, 3, 5, 8, 10] as const;

export type HistoryRow = {
  workout_log_id: string;
  date: string; // YYYY-MM-DD
  set_number: number;
  weight: number | null;
  reps: number;
  rir: number | null;
  set_type: SetType;
};

export type ExerciseHistory = {
  /** Más reciente primero, máximo `maxSessions`. */
  sessions: Array<{ workout_log_id: string; date: string; sets: LastSet[] }>;
  /** Una entrada por entrenamiento, del más viejo al más nuevo (para graficar). */
  series: Array<{ date: string; best_e1rm: number | null; top_weight: number | null; volume: number; sets: number }>;
  /** Mayor peso hecho con AL MENOS N reps (un 100 × 5 también cuenta como 3RM). */
  rep_maxes: Record<string, { weight: number; reps: number; date: string } | null>;
  best_e1rm: { value: number; weight: number; reps: number; date: string } | null;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Resume todos los sets de un ejercicio. `rows` en cualquier orden. */
export function summarizeHistory(rows: HistoryRow[], maxSessions = 50): ExerciseHistory {
  const byLog = new Map<string, { date: string; sets: LastSet[] }>();
  for (const r of rows) {
    const entry = byLog.get(r.workout_log_id) ?? { date: r.date, sets: [] };
    entry.sets.push({ set_number: r.set_number, weight: r.weight, reps: r.reps, rir: r.rir, set_type: r.set_type });
    byLog.set(r.workout_log_id, entry);
  }
  const logs = [...byLog.entries()]
    .map(([workout_log_id, v]) => ({ workout_log_id, date: v.date, sets: v.sets.sort((a, b) => a.set_number - b.set_number) }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const series = [...logs].reverse().map((l) => {
    let best: number | null = null;
    let top: number | null = null;
    let volume = 0;
    const work = l.sets.filter(isWorkSet);
    for (const s of work) {
      if (s.weight == null || s.weight <= 0 || s.reps <= 0) continue;
      const est = e1rm(s.weight, s.reps, s.rir);
      best = best === null ? est : Math.max(best, est);
      top = top === null ? s.weight : Math.max(top, s.weight);
      volume += s.weight * s.reps;
    }
    return { date: l.date, best_e1rm: best === null ? null : r1(best), top_weight: top, volume: Math.round(volume), sets: work.length };
  });

  const rep_maxes: ExerciseHistory["rep_maxes"] = {};
  for (const n of REP_MAX_TARGETS) rep_maxes[n] = null;
  let best_e1rm: ExerciseHistory["best_e1rm"] = null;
  for (const l of logs) {
    for (const s of l.sets) {
      if (!isWorkSet(s) || s.weight == null || s.weight <= 0 || s.reps <= 0) continue;
      for (const n of REP_MAX_TARGETS) {
        const cur = rep_maxes[n];
        if (s.reps >= n && (!cur || s.weight > cur.weight)) rep_maxes[n] = { weight: s.weight, reps: s.reps, date: l.date };
      }
      const est = r1(e1rm(s.weight, s.reps, s.rir));
      if (!best_e1rm || est > best_e1rm.value) best_e1rm = { value: est, weight: s.weight, reps: s.reps, date: l.date };
    }
  }

  return { sessions: logs.slice(0, maxSessions), series, rep_maxes, best_e1rm };
}
