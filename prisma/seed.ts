import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { muscleGroups } from "./seed-data/muscle-groups"
import { exercises } from "./seed-data/exercises"
import { templates } from "./seed-data/templates"

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
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