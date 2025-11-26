import { z } from "zod";
import {
  trainingSessionSchema,
  type TrainingSession,
} from "./training-session";
import { muscleGroupSchema, type MuscleGroup } from "./muscle-group";

// Schema for mesocycle_goals table
export const mesocycleGoalSchema = z.object({
  id: z.string().uuid().optional(),
  mesocycle_id: z.string().uuid().optional(),
  type: z.enum([
    "strength",
    "hypertrophy",
    "endurance",
    "weight_loss",
    "maintenance",
    "custom",
  ]),
  description: z.string().min(1, "Goal description is required"),
  target_value: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema for mesocycle_muscle_group_focus table
export const mesocycleMuscleGroupFocusSchema = z.object({
  id: z.string().uuid().optional(),
  mesocycle_id: z.string().uuid().optional(),
  muscle_group_id: z.string().uuid(),
  priority: z.number().int().min(1).max(10).default(5),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Form validation schema for form inputs
export const mesocycleFormSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date({
    required_error: "End date is required",
  }),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  goals: z.array(mesocycleGoalSchema).optional(),
  focus_muscle_groups: z.array(z.string().uuid()).optional(),
});

// Schema for the mesocycles table with stringified dates for API
export const mesocycleSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  goals: z.array(mesocycleGoalSchema).optional(),
  focus_muscle_groups: z.array(z.string().uuid()).optional(),
});

// Complex type with relationships for use in stores
export const mesocycleWithRelationsSchema = mesocycleSchema.extend({
  goals: z.array(mesocycleGoalSchema).optional(),
  focus_muscle_groups: z
    .array(
      z.object({
        muscle_group_id: z.string().uuid(),
        muscle_group: muscleGroupSchema.optional(),
      })
    )
    .optional(),
  training_sessions: z.array(trainingSessionSchema).optional(),
});

/**
 * Types exported for use throughout the application
 *
 * - Mesocycle: Base entity type from main schema
 * - MesocycleFormValues: For form validation and submission
 * - MesocycleGoal: For mesocycle goal entities
 * - MesocycleMuscleGroupFocus: For muscle group focus entities
 * - MesocycleWithRelations: Extended type with related entities
 */
export type Mesocycle = z.infer<typeof mesocycleSchema>;
export type MesocycleFormValues = z.infer<typeof mesocycleFormSchema>;
export type MesocycleGoal = z.infer<typeof mesocycleGoalSchema>;
export type MesocycleMuscleGroupFocus = z.infer<
  typeof mesocycleMuscleGroupFocusSchema
>;
export type MesocycleWithRelations = z.infer<
  typeof mesocycleWithRelationsSchema
>;
