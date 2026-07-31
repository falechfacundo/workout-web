import { create } from "zustand";
import {
  getWorkoutReminders,
  createWorkoutReminder,
  updateWorkoutReminder,
  deleteWorkoutReminder,
  toggleWorkoutReminder,
} from "@/lib/actions/workout-reminders";
import { createLogger } from "@/lib/utils/logger";
import { type WorkoutReminder } from "@/lib/schemas/workout-reminder";

const logger = createLogger("workout-reminders-store");

interface WorkoutRemindersState {
  reminders: WorkoutReminder[];
  isLoading: boolean;
  error: string | null;

  fetchReminders: (userId: string) => Promise<void>;
  addReminder: (data: any) => Promise<any>;
  updateReminder: (data: any) => Promise<any>;
  removeReminder: (id: string) => Promise<any>;
  toggleReminder: (id: string, isEnabled: boolean) => Promise<any>;
  reset: () => void;
}

export const useWorkoutRemindersStore = create<WorkoutRemindersState>(
  (set) => ({
    reminders: [],
    isLoading: false,
    error: null,

    fetchReminders: async (userId: string) => {
      const startTime = performance.now();
      try {
        logger.debug("Fetching workout reminders", { userId });
        set({ isLoading: true, error: null });

        const result = await getWorkoutReminders(userId);

        if (result.error) {
          logger.warn("Error fetching workout reminders", {
            userId,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return;
        }

        const validReminders = Array.isArray(result.data) ? result.data : [];
        const elapsedTime = Math.round(performance.now() - startTime);

        logger.info("Workout reminders fetched successfully", {
          userId,
          count: validReminders.length,
          elapsedMs: elapsedTime,
        });

        set({
          reminders: validReminders,
          isLoading: false,
        });
      } catch (error) {
        logger.error(
          "Exception in fetchReminders",
          error instanceof Error ? error : new Error(String(error)),
          { userId }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al cargar los recordatorios",
          isLoading: false,
        });
      }
    },

    addReminder: async (data) => {
      try {
        logger.debug("Adding workout reminder", {
          userId: data.user_id,
          dayOfWeek: data.day_of_week,
        });
        set({ isLoading: true, error: null });

        const result = await createWorkoutReminder(data);

        if (result.error) {
          logger.warn("Error adding workout reminder", {
            userId: data.user_id,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return result;
        }

        logger.info("Workout reminder added successfully", {
          reminderId: result.data?.id,
        });

        set((state) => ({
          reminders: [...state.reminders, result.data],
          isLoading: false,
        }));

        return result;
      } catch (error) {
        logger.error(
          "Exception in addReminder",
          error instanceof Error ? error : new Error(String(error)),
          { userId: data.user_id }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al agregar recordatorio",
          isLoading: false,
        });

        return { error: "An unexpected error occurred", data: null };
      }
    },

    updateReminder: async (data) => {
      try {
        logger.debug("Updating workout reminder", { id: data.id });
        set({ isLoading: true, error: null });

        const result = await updateWorkoutReminder(data);

        if (result.error) {
          logger.warn("Error updating workout reminder", {
            id: data.id,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return result;
        }

        logger.info("Workout reminder updated successfully", {
          id: data.id,
        });

        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === data.id ? { ...r, ...result.data } : r
          ),
          isLoading: false,
        }));

        return result;
      } catch (error) {
        logger.error(
          "Exception in updateReminder",
          error instanceof Error ? error : new Error(String(error)),
          { id: data.id }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al actualizar recordatorio",
          isLoading: false,
        });

        return { error: "An unexpected error occurred", data: null };
      }
    },

    removeReminder: async (id) => {
      try {
        logger.debug("Removing workout reminder", { id });
        set({ isLoading: true, error: null });

        const result = await deleteWorkoutReminder(id);

        if (result.error) {
          logger.warn("Error removing workout reminder", {
            id,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return result;
        }

        logger.info("Workout reminder removed successfully", { id });

        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
          isLoading: false,
        }));

        return result;
      } catch (error) {
        logger.error(
          "Exception in removeReminder",
          error instanceof Error ? error : new Error(String(error)),
          { id }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al eliminar recordatorio",
          isLoading: false,
        });

        return { error: "An unexpected error occurred", data: null };
      }
    },

    toggleReminder: async (id, isEnabled) => {
      try {
        logger.debug("Toggling workout reminder", { id, isEnabled });

        const result = await toggleWorkoutReminder(id, isEnabled);

        if (result.error) {
          logger.warn("Error toggling workout reminder", {
            id,
            error: result.error,
          });
          set({ error: result.error });
          return result;
        }

        logger.info("Workout reminder toggled successfully", {
          id,
          isEnabled,
        });

        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, is_enabled: isEnabled } : r
          ),
        }));

        return result;
      } catch (error) {
        logger.error(
          "Exception in toggleReminder",
          error instanceof Error ? error : new Error(String(error)),
          { id }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al cambiar recordatorio",
        });

        return { error: "An unexpected error occurred", data: null };
      }
    },

    reset: () => {
      logger.debug("Resetting workout reminders store state");
      set({
        reminders: [],
        error: null,
      });
    },
  })
);
