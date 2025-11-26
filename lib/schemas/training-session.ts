import { z } from "zod";

export const trainingSessionFormSchema = z.object({
  id: z.string().optional(),
  mesocycle_id: z.string(),
  name: z.string().min(1, "Name is required"),
  day_of_week: z.coerce.number().min(0).max(6).optional(),
  week_number: z.coerce.number().min(1).optional(),
  notes: z.string().optional(),
});

// Schema for the training_sessions table
export const trainingSessionSchema = z.object({
  id: z.string().uuid(),
  mesocycle_id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  day_of_week: z.number().int().min(0).max(6).optional().nullable(),
  week_number: z.number().int().min(1).optional().nullable(),
  duration_minutes: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Types exported for use throughout the application
 *
 * - TrainingSession: Base entity type from main schema
 * - TrainingSessionFormValues: For form validation and submission
 */
export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export type TrainingSessionFormValues = z.infer<
  typeof trainingSessionFormSchema
>;
