import { z } from "zod";
import { exerciseSchema } from "./exercise";

/**
 * Form schema for session templates
 *
 * Used for creating/updating session templates with simplified validation
 */
export const sessionTemplateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  duration_minutes: z.number().min(10, "Minimum duration is 10 minutes"),
  is_public: z.boolean().default(false),
  exercises: z
    .array(
      z.object({
        exercise_id: z.string().min(1, "Exercise is required"),
        sets: z.number().min(1, "Minimum 1 set"),
        reps: z.number().min(1, "Minimum 1 repetition"),
        rir: z.number().min(0).max(10).optional().nullable(),
        rest_between_sets: z.number().min(0, "Cannot be negative"),
        rest_after_exercise: z.number().min(0, "Cannot be negative"),
        notes: z.string().optional().nullable(),
      })
    )
    .min(1, "At least one exercise is required"),
});

/**
 * Schema for template_session_exercises table
 *
 * This schema represents an exercise included in a training session template.
 *
 * Relations:
 * - Belongs to a training session template (many-to-one)
 * - References an exercise (many-to-one)
 */
export const templateSessionExerciseSchema = z.object({
  id: z.string().uuid().optional(),
  training_session_template_id: z.string().uuid().optional(),
  exercise_id: z.string().uuid(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  rir: z.number().int().optional().nullable(),
  rest_between_sets: z.number().int().optional().nullable(),
  rest_after_exercise: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
  order_index: z.number().int().nonnegative(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  exercises: exerciseSchema.optional(),
});

/**
 * Schema for training_session_templates table
 *
 * This schema represents a template for a training session that can be used to create actual sessions.
 *
 * Relations:
 * - Can belong to a mesocycle template (many-to-one)
 * - Created by a user (many-to-one)
 * - Has many template session exercises (one-to-many)
 */
export const trainingSessionTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  mesocycle_template_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  estimated_duration_minutes: z.number().int().optional().nullable(),
  is_default: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  template_session_exercises: z.array(templateSessionExerciseSchema).optional(),
});

/**
 * Types exported for use throughout the application
 *
 * - TrainingSessionTemplate: Base entity type for training session templates
 * - TemplateSessionExercise: For exercise entries in a session template
 * - SessionTemplateFormValues: For form validation and submission
 */
export type TrainingSessionTemplate = z.infer<
  typeof trainingSessionTemplateSchema
>;
export type TemplateSessionExercise = z.infer<
  typeof templateSessionExerciseSchema
>;
export type SessionTemplateFormValues = z.infer<
  typeof sessionTemplateFormSchema
>;
