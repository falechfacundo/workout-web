"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import {
  workoutReminderFormSchema,
  type WorkoutReminderFormValues,
} from "@/lib/schemas/workout-reminder";

const logger = createLogger("workout-reminders-actions");

export async function getWorkoutReminders(userId: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting getWorkoutReminders", { userId });

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workout_reminders")
        .select(
          `
          *,
          training_session:training_sessions(id, name)
        `
        )
        .eq("user_id", userId)
        .order("day_of_week", { ascending: true });

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error fetching workout reminders", {
          userId,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error fetching workout reminders: ${error.message}`,
        };
      }

      logger.info("Successfully fetched workout reminders", {
        userId,
        count: data?.length || 0,
        elapsedMs: elapsedTime,
      });

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in getWorkoutReminders",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      return {
        data: null,
        error: "An unexpected error occurred while fetching workout reminders",
      };
    }
  });
}

export async function getWorkoutReminder(id: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting getWorkoutReminder", { reminderId: id });

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workout_reminders")
        .select(
          `
          *,
          training_session:training_sessions(id, name)
        `
        )
        .eq("id", id)
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error fetching workout reminder", {
          reminderId: id,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error fetching workout reminder: ${error.message}`,
        };
      }

      logger.info("Successfully fetched workout reminder", {
        reminderId: id,
        elapsedMs: elapsedTime,
      });

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in getWorkoutReminder",
        error instanceof Error ? error : new Error(String(error)),
        { reminderId: id }
      );

      return {
        data: null,
        error: "An unexpected error occurred while fetching the workout reminder",
      };
    }
  });
}

export async function createWorkoutReminder(formData: WorkoutReminderFormValues) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting createWorkoutReminder", {
      userId: formData.user_id,
      dayOfWeek: formData.day_of_week,
    });

    try {
      const validatedFields = workoutReminderFormSchema.safeParse(formData);

      if (!validatedFields.success) {
        logger.warn("Invalid workout reminder form data", {
          errors: validatedFields.error.errors,
          userId: formData.user_id,
        });

        return {
          data: null,
          error: "Invalid form data. Please check the fields and try again.",
        };
      }

      const {
        user_id,
        training_session_id,
        day_of_week,
        time_of_day,
        is_enabled,
        notification_type,
      } = validatedFields.data;

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workout_reminders")
        .insert([
          {
            user_id,
            training_session_id: training_session_id || null,
            day_of_week: day_of_week ?? null,
            time_of_day: time_of_day || null,
            is_enabled,
            notification_type,
          },
        ])
        .select()
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        logger.warn("Error creating workout reminder", {
          userId: user_id,
          error: error.message,
          code: error.code,
          elapsedMs: elapsedTime,
        });

        return {
          data: null,
          error: `Error creating workout reminder: ${error.message}`,
        };
      }

      logger.info("Successfully created workout reminder", {
        reminderId: data?.id,
        userId: user_id,
        dayOfWeek: day_of_week,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/calendar");

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in createWorkoutReminder",
        error instanceof Error ? error : new Error(String(error)),
        { userId: formData.user_id }
      );

      return {
        data: null,
        error: "An unexpected error occurred while creating the workout reminder",
      };
    }
  });
}

export async function updateWorkoutReminder(formData: WorkoutReminderFormValues) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting updateWorkoutReminder", {
      reminderId: formData.id,
    });

    try {
      const validatedFields = workoutReminderFormSchema.safeParse(formData);

      if (!validatedFields.success) {
        return {
          data: null,
          error: "Invalid form data. Please check the fields and try again.",
        };
      }

      const {
        id,
        training_session_id,
        day_of_week,
        time_of_day,
        is_enabled,
        notification_type,
      } = validatedFields.data;

      if (!id) {
        return {
          data: null,
          error: "Reminder ID is required for updates",
        };
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workout_reminders")
        .update({
          training_session_id: training_session_id || null,
          day_of_week: day_of_week ?? null,
          time_of_day: time_of_day || null,
          is_enabled,
          notification_type,
        })
        .eq("id", id)
        .select()
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        return {
          data: null,
          error: `Error updating workout reminder: ${error.message}`,
        };
      }

      logger.info("Successfully updated workout reminder", {
        reminderId: id,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/calendar");

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in updateWorkoutReminder",
        error instanceof Error ? error : new Error(String(error)),
        { reminderId: formData.id }
      );

      return {
        data: null,
        error: "An unexpected error occurred while updating the workout reminder",
      };
    }
  });
}

export async function deleteWorkoutReminder(id: string) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting deleteWorkoutReminder", { reminderId: id });

    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("workout_reminders")
        .delete()
        .eq("id", id);

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        return {
          data: null,
          error: `Error deleting workout reminder: ${error.message}`,
        };
      }

      logger.info("Successfully deleted workout reminder", {
        reminderId: id,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/calendar");

      return { data: { success: true }, error: null };
    } catch (error) {
      logger.error(
        "Exception in deleteWorkoutReminder",
        error instanceof Error ? error : new Error(String(error)),
        { reminderId: id }
      );

      return {
        data: null,
        error: "An unexpected error occurred while deleting the workout reminder",
      };
    }
  });
}

export async function toggleWorkoutReminder(id: string, isEnabled: boolean) {
  return safeAction(async () => {
    const startTime = performance.now();
    logger.debug("Starting toggleWorkoutReminder", { reminderId: id, isEnabled });

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("workout_reminders")
        .update({ is_enabled: isEnabled })
        .eq("id", id)
        .select()
        .single();

      const elapsedTime = Math.round(performance.now() - startTime);

      if (error) {
        return {
          data: null,
          error: `Error toggling workout reminder: ${error.message}`,
        };
      }

      logger.info("Successfully toggled workout reminder", {
        reminderId: id,
        isEnabled,
        elapsedMs: elapsedTime,
      });

      revalidatePath("/dashboard/calendar");

      return {
        data,
        error: null,
      };
    } catch (error) {
      logger.error(
        "Exception in toggleWorkoutReminder",
        error instanceof Error ? error : new Error(String(error)),
        { reminderId: id }
      );

      return {
        data: null,
        error: "An unexpected error occurred while toggling the workout reminder",
      };
    }
  });
}
