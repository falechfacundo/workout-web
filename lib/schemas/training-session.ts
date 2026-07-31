import { z } from "zod";

export const trainingSessionFormSchema = z.object({
  id: z.string().optional(),
  mesocycle_id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  day_of_week: z.coerce.number().min(0).max(6).optional(),
  duration_minutes: z.coerce.number().min(1).optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned"),
  scheduled_date: z.string().optional(),
  completed_date: z.string().optional(),
});

// Schema for the training_sessions table
export const trainingSessionSchema = z.object({
  id: z.string().uuid(),
  mesocycle_id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  day_of_week: z.number().int().min(0).max(6).optional().nullable(),
  duration_minutes: z.number().int().optional().nullable(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned"),
  scheduled_date: z.string().optional().nullable(),
  completed_date: z.string().optional().nullable(),
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
