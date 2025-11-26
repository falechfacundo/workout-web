import { z } from "zod";

/**
 * Form schema for user profiles
 *
 * Used for creating/updating user profiles with simplified validation
 */
export const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional()
    .nullable(),
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional()
    .nullable(),
  weight_kg: z
    .number()
    .positive("Weight must be positive")
    .optional()
    .nullable(),
  height_cm: z
    .number()
    .positive("Height must be positive")
    .optional()
    .nullable(),
  birth_date: z.date().optional().nullable(),
  sex: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .nullable(),
  experience_level: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional()
    .nullable(),
  training_goal: z
    .enum([
      "strength",
      "hypertrophy",
      "endurance",
      "weight_loss",
      "general_fitness",
      "sport_specific",
    ])
    .optional()
    .nullable(),
  weekly_availability: z
    .number()
    .min(1, "Must be at least 1 day")
    .max(7, "Cannot exceed 7 days")
    .optional()
    .nullable(),
  session_duration_preference: z
    .number()
    .min(10, "Session must be at least 10 minutes")
    .optional()
    .nullable(),
  preferred_unit: z.enum(["kg", "lb"]).default("kg"),
});

/**
 * Schema for the profiles table
 *
 * This schema represents a user profile with demographic and training preference data.
 *
 * Relations:
 * - Belongs to a user (one-to-one)
 * - Has many measurements (one-to-many)
 * - Has many workout logs (one-to-many)
 * - Has many mesocycles (one-to-many)
 */
export const profileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  username: z.string().min(3).nullable(),
  full_name: z.string().nullable(),
  weight_kg: z.number().positive().nullable(),
  height_cm: z.number().positive().nullable(),
  birth_date: z.string().nullable(),
  sex: z.enum(["male", "female", "other", "prefer_not_to_say"]).nullable(),
  experience_level: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .nullable(),
  training_goal: z
    .enum([
      "strength",
      "hypertrophy",
      "endurance",
      "weight_loss",
      "general_fitness",
      "sport_specific",
    ])
    .nullable(),
  weekly_availability: z.number().min(1).max(7).nullable(),
  session_duration_preference: z.number().min(10).nullable(),
  preferred_unit: z.enum(["kg", "lb"]).default("kg"),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Types exported for use throughout the application
 *
 * - Profile: Base entity type from main schema
 * - ProfileFormValues: For form validation and submission
 */
export type Profile = z.infer<typeof profileSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
