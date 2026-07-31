import { z } from "zod";
import { exerciseLogSchema } from "./exercise-log";

/**
 * Form schema for workout logs
 *
 * Used for creating/updating workout logs with simplified validation
 */
export const workoutLogFormSchema = z.object({
  user_id: z.string(),
  date: z.string().optional(),
  mesocycle_id: z.string().optional(),
  training_session_id: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for the workout_logs table
 *
 * This schema represents a complete workout session with its metadata.
 *
 * Relations:
 * - Belongs to a user (many-to-one)
 * - Can be part of a mesocycle (many-to-one, optional)
 * - Can be based on a training session (many-to-one, optional)
 * - Has multiple exercise_logs (one-to-many)
 */
export const workoutLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  mesocycle_id: z.string().uuid().optional().nullable(),
  training_session_id: z.string().uuid().optional().nullable(),
  date: z.string(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  duration_minutes: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Types exported for use throughout the application
 *
 * - WorkoutLog: Base entity type from main schema
 * - WorkoutLogFormValues: For form validation and submission
 */
export type WorkoutLog = z.infer<typeof workoutLogSchema>;
export type WorkoutLogFormValues = z.infer<typeof workoutLogFormSchema>;

/**
 * Schema for workout log with related data
 *
 * Extends the base schema with information about the exercises performed
 * and related entities like mesocycle and training session
 */
export const workoutLogWithRelationsSchema = workoutLogSchema.extend({
  exercise_logs: z.array(exerciseLogSchema).optional(),
  mesocycle: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
  session: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
});

/**
 * - WorkoutLogWithRelations: Extended type with related entities
 */
export type WorkoutLogWithRelations = z.infer<
  typeof workoutLogWithRelationsSchema
>;
