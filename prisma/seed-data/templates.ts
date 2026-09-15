// Default mesocycle templates (seeded as is_default).
// Ported from supabase/seed.sql but adapted to the application's current schema:
//  - mesocycle_template_goals use goal_type + priority (target_value/unit/notes are gone).
//  - mesocycle_template_muscle_focus uses focus_level (the old seed called it "priority").
//  - mesocycle_templates use is_public + created_by (nullable for defaults).
//  - default templates have user_id = NULL (shared by all users).

export interface SeedTemplateGoal {
  goalType: string;
  priority: number;
}

export interface SeedTemplateSessionExercise {
  exerciseName: string;
  sets: number;
  reps: number;
  rir: number | null;
  restBetweenSets: number | null;
  restAfterExercise: number | null;
  notes: string | null;
  orderIndex: number;
}

export interface SeedTemplateSession {
  name: string;
  description: string;
  dayOfWeek: number;
  estimatedDurationMinutes: number;
  exercises: SeedTemplateSessionExercise[];
}

export interface SeedTemplate {
  name: string;
  description: string;
  durationWeeks: number;
  goals: SeedTemplateGoal[];
  muscleFocus: { muscleGroupName: string; focusLevel: number }[];
  sessions: SeedTemplateSession[];
}

export const templates: SeedTemplate[] = [
  {
    name: "Beginner Strength Program",
    description:
      "Perfect for beginners focusing on building fundamental strength",
    durationWeeks: 8,
    goals: [
      {
        goalType: "strength",
        priority: 5,
      },
    ],
    muscleFocus: [
      { muscleGroupName: "Chest", focusLevel: 8 },
      { muscleGroupName: "Back", focusLevel: 8 },
      { muscleGroupName: "Legs", focusLevel: 9 },
      { muscleGroupName: "Shoulders", focusLevel: 7 },
      { muscleGroupName: "Core", focusLevel: 6 },
    ],
    sessions: [
      {
        name: "Full Body A",
        description: "Focuses on basic compound movements",
        dayOfWeek: 1,
        estimatedDurationMinutes: 60,
        exercises: [
          { exerciseName: "Squat", sets: 3, reps: 8, rir: 2, restBetweenSets: 120, restAfterExercise: 180, notes: "Focus on form", orderIndex: 1 },
          { exerciseName: "Bench Press", sets: 3, reps: 8, rir: 2, restBetweenSets: 120, restAfterExercise: 180, notes: "Use spotter if needed", orderIndex: 2 },
          { exerciseName: "Barbell Row", sets: 3, reps: 10, rir: 2, restBetweenSets: 90, restAfterExercise: 120, notes: "Keep back straight", orderIndex: 3 },
          { exerciseName: "Lateral Raise", sets: 3, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 90, notes: null, orderIndex: 4 },
          { exerciseName: "Tricep Extension", sets: 3, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 60, notes: null, orderIndex: 5 },
          { exerciseName: "Dumbbell Curl", sets: 3, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 60, notes: null, orderIndex: 6 },
        ],
      },
      {
        name: "Full Body B",
        description: "Alternative full body routine",
        dayOfWeek: 3,
        estimatedDurationMinutes: 60,
        exercises: [
          { exerciseName: "Deadlift", sets: 3, reps: 8, rir: 2, restBetweenSets: 180, restAfterExercise: 240, notes: "Focus on hip hinge", orderIndex: 1 },
          { exerciseName: "Incline Bench Press", sets: 3, reps: 10, rir: 2, restBetweenSets: 120, restAfterExercise: 180, notes: null, orderIndex: 2 },
          { exerciseName: "Pull-up", sets: 3, reps: 8, rir: 1, restBetweenSets: 120, restAfterExercise: 180, notes: "Assisted if needed", orderIndex: 3 },
          { exerciseName: "Overhead Press", sets: 3, reps: 10, rir: 2, restBetweenSets: 90, restAfterExercise: 120, notes: null, orderIndex: 4 },
          { exerciseName: "Hammer Curl", sets: 3, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 60, notes: null, orderIndex: 5 },
          { exerciseName: "Ab Crunch", sets: 3, reps: 15, rir: 1, restBetweenSets: 60, restAfterExercise: 0, notes: null, orderIndex: 6 },
        ],
      },
      {
        name: "Full Body C",
        description: "Third full body workout with different emphasis",
        dayOfWeek: 5,
        estimatedDurationMinutes: 60,
        exercises: [
          { exerciseName: "Front Squat", sets: 3, reps: 8, rir: 2, restBetweenSets: 120, restAfterExercise: 180, notes: "Keep chest up", orderIndex: 1 },
          { exerciseName: "Decline Bench Press", sets: 3, reps: 10, rir: 2, restBetweenSets: 120, restAfterExercise: 180, notes: null, orderIndex: 2 },
          { exerciseName: "Lat Pulldown", sets: 3, reps: 10, rir: 2, restBetweenSets: 90, restAfterExercise: 120, notes: null, orderIndex: 3 },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: 10, rir: 2, restBetweenSets: 90, restAfterExercise: 120, notes: "Keep knees slightly bent", orderIndex: 4 },
          { exerciseName: "Skull Crusher", sets: 3, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 60, notes: null, orderIndex: 5 },
          { exerciseName: "Russian Twist", sets: 3, reps: 15, rir: 1, restBetweenSets: 60, restAfterExercise: 0, notes: null, orderIndex: 6 },
        ],
      },
    ],
  },
  {
    name: "Hypertrophy Focus",
    description: "High volume program designed for muscle growth",
    durationWeeks: 10,
    goals: [
      {
        goalType: "hypertrophy",
        priority: 5,
      },
    ],
    muscleFocus: [
      { muscleGroupName: "Chest", focusLevel: 9 },
      { muscleGroupName: "Back", focusLevel: 8 },
      { muscleGroupName: "Legs", focusLevel: 8 },
      { muscleGroupName: "Shoulders", focusLevel: 9 },
      { muscleGroupName: "Arms", focusLevel: 9 },
      { muscleGroupName: "Biceps", focusLevel: 8 },
      { muscleGroupName: "Triceps", focusLevel: 8 },
      { muscleGroupName: "Core", focusLevel: 7 },
    ],
    sessions: [
      {
        name: "Push Day",
        description: "Chest, shoulders, and triceps",
        dayOfWeek: 1,
        estimatedDurationMinutes: 75,
        exercises: [
          { exerciseName: "Bench Press", sets: 4, reps: 10, rir: 1, restBetweenSets: 90, restAfterExercise: 120, notes: null, orderIndex: 1 },
          { exerciseName: "Incline Bench Press", sets: 4, reps: 10, rir: 1, restBetweenSets: 90, restAfterExercise: 120, notes: null, orderIndex: 2 },
          { exerciseName: "Dumbbell Fly", sets: 3, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 120, notes: "Squeeze at the top", orderIndex: 3 },
          { exerciseName: "Overhead Press", sets: 4, reps: 10, rir: 1, restBetweenSets: 90, restAfterExercise: 120, notes: null, orderIndex: 4 },
          { exerciseName: "Lateral Raise", sets: 4, reps: 15, rir: 1, restBetweenSets: 60, restAfterExercise: 90, notes: null, orderIndex: 5 },
          { exerciseName: "Dips", sets: 4, reps: 10, rir: 1, restBetweenSets: 90, restAfterExercise: 90, notes: "Full range of motion", orderIndex: 6 },
          { exerciseName: "Skull Crusher", sets: 4, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 0, notes: null, orderIndex: 7 },
        ],
      },
      {
        name: "Pull Day",
        description: "Back and biceps",
        dayOfWeek: 3,
        estimatedDurationMinutes: 75,
        exercises: [],
      },
      {
        name: "Leg Day",
        description: "Quads, hamstrings, calves",
        dayOfWeek: 5,
        estimatedDurationMinutes: 75,
        exercises: [],
      },
    ],
  },
  {
    name: "Power Building",
    description: "Mix of strength and hypertrophy training",
    durationWeeks: 12,
    goals: [
      { goalType: "strength", priority: 5 },
      { goalType: "hypertrophy", priority: 3 },
    ],
    muscleFocus: [
      { muscleGroupName: "Chest", focusLevel: 9 },
      { muscleGroupName: "Back", focusLevel: 9 },
      { muscleGroupName: "Legs", focusLevel: 10 },
      { muscleGroupName: "Quadriceps", focusLevel: 9 },
      { muscleGroupName: "Glutes", focusLevel: 8 },
      { muscleGroupName: "Shoulders", focusLevel: 8 },
      { muscleGroupName: "Core", focusLevel: 7 },
      { muscleGroupName: "Arms", focusLevel: 6 },
    ],
    sessions: [
      { name: "Strength Upper", description: "Heavy compound movements for upper body", dayOfWeek: 1, estimatedDurationMinutes: 90, exercises: [] },
      { name: "Strength Lower", description: "Heavy compound movements for lower body", dayOfWeek: 2, estimatedDurationMinutes: 90, exercises: [] },
      { name: "Hypertrophy Upper", description: "Higher volume upper body training", dayOfWeek: 4, estimatedDurationMinutes: 75, exercises: [] },
      { name: "Hypertrophy Lower", description: "Higher volume lower body training", dayOfWeek: 5, estimatedDurationMinutes: 75, exercises: [] },
    ],
  },
  {
    name: "Upper/Lower Split",
    description: "Four-day split focusing on upper and lower body",
    durationWeeks: 8,
    goals: [],
    muscleFocus: [
      { muscleGroupName: "Chest", focusLevel: 8 },
      { muscleGroupName: "Back", focusLevel: 8 },
      { muscleGroupName: "Legs", focusLevel: 8 },
      { muscleGroupName: "Shoulders", focusLevel: 8 },
      { muscleGroupName: "Arms", focusLevel: 7 },
      { muscleGroupName: "Core", focusLevel: 6 },
      { muscleGroupName: "Glutes", focusLevel: 7 },
      { muscleGroupName: "Hamstrings", focusLevel: 7 },
    ],
    sessions: [
      { name: "Upper Body A", description: "First upper body session of the week", dayOfWeek: 1, estimatedDurationMinutes: 70, exercises: [] },
      { name: "Lower Body A", description: "First lower body session of the week", dayOfWeek: 2, estimatedDurationMinutes: 70, exercises: [] },
      { name: "Upper Body B", description: "Second upper body session of the week", dayOfWeek: 4, estimatedDurationMinutes: 70, exercises: [] },
      { name: "Lower Body B", description: "Second lower body session of the week", dayOfWeek: 5, estimatedDurationMinutes: 70, exercises: [] },
    ],
  },
  {
    name: "Custom Split",
    description: "Personal five-day split routine",
    durationWeeks: 6,
    goals: [],
    muscleFocus: [
      { muscleGroupName: "Chest", focusLevel: 9 },
      { muscleGroupName: "Back", focusLevel: 8 },
      { muscleGroupName: "Shoulders", focusLevel: 10 },
      { muscleGroupName: "Arms", focusLevel: 9 },
      { muscleGroupName: "Core", focusLevel: 8 },
      { muscleGroupName: "Legs", focusLevel: 7 },
      { muscleGroupName: "Side Delts", focusLevel: 9 },
      { muscleGroupName: "Biceps", focusLevel: 8 },
      { muscleGroupName: "Triceps", focusLevel: 8 },
    ],
    sessions: [
      {
        name: "Chest & Triceps",
        description: "Focus on chest and triceps development",
        dayOfWeek: 1,
        estimatedDurationMinutes: 65,
        exercises: [
          { exerciseName: "Bench Press", sets: 4, reps: 8, rir: 2, restBetweenSets: 150, restAfterExercise: 180, notes: "Heavy bench day", orderIndex: 1 },
          { exerciseName: "Incline Bench Press", sets: 4, reps: 10, rir: 2, restBetweenSets: 120, restAfterExercise: 150, notes: null, orderIndex: 2 },
          { exerciseName: "Dumbbell Fly", sets: 3, reps: 12, rir: 1, restBetweenSets: 90, restAfterExercise: 120, notes: null, orderIndex: 3 },
          { exerciseName: "Dips", sets: 4, reps: 10, rir: 1, restBetweenSets: 120, restAfterExercise: 120, notes: null, orderIndex: 4 },
          { exerciseName: "Tricep Extension", sets: 4, reps: 12, rir: 1, restBetweenSets: 60, restAfterExercise: 60, notes: null, orderIndex: 5 },
        ],
      },
      { name: "Back & Biceps", description: "Focus on back and biceps development", dayOfWeek: 2, estimatedDurationMinutes: 65, exercises: [] },
      { name: "Shoulders", description: "Dedicated shoulder development day", dayOfWeek: 3, estimatedDurationMinutes: 50, exercises: [] },
      { name: "Legs", description: "Complete leg development workout", dayOfWeek: 4, estimatedDurationMinutes: 70, exercises: [] },
      { name: "Arms & Core", description: "Focused session on arms and core", dayOfWeek: 5, estimatedDurationMinutes: 60, exercises: [] },
    ],
  },
]