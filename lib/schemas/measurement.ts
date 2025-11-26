import { z } from "zod";

/**
 * Form schema for body measurements
 *
 * Used for creating/updating user body measurements with simplified validation
 */
export const measurementFormSchema = z.object({
  date: z.date({
    required_error: "A measurement date is required",
  }),
  weight_kg: z
    .number()
    .positive("Weight must be positive")
    .optional()
    .nullable(),
  body_fat_percentage: z
    .number()
    .min(1, "Minimum 1%")
    .max(50, "Maximum 50%")
    .optional()
    .nullable(),
  chest_cm: z
    .number()
    .positive("Measurement must be positive")
    .optional()
    .nullable(),
  waist_cm: z
    .number()
    .positive("Measurement must be positive")
    .optional()
    .nullable(),
  hips_cm: z
    .number()
    .positive("Measurement must be positive")
    .optional()
    .nullable(),
  arm_left_cm: z
    .number()
    .positive("Measurement must be positive")
    .optional()
    .nullable(),
  arm_right_cm: z
    .number()
    .positive("Measurement must be positive")
    .optional()
    .nullable(),
  thigh_left_cm: z
    .number()
    .positive("Measurement must be positive")
    .optional()
    .nullable(),
  thigh_right_cm: z
    .number()
    .positive("Measurement must be positive")
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Schema for the profile_measurements table
 *
 * This schema represents a historical record of a user's body measurements.
 *
 * Relations:
 * - Belongs to a user (many-to-one)
 */
export const measurementSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: z.string(), // ISO date string
  weight_kg: z.number().positive().optional().nullable(),
  body_fat_percentage: z.number().min(1).max(50).optional().nullable(),
  chest_cm: z.number().positive().optional().nullable(),
  waist_cm: z.number().positive().optional().nullable(),
  hips_cm: z.number().positive().optional().nullable(),
  arm_left_cm: z.number().positive().optional().nullable(),
  arm_right_cm: z.number().positive().optional().nullable(),
  thigh_left_cm: z.number().positive().optional().nullable(),
  thigh_right_cm: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Types exported for use throughout the application
 *
 * - Measurement: Base entity type from main schema
 * - MeasurementFormValues: For form validation and submission
 */
export type Measurement = z.infer<typeof measurementSchema>;
export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;
