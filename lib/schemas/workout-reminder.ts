import { z } from "zod";

/**
 * Schema for workout_reminders table
 */
export const workoutReminderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  training_session_id: z.string().uuid().optional().nullable(),
  day_of_week: z.number().int().min(0).max(6).optional().nullable(),
  time_of_day: z.string().optional().nullable(),
  is_enabled: z.boolean().default(true),
  notification_type: z.enum(["browser", "email", "both"]).default("browser"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Form schema for creating/updating workout reminders
 */
export const workoutReminderFormSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  training_session_id: z.string().optional().nullable(),
  day_of_week: z.number().int().min(0).max(6).optional().nullable(),
  time_of_day: z.string().optional().nullable(),
  is_enabled: z.boolean().default(true),
  notification_type: z.enum(["browser", "email", "both"]).default("browser"),
});

/**
 * Schema for workout_reminders with joined training session data
 */
export const workoutReminderWithRelationsSchema = workoutReminderSchema.extend({
  training_session: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .optional(),
});

export type WorkoutReminder = z.infer<typeof workoutReminderSchema>;
export type WorkoutReminderFormValues = z.infer<typeof workoutReminderFormSchema>;
export type WorkoutReminderWithRelations = z.infer<
  typeof workoutReminderWithRelationsSchema
>;
