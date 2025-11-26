import { z } from "zod";
import { workoutSetSchema, type WorkoutSet } from "./workout-set";

/**
 * Schema for exercise_logs table
 *
 * This schema represents a log entry for an exercise performed during a workout session.
 *
 * Relations:
 * - Belongs to a workout_log (many-to-one)
 * - References an exercise (many-to-one)
 * - Has multiple workout_log_sets (one-to-many)
 */
export const exerciseLogSchema = z.object({
  id: z.string().uuid(),
  workout_log_id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  order_index: z.number().int().nonnegative(),
  notes: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Form schema for exercise logs
 *
 * Used for creating/updating exercise logs with simplified validation
 */
export const exerciseLogFormSchema = z.object({
  id: z.string().optional(),
  workout_log_id: z.string(),
  exercise_id: z.string().min(1, "Exercise is required"),
  order_index: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for exercise log with related data
 *
 * Extends the base schema with information about the exercise and sets performed
 */
export const exerciseLogWithRelationsSchema = exerciseLogSchema.extend({
  exercise: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      primary_muscle_group_id: z.string().uuid(),
    })
    .optional(),
  sets: z.array(workoutSetSchema).optional(),
});

/**
 * Types exported for use throughout the application
 *
 * - ExerciseLog: Base entity type from main schema
 * - ExerciseLogFormValues: For form validation and submission
 * - ExerciseLogWithRelations: Extended type with related entities
 */
export type ExerciseLog = z.infer<typeof exerciseLogSchema>;
export type ExerciseLogFormValues = z.infer<typeof exerciseLogFormSchema>;
export type ExerciseLogWithRelations = z.infer<
  typeof exerciseLogWithRelationsSchema
>;
