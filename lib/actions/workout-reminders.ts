"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
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

    const user = await getServerUser();
    if (!user?.id) {
      return {
        data: null,
        error: "Not authenticated",
      };
    }

    try {
      const data = await db.workoutReminder.findMany({
        // user.id de la sesión, no el userId recibido por parámetro — evita
        // que un cliente pida los recordatorios de otro usuario.
        where: { user_id: user.id },
        orderBy: { day_of_week: "asc" },
        include: {
          training_session: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

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

    const user = await getServerUser();
    if (!user?.id) {
      return {
        data: null,
        error: "Not authenticated",
      };
    }

    try {
      const data = await db.workoutReminder.findFirst({
        where: { id, user_id: user.id },
        include: {
          training_session: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

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

    const user = await getServerUser();
    if (!user?.id) {
      return {
        data: null,
        error: "Not authenticated",
      };
    }

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
        training_session_id,
        day_of_week,
        time_of_day,
        is_enabled,
        notification_type,
      } = validatedFields.data;

      if (training_session_id) {
        const ownedSession = await db.trainingSession.findFirst({
          where: { id: training_session_id, mesocycle: { user_id: user.id } },
          select: { id: true },
        });
        if (!ownedSession) {
          return { data: null, error: "Sesión no encontrada" };
        }
      }

      // user_id sale de la sesión, no del formData: si no, cualquiera podría
      // crear recordatorios a nombre de otro usuario pasando su user_id.
      const data = await db.workoutReminder.create({
        data: {
          user_id: user.id,
          training_session_id: training_session_id || null,
          day_of_week: day_of_week ?? null,
          time_of_day: time_of_day || null,
          is_enabled,
          notification_type,
        },
      });

      const elapsedTime = Math.round(performance.now() - startTime);

      logger.info("Successfully created workout reminder", {
        reminderId: data?.id,
        userId: user.id,
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

    const user = await getServerUser();
    if (!user?.id) {
      return {
        data: null,
        error: "Not authenticated",
      };
    }

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

      const { count } = await db.workoutReminder.updateMany({
        where: { id, user_id: user.id },
        data: {
          training_session_id: training_session_id || null,
          day_of_week: day_of_week ?? null,
          time_of_day: time_of_day || null,
          is_enabled,
          notification_type,
        },
      });

      if (count === 0) {
        return { data: null, error: "Recordatorio no encontrado" };
      }

      const data = await db.workoutReminder.findFirst({ where: { id } });

      const elapsedTime = Math.round(performance.now() - startTime);

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

    const user = await getServerUser();
    if (!user?.id) {
      return {
        data: null,
        error: "Not authenticated",
      };
    }

    try {
      const { count } = await db.workoutReminder.deleteMany({
        where: { id, user_id: user.id },
      });

      if (count === 0) {
        return { data: null, error: "Recordatorio no encontrado" };
      }

      const elapsedTime = Math.round(performance.now() - startTime);

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

    const user = await getServerUser();
    if (!user?.id) {
      return {
        data: null,
        error: "Not authenticated",
      };
    }

    try {
      const { count } = await db.workoutReminder.updateMany({
        where: { id, user_id: user.id },
        data: { is_enabled: isEnabled },
      });

      if (count === 0) {
        return { data: null, error: "Recordatorio no encontrado" };
      }

      const data = await db.workoutReminder.findFirst({ where: { id } });

      const elapsedTime = Math.round(performance.now() - startTime);

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