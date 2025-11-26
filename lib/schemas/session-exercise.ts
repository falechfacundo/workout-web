import { z } from "zod";

/**
 * Form schema for session exercises
 *
 * Used for creating/updating session exercises with simplified validation
 */
export const sessionExerciseFormSchema = z.object({
  id: z.string().optional(),
  session_template_id: z.string(),
  exercise_id: z.string().min(1, "Exercise is required"),
  target_sets: z.coerce.number().min(1, "At least 1 set is required"),
  target_reps_min: z.coerce.number().min(1, "Minimum reps required").optional(),
  target_reps_max: z.coerce.number().min(1, "Maximum reps required").optional(),
  target_rir: z.coerce.number().min(0).optional(),
  planned_rest_seconds: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

// Schema for session_exercises table
export const sessionExerciseSchema = z.object({
  id: z.string().uuid(),
  session_template_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  target_sets: z.number().int().min(1),
  target_reps_min: z.number().int().min(1).optional().nullable(),
  target_reps_max: z.number().int().min(1).optional().nullable(),
  target_rir: z.number().min(0).optional().nullable(),
  planned_rest_seconds: z.number().int().min(0).optional().nullable(),
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
