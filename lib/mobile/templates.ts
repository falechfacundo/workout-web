import { z } from "zod";
import { db } from "@/lib/db";
import { firstOccurrence } from "@/lib/mobile/planning";

/** Plantillas que ve un usuario: las suyas, las del sistema y las públicas. */
const visibleTo = (userId: string) => ({ OR: [{ user_id: userId }, { is_default: true }, { is_public: true }] });

export const instantiateInputSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato AAAA-MM-DD.")
    .refine((s) => !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime()), "Fecha inválida."),
  name: z.string().trim().max(100).optional(),
});

export async function listTemplates(userId: string) {
  const templates = await db.mesocycleTemplate.findMany({
    where: visibleTo(userId),
    orderBy: [{ is_default: "desc" }, { name: "asc" }],
    include: {
      goals: { select: { goal_type: true, priority: true } },
      muscle_focus: { select: { focus_level: true, muscle_group: { select: { id: true, name: true } } } },
      sessions: {
        orderBy: [{ day_of_week: "asc" }, { created_at: "asc" }],
        include: {
          template_session_exercises: {
            orderBy: { order_index: "asc" },
            select: { sets: true, reps: true, rir: true, exercise: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    duration_weeks: t.duration_weeks,
    is_default: t.is_default,
    is_own: t.user_id === userId,
    goals: t.goals,
    muscle_focus: t.muscle_focus,
    sessions: t.sessions.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      day_of_week: s.day_of_week,
      estimated_duration_minutes: s.estimated_duration_minutes,
      exercises: s.template_session_exercises,
    })),
  }));
}

/**
 * Crea un mesociclo desde una plantilla. Las sesiones de la plantilla son la semana tipo: cada una
 * queda agendada en su primer día de la semana a partir del inicio (como en los mesociclos del seed),
 * y el mesociclo dura `duration_weeks` semanas.
 */
export async function instantiateTemplate(userId: string, templateId: string, input: z.infer<typeof instantiateInputSchema>) {
  const template = await db.mesocycleTemplate.findFirst({
    where: { id: templateId, ...visibleTo(userId) },
    include: {
      goals: true,
      muscle_focus: true,
      sessions: {
        orderBy: [{ day_of_week: "asc" }, { created_at: "asc" }],
        include: { template_session_exercises: { orderBy: { order_index: "asc" } } },
      },
    },
  });
  if (!template) return null;

  const start = new Date(`${input.start_date}T00:00:00Z`);
  const end = new Date(start.getTime() + (Math.max(1, template.duration_weeks) * 7 - 1) * 86_400_000);

  return db.mesocycle.create({
    data: {
      user_id: userId,
      name: input.name || template.name,
      description: template.description,
      start_date: start,
      end_date: end,
      status: "planned",
      mesocycle_goals: {
        create: template.goals.map((g) => ({
          goal_type: g.goal_type,
          notes: g.priority != null ? `Prioridad ${g.priority}` : null,
        })),
      },
      mesocycle_muscle_group_focus: {
        create: template.muscle_focus.map((f) => ({ muscle_group_id: f.muscle_group_id, priority: f.focus_level })),
      },
      training_sessions: {
        create: template.sessions.map((s) => ({
          name: s.name,
          description: s.description,
          day_of_week: s.day_of_week,
          duration_minutes: s.estimated_duration_minutes,
          status: "planned",
          scheduled_date: s.day_of_week == null ? start : firstOccurrence(start, s.day_of_week),
          session_exercises: {
            create: s.template_session_exercises.map(({ exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, notes, order_index }) => ({
              exercise_id, sets, reps, rir, rest_between_sets, rest_after_exercise, notes, order_index,
            })),
          },
        })),
      },
    },
  });
}
