import { z } from "zod";

/**
 * Form schema for session exercises
 *
 * Used for creating/updating session exercises with simplified validation
 */
export const sessionExerciseFormSchema = z.object({
  id: z.string().optional(),
  training_session_id: z.string(),
  exercise_id: z.string().min(1, "Exercise is required"),
  sets: z.coerce.number().min(1, "At least 1 set is required"),
  reps: z.coerce.number().min(1, "Reps required"),
  rir: z.coerce.number().min(0).max(10).optional(),
  rest_between_sets: z.coerce.number().min(0).optional(),
  rest_after_exercise: z.coerce.number().min(0).optional(),
  order_index: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

// Schema for session_exercises table
export const sessionExerciseSchema = z.object({
  id: z.string().uuid(),
  training_session_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  rir: z.number().int().min(0).max(10).optional().nullable(),
  rest_between_sets: z.number().int().min(0).optional().nullable(),
  rest_after_exercise: z.number().int().min(0).optional().nullable(),
  order_index: z.number().int().nonnegative(),
  notes: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Types exported for use throughout the application
 *
 * - SessionExercise: Base entity type from main schema
 * - SessionExerciseFormValues: For form validation and submission
 */
export type SessionExercise = z.infer<typeof sessionExerciseSchema>;
export type SessionExerciseFormValues = z.infer<
  typeof sessionExerciseFormSchema
>;
