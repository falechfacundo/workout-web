import { z } from "zod";

/**
 * Schema for workout_log_sets table
 *
 * This schema represents a specific set of an exercise performed during a workout.
 * It captures the actual performance metrics like reps, weight, and RPE.
 *
 * Relations:
 * - Belongs to an exercise_log (many-to-one)
 * - Indirectly related to an exercise through exercise_log
 * - Indirectly related to a workout_log through exercise_log
 */
export const workoutSetSchema = z.object({
  id: z.string().uuid(),
  exercise_log_id: z.string().uuid(),
  set_number: z.number().int().positive(),
  reps_performed: z.number().int().positive(),
  weight_lifted: z.number().nonnegative(),
  weight_unit: z.enum(["kg", "lb"]).default("kg"),
  rir_achieved: z.number().min(0).max(10).optional().nullable(),
  rpe: z.number().min(1).max(10).optional().nullable(),
  rest_taken_seconds: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Form schema for workout sets
 *
 * Used for creating/updating workout sets with simplified validation
 */
export const workoutSetFormSchema = z.object({
  id: z.string().optional(),
  exercise_log_id: z.string(),
  set_number: z.coerce.number().positive().optional(),
  reps_performed: z.coerce.number().positive("At least 1 rep is required"),
  weight_lifted: z.coerce.number().nonnegative("Weight cannot be negative"),
  weight_unit: z.enum(["kg", "lb"]).default("kg"),
  rir_achieved: z.coerce.number().min(0).max(10).optional(),
  rpe: z.coerce.number().min(1).max(10).optional(),
  rest_taken_seconds: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for workout set with calculated fields
 *
 * Extends the base schema with calculated metrics and related information
 */
export const workoutSetWithCalculatedFieldsSchema = workoutSetSchema.extend({
  estimated_1rm: z.number().positive().optional(),
  volume: z.number().positive().optional(),
  relative_intensity: z.number().positive().optional(),
});

/**
 * Types exported for use throughout the application
 *
 * - WorkoutSet: Base entity type from main schema
 * - WorkoutSetFormValues: For form validation and submission
 * - WorkoutSetWithCalculatedFields: Extended type with calculated metrics
 */
export type WorkoutSet = z.infer<typeof workoutSetSchema>;
export type WorkoutSetFormValues = z.infer<typeof workoutSetFormSchema>;
export type WorkoutSetWithCalculatedFields = z.infer<
  typeof workoutSetWithCalculatedFieldsSchema
>;
