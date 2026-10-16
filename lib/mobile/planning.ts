import { z } from "zod";
import { db } from "@/lib/db";

/**
 * Escritura de la planificación (mesociclos y sesiones) para la API mobile. Cada función recibe el
 * `userId` del token y verifica la propiedad en la misma consulta: devuelve `null` cuando el recurso
 * no existe o es de otro usuario, y la ruta responde 404 en los dos casos.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato AAAA-MM-DD.")
  .refine((s) => !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime()), "Fecha inválida.");

const STATUSES = ["planned", "in_progress", "completed", "cancelled"] as const;

const mesocycleFields = {
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(100),
  description: z.string().trim().max(1000).nullable().optional(),
  start_date: isoDate,
  end_date: isoDate,
  status: z.enum(STATUSES).optional(),
  focus_muscle_groups: z.array(z.string().uuid()).max(30).optional(),
};

const endAfterStart = (v: { start_date?: string; end_date?: string }) =>
  !v.start_date || !v.end_date || v.end_date >= v.start_date;
const END_MESSAGE = { message: "La fecha de fin no puede ser anterior a la de inicio.", path: ["end_date"] };

export const mesocycleInputSchema = z.object(mesocycleFields).refine(endAfterStart, END_MESSAGE);
export const mesocyclePatchSchema = z.object(mesocycleFields).partial().refine(endAfterStart, END_MESSAGE);

export const sessionExerciseInputSchema = z.object({
  exercise_id: z.string().uuid(),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100),
  rir: z.number().int().min(0).max(10).nullable().optional(),
  rest_between_sets: z.number().int().min(0).max(1800).nullable().optional(),
  rest_after_exercise: z.number().int().min(0).max(1800).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});

/** Una sesión completa: el editor mobile guarda todo de una vez y el orden es el del array. */
export const sessionInputSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(100),
  description: z.string().trim().max(1000).nullable().optional(),
  day_of_week: z.number().int().min(0).max(6).nullable().optional(),
  duration_minutes: z.number().int().min(1).max(600).nullable().optional(),
  exercises: z.array(sessionExerciseInputSchema).max(40).default([]),
});

export type MesocycleInput = z.infer<typeof mesocycleInputSchema>;
export type MesocyclePatch = z.infer<typeof mesocyclePatchSchema>;
export type SessionInput = z.infer<typeof sessionInputSchema>;

export class PlanningError extends Error {}

const toDate = (s: string) => new Date(`${s}T00:00:00Z`);

/**
 * Primer día >= `start` que cae en `dayOfWeek` (0 = domingo, igual que `Date.getUTCDay`). Las
 * sesiones del mesociclo son la semana tipo y se agendan en su primera ocurrencia, como en el seed.
 */
export function firstOccurrence(start: Date, dayOfWeek: number): Date {
  const offset = (dayOfWeek - start.getUTCDay() + 7) % 7;
  return new Date(start.getTime() + offset * 86_400_000);
}

const scheduledFor = (start: Date, dayOfWeek: number | null | undefined) =>
  dayOfWeek == null ? null : firstOccurrence(start, dayOfWeek);

/** Los ejercicios del plan solo pueden ser del sistema o propios (igual que en POST /workout-logs). */
async function assertExercisesAllowed(userId: string, exercises: SessionInput["exercises"]) {
  const ids = [...new Set(exercises.map((e) => e.exercise_id))];
  if (ids.length === 0) return;
  const allowed = await db.exercise.count({
    where: { id: { in: ids }, OR: [{ is_default: true }, { user_id: userId }] },
  });
  if (allowed !== ids.length) throw new PlanningError("Ejercicio no encontrado.");
}

async function assertMuscleGroupsExist(ids: string[] | undefined) {
  if (!ids || ids.length === 0) return;
  const unique = [...new Set(ids)];
  const found = await db.muscleGroup.count({ where: { id: { in: unique } } });
  if (found !== unique.length) throw new PlanningError("Grupo muscular no encontrado.");
}

const exerciseRows = (exercises: SessionInput["exercises"]) =>
  exercises.map((e, i) => ({
    exercise_id: e.exercise_id,
    sets: e.sets,
    reps: e.reps,
    rir: e.rir ?? null,
    rest_between_sets: e.rest_between_sets ?? null,
    rest_after_exercise: e.rest_after_exercise ?? null,
    notes: e.notes || null,
    order_index: i,
  }));

export async function createMesocycle(userId: string, input: MesocycleInput) {
  await assertMuscleGroupsExist(input.focus_muscle_groups);
  return db.mesocycle.create({
    data: {
      user_id: userId,
      name: input.name,
      description: input.description || null,
      start_date: toDate(input.start_date),
      end_date: toDate(input.end_date),
      status: input.status ?? "planned",
      mesocycle_muscle_group_focus: {
        create: [...new Set(input.focus_muscle_groups ?? [])].map((muscle_group_id) => ({ muscle_group_id })),
      },
    },
  });
}

export async function updateMesocycle(userId: string, id: string, patch: MesocyclePatch) {
  const current = await db.mesocycle.findFirst({ where: { id, user_id: userId } });
  if (!current) return null;

  // Con un solo extremo en el patch, se valida contra el que ya está guardado.
  const start = patch.start_date ?? current.start_date.toISOString().slice(0, 10);
  const end = patch.end_date ?? current.end_date.toISOString().slice(0, 10);
  if (end < start) throw new PlanningError(END_MESSAGE.message);
  await assertMuscleGroupsExist(patch.focus_muscle_groups);

  return db.$transaction(async (tx) => {
    if (patch.focus_muscle_groups) {
      await tx.mesocycleMuscleGroupFocus.deleteMany({ where: { mesocycle_id: id } });
      await tx.mesocycleMuscleGroupFocus.createMany({
        data: [...new Set(patch.focus_muscle_groups)].map((muscle_group_id) => ({ mesocycle_id: id, muscle_group_id })),
      });
    }
    return tx.mesocycle.update({
      where: { id },
      data: {
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.description !== undefined && { description: patch.description || null }),
        ...(patch.start_date && { start_date: toDate(patch.start_date) }),
        ...(patch.end_date && { end_date: toDate(patch.end_date) }),
        ...(patch.status && { status: patch.status }),
      },
    });
  });
}

