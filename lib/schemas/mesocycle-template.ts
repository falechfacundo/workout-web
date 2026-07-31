import { z } from "zod";
import { muscleGroupSchema } from "./muscle-group";
import { trainingSessionTemplateSchema } from "./session-template";
import { profileSchema } from "./profile";

/**
 * Schema for mesocycle_template_goals table
 *
 * This schema represents a goal for a mesocycle template.
 *
 * Relations:
 * - Belongs to a mesocycle template (many-to-one)
 */
export const mesocycleTemplateGoalSchema = z.object({
  id: z.string().uuid().optional(),
  mesocycle_template_id: z.string().uuid().optional(),
  goal_type: z.enum([
    "strength",
    "hypertrophy",
    "endurance",
    "weight_loss",
    "flexibility",
    "muscle_focus",
    "other",
  ]),
  priority: z.number().min(1).max(5).optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Schema for mesocycle_template_muscle_focus table
 *
 * This schema represents the focus on specific muscle groups in a mesocycle template.
 *
 * Relations:
 * - Belongs to a mesocycle template (many-to-one)
 * - References a muscle group (many-to-one)
 */
export const mesocycleTemplateMuscleFocusSchema = z.object({
  id: z.string().uuid().optional(),
  mesocycle_template_id: z.string().uuid().optional(),
  muscle_group_id: z.string().uuid(),
  focus_level: z.number().min(1).max(10).default(5),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Form schema for mesocycle templates
 *
 * Used for creating/updating mesocycle templates with simplified validation
 */
export const mesocycleTemplateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  duration_weeks: z.number().min(1, "Minimum duration is 1 week"),
  is_public: z.boolean().default(false),
  goals: z.array(mesocycleTemplateGoalSchema).optional(),
  muscleFocus: z.array(mesocycleTemplateMuscleFocusSchema).optional(),
});

/**
 * Schema for the mesocycle_templates table
 *
 * This schema represents a template for creating mesocycles.
 *
 * Relations:
 * - Created by a user (many-to-one)
 * - Has many goals (one-to-many)
 * - Has many muscle group focus entries (one-to-many)
 * - Has many training session templates (one-to-many)
 */
export const mesocycleTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  duration_weeks: z.number().min(1, "Minimum duration is 1 week"),
  is_public: z.boolean().default(false),
  created_by: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  goals: z.array(mesocycleTemplateGoalSchema).optional(),
  muscleFocus: z
    .array(
      mesocycleTemplateMuscleFocusSchema.extend({
        muscle_groups: muscleGroupSchema.optional(),
      })
    )
    .min(1, "At least one muscle group focus is required")
    .optional(),
});

/**
 * Schema for mesocycle template with related data
 *
 * Extends the base schema with information about goals, muscle group focus,
 * training sessions, and creator.
 */
export const mesocycleTemplateWithRelationsSchema =
  mesocycleTemplateSchema.extend({
    goals: z.array(mesocycleTemplateGoalSchema).optional(),
    muscleFocus: z
      .array(
        mesocycleTemplateMuscleFocusSchema.extend({
          muscle_groups: muscleGroupSchema.optional(),
        })
      )
      .optional(),
    sessions: z.array(trainingSessionTemplateSchema).optional(),
    creator: profileSchema.optional(),
  });

/**
 * Types exported for use throughout the application
 *
 * - MesocycleTemplate: Base entity type from main schema
 * - MesocycleTemplateFormValues: For form validation and submission
 * - MesocycleTemplateGoal: For mesocycle template goal entities
 * - MesocycleTemplateMuscleFocus: For muscle group focus entities
 * - MesocycleTemplateWithRelations: Extended type with related entities
 */
export type MesocycleTemplate = z.infer<typeof mesocycleTemplateSchema>;
export type MesocycleTemplateFormValues = z.infer<
  typeof mesocycleTemplateFormSchema
>;
export type MesocycleTemplateGoal = z.infer<typeof mesocycleTemplateGoalSchema>;
export type MesocycleTemplateMuscleFocus = z.infer<
  typeof mesocycleTemplateMuscleFocusSchema
>;
export type MesocycleTemplateWithRelations = z.infer<
  typeof mesocycleTemplateWithRelationsSchema
>;
