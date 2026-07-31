import { z } from "zod";

/**
 * Schema for exercise_logs table
 *
 * In this schema, exercise_logs represents individual sets performed during a workout.
 * Each row = one set of one exercise within a workout.
 *
 * Relations:
 * - Belongs to a workout_log (many-to-one)
 * - References an exercise (many-to-one)
 */
export const exerciseLogSchema = z.object({
  id: z.string().uuid(),
  workout_log_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  set_number: z.number().int().positive(),
  reps: z.number().int().nonnegative(),
  weight: z.number().nonnegative().optional().nullable(),
  rir: z.number().int().min(0).max(10).optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Form schema for exercise logs
 */
export const exerciseLogFormSchema = z.object({
  id: z.string().optional(),
  workout_log_id: z.string(),
  exercise_id: z.string().min(1, "Exercise is required"),
  set_number: z.coerce.number().positive(),
  reps: z.coerce.number().nonnegative("Reps cannot be negative"),
  weight: z.coerce.number().nonnegative("Weight cannot be negative").optional().nullable(),
  rir: z.coerce.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional(),
});

/**
 * Types exported for use throughout the application
 */
export type ExerciseLog = z.infer<typeof exerciseLogSchema>;
export type ExerciseLogFormValues = z.infer<typeof exerciseLogFormSchema>;
