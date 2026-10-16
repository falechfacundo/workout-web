/**
 * Series semanales por grupo muscular, con el mismo criterio que `getMuscleVolumeByRegion`:
 * cada set suma 1 al músculo primario y 0,5 a cada secundario (repartido si hay más de un
 * primario). "Efectiva" = RIR <= 2. Semanas de lunes a domingo sobre la fecha calendario.
 */
export type VolumeSet = { date: string; exercise_id: string; rir: number | null };
export type ExerciseMuscles = Map<string, Array<{ muscle_group_id: string; is_primary: boolean }>>;
export type WeekVolume = {
  week_start: string;
  muscles: Record<string, { sets: number; effective_sets: number }>;
};

const DAY = 86_400_000;

function parse(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Lunes de la semana de `date` ("YYYY-MM-DD"). */
export function weekStart(date: string): string {
  const t = parse(date);
  const dow = (new Date(t).getUTCDay() + 6) % 7; // 0 = lunes
  return iso(t - dow * DAY);
}

/** Las últimas `weeks` semanas hasta la de `today` inclusive, de la más vieja a la actual. */
export function weekStarts(today: string, weeks: number): string[] {
  const current = parse(weekStart(today));
  return Array.from({ length: weeks }, (_, i) => iso(current - (weeks - 1 - i) * 7 * DAY));
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function weeklyVolume(sets: VolumeSet[], muscles: ExerciseMuscles, today: string, weeks: number): WeekVolume[] {
  const starts = weekStarts(today, weeks);
  const byWeek = new Map(starts.map((w) => [w, {} as WeekVolume["muscles"]]));
  for (const set of sets) {
    const bucket = byWeek.get(weekStart(set.date));
    if (!bucket) continue;
    const groups = muscles.get(set.exercise_id) ?? [];
    const primaries = groups.filter((g) => g.is_primary).length || 1;
    const effective = set.rir != null && set.rir <= 2;
    for (const g of groups) {
      const share = (g.is_primary ? 1 : 0.5) / primaries;
      const m = (bucket[g.muscle_group_id] ??= { sets: 0, effective_sets: 0 });
      m.sets += share;
      if (effective) m.effective_sets += share;
    }
  }
  return starts.map((w) => {
    const muscles = byWeek.get(w)!;
    for (const m of Object.values(muscles)) {
      m.sets = r2(m.sets);
      m.effective_sets = r2(m.effective_sets);
    }
    return { week_start: w, muscles };
  });
}
