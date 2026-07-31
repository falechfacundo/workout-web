import { z } from "zod";

/**
 * Schema for exercise_logs table
 *
 * This schema represents a specific set of an exercise performed during a workout.
 * Each row is one set: exercise + set_number + reps + weight.
 *
 * Relations:
 * - Belongs to a workout_log (many-to-one via workout_log_id)
 * - References an exercise (many-to-one via exercise_id)
 */
export const exerciseLogSetSchema = z.object({
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
 * Form schema for exercise log sets
 *
 * Used for creating/updating sets with simplified validation
 */
export const exerciseLogSetFormSchema = z.object({
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
 * Schema for exercise log set with calculated fields
 */
export const exerciseLogSetWithCalculatedFieldsSchema = exerciseLogSetSchema.extend({
  estimated_1rm: z.number().positive().optional(),
  volume: z.number().positive().optional(),
});

/**
 * Types exported for use throughout the application
 */
export type ExerciseLogSet = z.infer<typeof exerciseLogSetSchema>;
export type ExerciseLogSetFormValues = z.infer<typeof exerciseLogSetFormSchema>;
export type ExerciseLogSetWithCalculatedFields = z.infer<
  typeof exerciseLogSetWithCalculatedFieldsSchema
>;
