import { z } from "zod";

// Schema for muscle_groups table
export const muscleGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  is_default: z.boolean().default(false),
  user_id: z.string().uuid().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema for muscle group with incidence level
export const muscleGroupWithIncidenceSchema = muscleGroupSchema.extend({
  incidence_level: z.number().min(1).max(10).optional(),
});

// Form schema for muscle groups
export const muscleGroupFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
});

/**
 * Types exported for use throughout the application
 *
 * - MuscleGroup: Base entity type from main schema
 * - MuscleGroupWithIncidence: Enhanced type with incidence level information
 * - MuscleGroupFormValues: For form validation and submission
 */
export type MuscleGroup = z.infer<typeof muscleGroupSchema>;
export type MuscleGroupWithIncidence = z.infer<
  typeof muscleGroupWithIncidenceSchema
>;
export type MuscleGroupFormValues = z.infer<typeof muscleGroupFormSchema>;