/** Borra el mesociclo y sus sesiones; los entrenamientos registrados quedan (mesocycle_id pasa a null). */
export async function deleteMesocycle(userId: string, id: string) {
  const { count } = await db.mesocycle.deleteMany({ where: { id, user_id: userId } });
  return count > 0;
}

/** Copia el mesociclo con sus sesiones planificadas, foco y objetivos. Las sesiones vuelven a "planned". */
export async function duplicateMesocycle(userId: string, id: string) {
  const source = await db.mesocycle.findFirst({
    where: { id, user_id: userId },
    include: {
      mesocycle_goals: true,
      mesocycle_muscle_group_focus: true,
      training_sessions: {
        orderBy: [{ scheduled_date: "asc" }, { created_at: "asc" }],
        include: { session_exercises: { orderBy: { order_index: "asc" } } },
      },
    },
  });
  if (!source) return null;

  return db.mesocycle.create({
    data: {
      user_id: userId,
      name: `${source.name} (copia)`.slice(0, 100),
      description: source.description,
      start_date: source.start_date,
      end_date: source.end_date,
      status: "planned",
      mesocycle_goals: {
        create: source.mesocycle_goals.map((g) => ({
          goal_type: g.goal_type,
          target_value: g.target_value,
          unit: g.unit,
          notes: g.notes,
        })),
      },
      mesocycle_muscle_group_focus: {
        create: source.mesocycle_muscle_group_focus.map((f) => ({ muscle_group_id: f.muscle_group_id, priority: f.priority })),
      },
      training_sessions: {
        create: source.training_sessions.map((s) => ({
          name: s.name,
          description: s.description,
          day_of_week: s.day_of_week,
          duration_minutes: s.duration_minutes,
          status: "planned",
          scheduled_date: s.scheduled_date,
          session_exercises: {
            create: s.session_exercises.map(({ exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, notes, order_index }) => ({
              exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, notes, order_index,
            })),
          },
        })),
      },
    },
  });
}

const sessionInclude = {
  session_exercises: { orderBy: { order_index: "asc" as const }, include: { exercise: true } },
};

export async function createSession(userId: string, mesocycleId: string, input: SessionInput) {
  const mesocycle = await db.mesocycle.findFirst({ where: { id: mesocycleId, user_id: userId }, select: { start_date: true } });
  if (!mesocycle) return null;
  await assertExercisesAllowed(userId, input.exercises);

  return db.trainingSession.create({
    data: {
      mesocycle_id: mesocycleId,
      name: input.name,
      description: input.description || null,
      day_of_week: input.day_of_week ?? null,
      duration_minutes: input.duration_minutes ?? null,
      status: "planned",
      scheduled_date: scheduledFor(mesocycle.start_date, input.day_of_week),
      session_exercises: { create: exerciseRows(input.exercises) },
    },
    include: sessionInclude,
  });
}

/**
 * Reemplaza la sesión entera (datos y lista de ejercicios) en una transacción. Nada referencia a
 * `session_exercises` por id (los entrenamientos guardan `exercise_id`), así que recrearlos no
 * rompe el historial. El estado de la sesión no se toca.
 */
export async function replaceSession(userId: string, sessionId: string, input: SessionInput) {
  const owned = await db.trainingSession.findFirst({
    where: { id: sessionId, mesocycle: { user_id: userId } },
    select: { mesocycle: { select: { start_date: true } } },
  });
  if (!owned) return null;
  await assertExercisesAllowed(userId, input.exercises);

  return db.$transaction(async (tx) => {
    await tx.sessionExercise.deleteMany({ where: { training_session_id: sessionId } });
    return tx.trainingSession.update({
      where: { id: sessionId },
      data: {
        name: input.name,
        description: input.description || null,
        day_of_week: input.day_of_week ?? null,
        duration_minutes: input.duration_minutes ?? null,
        scheduled_date: scheduledFor(owned.mesocycle.start_date, input.day_of_week),
        session_exercises: { create: exerciseRows(input.exercises) },
      },
      include: sessionInclude,
    });
  });
}

/** Los entrenamientos registrados de la sesión quedan (training_session_id pasa a null). */
export async function deleteSession(userId: string, sessionId: string) {
  const { count } = await db.trainingSession.deleteMany({ where: { id: sessionId, mesocycle: { user_id: userId } } });
  return count > 0;
}

export async function duplicateSession(userId: string, sessionId: string) {
  const source = await db.trainingSession.findFirst({
    where: { id: sessionId, mesocycle: { user_id: userId } },
    include: { session_exercises: { orderBy: { order_index: "asc" } } },
  });
  if (!source) return null;

  return db.trainingSession.create({
    data: {
      mesocycle_id: source.mesocycle_id,
      name: `${source.name} (copia)`.slice(0, 100),
      description: source.description,
      day_of_week: source.day_of_week,
      duration_minutes: source.duration_minutes,
      status: "planned",
      session_exercises: {
        create: source.session_exercises.map(({ exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, notes, order_index }) => ({
          exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, notes, order_index,
        })),
      },
    },
    include: sessionInclude,
  });
}
