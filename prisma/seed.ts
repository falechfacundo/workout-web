import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { muscleGroups } from "./seed-data/muscle-groups"
import { exercises } from "./seed-data/exercises"
import { templates } from "./seed-data/templates"

const pool = new Pool({
  // DATABASE_URL apunta al pooler (6543) y es alcanzable desde cualquier red;
  // DIRECT_URL (5432) puede no estar disponible fuera de la red del host.
  connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  console.log("🌱 Starting database seed...")

  // ============================================================
  // CLEAN EXISTING DATA (FK dependency order)
  // ============================================================
  await prisma.templateSessionExercise.deleteMany()
  await prisma.trainingSessionTemplate.deleteMany()
  await prisma.mesocycleTemplateMuscleFocus.deleteMany()
  await prisma.mesocycleTemplateGoal.deleteMany()
  await prisma.mesocycleTemplate.deleteMany()
  await prisma.workoutReminder.deleteMany()
  await prisma.exerciseLog.deleteMany()
  await prisma.workoutLog.deleteMany()
  await prisma.sessionExercise.deleteMany()
  await prisma.trainingSession.deleteMany()
  await prisma.mesocycleMuscleGroupFocus.deleteMany()
  await prisma.mesocycleGoal.deleteMany()
  await prisma.mesocycle.deleteMany()
  await prisma.exerciseMuscleGroup.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.muscleGroup.deleteMany()
  await prisma.profileMeasurement.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  // ============================================================
  // DEMO USER (login: demo@example.com / password1234)
  // ============================================================
  const passwordHash = await bcrypt.hash("password1234", 10)

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      password_hash: passwordHash,
      must_change_password: false,
      profile: {
        create: {
          username: "demo_user",
          full_name: "Demo User",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
        },
      },
    },
  })
  console.log(`✅ Created demo user: ${demoUser.email}`)

  // ============================================================
  // MUSCLE GROUPS
  // ============================================================
  const muscleGroupIds = new Map<string, string>()
  for (const mg of muscleGroups) {
    const created = await prisma.muscleGroup.create({
      data: { name: mg.name, is_default: true },
    })
    muscleGroupIds.set(mg.name, created.id)
  }
  console.log(`✅ Created ${muscleGroupIds.size} muscle groups`)

  // ============================================================
  // EXERCISES + MUSCLE GROUP LINKS
  // ============================================================
  const exerciseIds = new Map<string, string>()
  for (const exercise of exercises) {
    const primary = exercise.links.find((link) => link.isPrimary)
    const created = await prisma.exercise.create({
      data: {
        name: exercise.name,
        instructions: exercise.instructions,
        is_default: true,
        primary_muscle_group_id: primary
          ? muscleGroupIds.get(primary.muscleGroup)
          : null,
        exercise_muscle_groups: {
          create: exercise.links.map((link) => ({
            muscle_group_id: muscleGroupIds.get(link.muscleGroup)!,
            is_primary: link.isPrimary,
            incidence_level: link.incidenceLevel,
          })),
        },
      },
    })
    exerciseIds.set(exercise.name, created.id)
  }
  console.log(`✅ Created ${exerciseIds.size} exercises`)

  // ============================================================
  // DEFAULT MESOCYCLE TEMPLATES
  // ============================================================
  for (const template of templates) {
    const created = await prisma.mesocycleTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        duration_weeks: template.durationWeeks,
        is_default: true,
        goals: {
          create: template.goals.map((goal) => ({
            goal_type: goal.goalType,
            priority: goal.priority,
          })),
        },
        muscle_focus: {
          create: template.muscleFocus.map((focus) => ({
            muscle_group_id: muscleGroupIds.get(focus.muscleGroupName)!,
            focus_level: focus.focusLevel,
          })),
        },
        sessions: {
          create: template.sessions.map((session) => ({
            name: session.name,
            description: session.description,
            day_of_week: session.dayOfWeek,
            estimated_duration_minutes: session.estimatedDurationMinutes,
            is_default: true,
            template_session_exercises: {
              create: session.exercises.map((se) => ({
                exercise_id: exerciseIds.get(se.exerciseName)!,
                sets: se.sets,
                reps: se.reps,
                rir: se.rir,
                rest_between_sets: se.restBetweenSets,
                rest_after_exercise: se.restAfterExercise,
                notes: se.notes,
                order_index: se.orderIndex,
              })),
            },
          })),
        },
      },
    })
    console.log(`✅ Created template: ${created.name}`)
  }

  // ============================================================
  // DEMO MOCK DATA: MESOCYCLES + SESSIONS + WORKOUT LOGS
  // ============================================================

  type MockExerciseDef = {
    exerciseName: string
    sets: number
    reps: number
    rir?: number | null
  }

  type MockSessionDef = {
    name: string
    description?: string
    dayOfWeek: number
    durationMinutes: number
    exercises: MockExerciseDef[]
  }

  type MockMesocycleDef = {
    name: string
    description?: string
    status: "planned" | "active" | "completed"
    goal: { goalType: string; notes?: string } | null
    muscleFocus: string[]
    startDate: string
    endDate: string
    sessions: MockSessionDef[]
    logs: {
      weekOffset: number
      sessionIndex: number
      rating?: number
      notes?: string
    }[]
  }

  function addDays(isoDate: string, days: number): Date {
    const [y, m, d] = isoDate.split("-").map(Number)
    const date = new Date(y, m - 1, d, 12, 0, 0)
    date.setDate(date.getDate() + days)
    return date
  }

  function dateAt(date: Date, hour: number): Date {
    const d = new Date(date)
    d.setHours(hour, 0, 0, 0)
    return d
  }

  // Cargas de arranque por ejercicio para mockear progresión realista.
  const BASE_WEIGHT: Record<string, number | null> = {
    Squat: 60,
    "Front Squat": 55,
    "Bench Press": 60,
    "Incline Bench Press": 50,
    "Decline Bench Press": 55,
    Deadlift: 80,
    "Romanian Deadlift": 50,
    "Barbell Row": 50,
    "Lat Pulldown": 45,
    "Pull-up": null,
    "Overhead Press": 35,
    "Lateral Raise": 10,
    "Dumbbell Curl": 12.5,
    "Hammer Curl": 14,
    "Tricep Extension": 20,
    "Skull Crusher": 20,
    "Dumbbell Fly": 14,
    Dips: null,
    "Face Pull": 20,
    "Leg Press": 90,
    "Leg Extension": 35,
    "Leg Curl": 30,
    "Calf Raise": 25,
    "Ab Crunch": null,
    "Russian Twist": null,
  }

  const fullBodyA: MockSessionDef = {
    name: "Full Body A",
    description: "Movimientos compuestos básicos",
    dayOfWeek: 1,
    durationMinutes: 60,
    exercises: [
      { exerciseName: "Squat", sets: 3, reps: 8, rir: 2 },
      { exerciseName: "Bench Press", sets: 3, reps: 8, rir: 2 },
      { exerciseName: "Barbell Row", sets: 3, reps: 10, rir: 1 },
      { exerciseName: "Lateral Raise", sets: 3, reps: 12, rir: 1 },
      { exerciseName: "Tricep Extension", sets: 3, reps: 12, rir: 1 },
      { exerciseName: "Dumbbell Curl", sets: 3, reps: 12, rir: 1 },
    ],
  }

  const fullBodyB: MockSessionDef = {
    name: "Full Body B",
    description: "Rutina alternativa de cuerpo completo",
    dayOfWeek: 3,
    durationMinutes: 60,
    exercises: [
      { exerciseName: "Deadlift", sets: 3, reps: 8, rir: 2 },
      { exerciseName: "Incline Bench Press", sets: 3, reps: 10, rir: 2 },
      { exerciseName: "Pull-up", sets: 3, reps: 8, rir: 1 },
      { exerciseName: "Overhead Press", sets: 3, reps: 10, rir: 2 },
      { exerciseName: "Hammer Curl", sets: 3, reps: 12, rir: 1 },
      { exerciseName: "Ab Crunch", sets: 3, reps: 20, rir: 1 },
    ],
  }

  const fullBodyC: MockSessionDef = {
    name: "Full Body C",
    description: "Tercer estímulo semanal de cuerpo completo",
    dayOfWeek: 5,
    durationMinutes: 60,
    exercises: [
      { exerciseName: "Front Squat", sets: 3, reps: 8, rir: 2 },
      { exerciseName: "Decline Bench Press", sets: 3, reps: 10, rir: 2 },
      { exerciseName: "Lat Pulldown", sets: 3, reps: 10, rir: 2 },
      { exerciseName: "Romanian Deadlift", sets: 3, reps: 10, rir: 2 },
      { exerciseName: "Skull Crusher", sets: 3, reps: 12, rir: 1 },
      { exerciseName: "Russian Twist", sets: 3, reps: 20, rir: 1 },
    ],
  }

  const pushDay: MockSessionDef = {
    name: "Push Day",
    description: "Pecho, hombros y tríceps",
    dayOfWeek: 1,
    durationMinutes: 75,
    exercises: [
      { exerciseName: "Bench Press", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Incline Bench Press", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Dumbbell Fly", sets: 3, reps: 12, rir: 1 },
      { exerciseName: "Overhead Press", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Lateral Raise", sets: 4, reps: 15, rir: 1 },
      { exerciseName: "Dips", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Skull Crusher", sets: 4, reps: 12, rir: 1 },
    ],
  }

  const pullDay: MockSessionDef = {
    name: "Pull Day",
    description: "Espalda y bíceps",
    dayOfWeek: 3,
    durationMinutes: 75,
    exercises: [
      { exerciseName: "Deadlift", sets: 4, reps: 8, rir: 1 },
      { exerciseName: "Barbell Row", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Lat Pulldown", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Pull-up", sets: 4, reps: 8, rir: 1 },
      { exerciseName: "Dumbbell Curl", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Hammer Curl", sets: 3, reps: 12, rir: 1 },
      { exerciseName: "Face Pull", sets: 4, reps: 15, rir: 1 },
    ],
  }

  const legDay: MockSessionDef = {
    name: "Leg Day",
    description: "Cuádriceps, femorales y gemelos",
    dayOfWeek: 5,
    durationMinutes: 75,
    exercises: [
      { exerciseName: "Squat", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Leg Press", sets: 4, reps: 12, rir: 1 },
      { exerciseName: "Leg Extension", sets: 3, reps: 15, rir: 1 },
      { exerciseName: "Leg Curl", sets: 3, reps: 12, rir: 1 },
      { exerciseName: "Romanian Deadlift", sets: 3, reps: 10, rir: 1 },
      { exerciseName: "Calf Raise", sets: 4, reps: 15, rir: 1 },
    ],
  }

  const upperA: MockSessionDef = {
    name: "Upper Body A",
    description: "Torso A de definición",
    dayOfWeek: 1,
    durationMinutes: 65,
    exercises: [
      { exerciseName: "Bench Press", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Incline Bench Press", sets: 3, reps: 12, rir: 2 },
      { exerciseName: "Lateral Raise", sets: 4, reps: 15, rir: 1 },
      { exerciseName: "Tricep Extension", sets: 3, reps: 15, rir: 2 },
      { exerciseName: "Dumbbell Curl", sets: 3, reps: 12, rir: 2 },
    ],
  }

  const lowerA: MockSessionDef = {
    name: "Lower Body A",
    description: "Piernas A de definición",
    dayOfWeek: 2,
    durationMinutes: 65,
    exercises: [
      { exerciseName: "Squat", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Romanian Deadlift", sets: 3, reps: 12, rir: 2 },
      { exerciseName: "Leg Press", sets: 4, reps: 12, rir: 1 },
      { exerciseName: "Leg Curl", sets: 3, reps: 15, rir: 2 },
      { exerciseName: "Calf Raise", sets: 4, reps: 20, rir: 1 },
    ],
  }

  const upperB: MockSessionDef = {
    name: "Upper Body B",
    description: "Torso B de definición",
    dayOfWeek: 4,
    durationMinutes: 65,
    exercises: [
      { exerciseName: "Pull-up", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Barbell Row", sets: 4, reps: 10, rir: 1 },
      { exerciseName: "Dumbbell Fly", sets: 3, reps: 12, rir: 2 },
      { exerciseName: "Overhead Press", sets: 3, reps: 10, rir: 2 },
      { exerciseName: "Hammer Curl", sets: 3, reps: 12, rir: 2 },
    ],
  }

  const lowerB: MockSessionDef = {
    name: "Lower Body B",
    description: "Piernas B de definición",
    dayOfWeek: 5,
    durationMinutes: 65,
    exercises: [
      { exerciseName: "Deadlift", sets: 4, reps: 6, rir: 2 },
      { exerciseName: "Leg Extension", sets: 4, reps: 12, rir: 1 },
      { exerciseName: "Leg Curl", sets: 4, reps: 12, rir: 1 },
      { exerciseName: "Ab Crunch", sets: 3, reps: 20, rir: 1 },
      { exerciseName: "Calf Raise", sets: 4, reps: 20, rir: 1 },
    ],
  }

  const demoMesocycles: MockMesocycleDef[] = [
    {
      name: "Mesociclo Fuerza Básica",
      description: "Bloque de fuerza fundamental de 8 semanas (3 días/semana).",
      status: "completed",
      goal: { goalType: "strength", notes: "Subir los básicos: sentadilla, press y peso muerto." },
      muscleFocus: ["Legs", "Chest", "Back"],
      startDate: "2026-05-11",
      endDate: "2026-07-05",
      sessions: [fullBodyA, fullBodyB, fullBodyC],
      logs: [
        { weekOffset: 0, sessionIndex: 0, rating: 5, notes: "Arrancamos el bloque. Buena técnica en sentadilla." },
        { weekOffset: 0, sessionIndex: 1, rating: 4 },
        { weekOffset: 0, sessionIndex: 2, rating: 5 },
        { weekOffset: 6, sessionIndex: 0, rating: 5, notes: "PR de 100 kg en sentadilla." },
        { weekOffset: 6, sessionIndex: 1, rating: 4, notes: "Peso muerto pesado, último set con mucha fatiga." },
        { weekOffset: 6, sessionIndex: 2, rating: 5 },
        { weekOffset: 7, sessionIndex: 0, rating: 5 },
        { weekOffset: 7, sessionIndex: 1, rating: 5, notes: "Última semana. Cerramos el bloque con todo." },
        { weekOffset: 7, sessionIndex: 2, rating: 5 },
      ],
    },
    {
      name: "Mesociclo Hipertrofia",
      description: "Bloque de volumen alto Push/Pull/Legs.",
      status: "active",
      goal: { goalType: "hypertrophy", notes: "Enfocar en rango de 8-12 reps con RIR bajo." },
      muscleFocus: ["Chest", "Back", "Shoulders", "Arms"],
      startDate: "2026-08-31",
      endDate: "2026-10-25",
      sessions: [pushDay, pullDay, legDay],
      logs: [
        { weekOffset: 0, sessionIndex: 0, rating: 4 },
        { weekOffset: 0, sessionIndex: 1, rating: 5 },
        { weekOffset: 0, sessionIndex: 2, rating: 4 },
        { weekOffset: 1, sessionIndex: 0, rating: 5, notes: "Bombeo enorme en pecho." },
        { weekOffset: 1, sessionIndex: 1, rating: 4 },
        { weekOffset: 1, sessionIndex: 2, rating: 5, notes: "Sentadilla liviana, piernas respondieron bien." },
        { weekOffset: 2, sessionIndex: 0, rating: 5 },
      ],
    },
    {
      name: "Mesociclo Definición",
      description: "Bloque de definición con más series y menos descanso.",
      status: "planned",
      goal: { goalType: "fat_loss", notes: "Mantener fuerza, reducir descansos y sumar cardio." },
      muscleFocus: ["Legs", "Chest", "Back", "Core"],
      startDate: "2026-10-26",
      endDate: "2026-12-13",
      sessions: [upperA, lowerA, upperB, lowerB],
      logs: [],
    },
  ]

  for (const mc of demoMesocycles) {
    const mesocycle = await prisma.mesocycle.create({
      data: {
        user_id: demoUser.id,
        name: mc.name,
        description: mc.description,
        start_date: addDays(mc.startDate, 0),
        end_date: addDays(mc.endDate, 0),
        status: mc.status,
        mesocycle_goals: mc.goal
          ? { create: [{ goal_type: mc.goal.goalType, notes: mc.goal.notes ?? null }] }
          : undefined,
        mesocycle_muscle_group_focus: {
          create: mc.muscleFocus
            .filter((name) => muscleGroupIds.has(name))
            .map((name, i) => ({
              muscle_group_id: muscleGroupIds.get(name)!,
              priority: 10 - i,
            })),
        },
      },
    })

    const createdSessions: { id: string; sessionDef: MockSessionDef }[] = []
    for (const sessionDef of mc.sessions) {
      const firstDate = addDays(mc.startDate, sessionDef.dayOfWeek - 1)
      const session = await prisma.trainingSession.create({
        data: {
          mesocycle_id: mesocycle.id,
          name: sessionDef.name,
          description: sessionDef.description,
          day_of_week: sessionDef.dayOfWeek,
          duration_minutes: sessionDef.durationMinutes,
          status: mc.status === "completed" ? "completed" : "planned",
          scheduled_date: firstDate,
          completed_date: mc.status === "completed" ? firstDate : null,
          session_exercises: {
            create: sessionDef.exercises.map((ex, i) => ({
              exercise_id: exerciseIds.get(ex.exerciseName)!,
              sets: ex.sets,
              reps: ex.reps,
              rir: ex.rir ?? null,
              rest_between_sets: 90,
              rest_after_exercise: 120,
              order_index: i + 1,
            })),
          },
        },
        select: { id: true },
      })
      createdSessions.push({ id: session.id, sessionDef })
    }

    for (const log of mc.logs) {
      const { id: sessionId, sessionDef } = createdSessions[log.sessionIndex]
      const logDate = addDays(mc.startDate, log.weekOffset * 7 + sessionDef.dayOfWeek - 1)
      const startTime = dateAt(logDate, 19)
      const endTime = dateAt(logDate, 19 + Math.ceil(sessionDef.durationMinutes / 60))

      await prisma.workoutLog.create({
        data: {
          user_id: demoUser.id,
          mesocycle_id: mesocycle.id,
          training_session_id: sessionId,
          date: logDate,
          start_time: startTime,
          end_time: endTime,
          duration_minutes: sessionDef.durationMinutes,
          notes: log.notes ?? null,
          rating: log.rating ?? null,
          exercise_logs: {
            create: sessionDef.exercises.flatMap((ex) => {
              const base = BASE_WEIGHT[ex.exerciseName] ?? 30
              return Array.from({ length: ex.sets }, (_, i) => ({
                exercise_id: exerciseIds.get(ex.exerciseName)!,
                set_number: i + 1,
                reps: ex.reps,
                weight:
                  base == null
                    ? null
                    : (base + log.weekOffset * 2.5 + i * 2.5).toString(),
                rir: ex.rir ?? null,
                notes: base == null ? "Peso corporal" : null,
              }))
            }),
          },
        },
      })
    }

    console.log(
      `✅ Created demo mesocycle: ${mc.name} (${mc.status}, ${mc.sessions.length} sessions, ${mc.logs.length} workout logs)`
    )
  }

  console.log("✨ Database seed completed successfully!")
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })