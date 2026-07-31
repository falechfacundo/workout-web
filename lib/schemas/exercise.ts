import { z } from "zod";
import { muscleGroupWithIncidenceSchema } from "./muscle-group";

/**
 * Schema for exercises table
 *
 * This schema represents an exercise entity with its basic attributes.
 *
 * Relations:
 * - Can be created by a user (many-to-one)
 * - Has a primary muscle group (many-to-one)
 * - Can have multiple muscle groups affected (many-to-many through exercise_muscle_groups)
 * - Can be used in session templates and logs
 */
export const exerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  video_url: z.string().url("Must be a valid URL").nullable(),
  primary_muscle_group_id: z.string().uuid(),
  is_default: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: z.string().uuid().nullable(),
});

/**
 * Schema for exercise_muscle_groups table
 *
 * This schema represents the junction table between exercises and muscle groups,
 * with additional metadata like incidence level.
 */
export const exerciseMuscleGroupSchema = z.object({
  id: z.string().uuid(),
  exercise_id: z.string().uuid(),
  muscle_group_id: z.string().uuid(),
  is_primary: z.boolean(),
  incidence_level: z.number().min(1).max(10).default(5),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Schema for exercise with related muscle groups
 *
 * Extends the base schema with information about primary and secondary muscle groups.
 */
export const exerciseWithRelationsSchema = exerciseSchema.extend({
  primary_muscle: muscleGroupWithIncidenceSchema.nullable(),
  secondary_muscle_groups: z.array(muscleGroupWithIncidenceSchema).default([]),
});

/**
 * Form schema for exercises
 *
 * Used for creating/updating exercises with simplified validation
 */
export const exerciseFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  video_url: z.string().url("Must be a valid URL").optional().nullable(),
  primary_muscle_group_id: z
    .string()
    .uuid()
    .min(1, "Primary muscle group is required"),
  secondary_muscle_groups: z.array(z.string().uuid()).default([]),
});

/**
 * Types exported for use throughout the application
 *
 * - Exercise: Base entity type from main schema
 * - ExerciseMuscleGroup: Junction table type between exercises and muscle groups
 * - ExerciseWithRelations: Extended type with related muscle groups
 * - ExerciseFormValues: For form validation and submission
 */
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseMuscleGroup = z.infer<typeof exerciseMuscleGroupSchema>;
export type ExerciseWithRelations = z.infer<typeof exerciseWithRelationsSchema>;
export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;
