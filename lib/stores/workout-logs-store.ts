import { create } from "zustand";
import {
  getWorkoutLogs,
  getWorkoutLog,
  getWorkoutSets,
  getWorkoutStats,
} from "@/lib/actions/workout-logs";
import { createLogger } from "@/lib/utils/logger";
import {
  type WorkoutLogWithRelations,
} from "@/lib/schemas/workout-log";
import { type ExerciseLogSet } from "@/lib/schemas/workout-set";

// Create a logger for this store
const logger = createLogger("workout-logs-store");

interface WorkoutLogsState {
  workoutLogs: WorkoutLogWithRelations[];
  currentWorkoutLog: WorkoutLogWithRelations | null;
  workoutSets: ExerciseLogSet[];
  workoutStats: any;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchWorkoutLogs: (userId: string) => Promise<void>;
  fetchWorkoutLog: (id: string) => Promise<void>;
  fetchWorkoutSets: (workoutId: string) => Promise<void>;
  fetchWorkoutStats: (
    userId: string,
    period?: "week" | "month" | "year"
  ) => Promise<void>;
  reset: () => void;
}

export const useWorkoutLogsStore = create<WorkoutLogsState>((set) => ({
  workoutLogs: [],
  currentWorkoutLog: null,
  workoutSets: [],
  workoutStats: null,
  isLoading: false,
  error: null,
  fetchWorkoutLogs: async (userId: string) => {
    try {
      logger.debug("Fetching workout logs", { userId });
      set({ isLoading: true, error: null });
      const result = await getWorkoutLogs(userId);

      if (result.error) {
        logger.warn("Error fetching workout logs", {
          userId,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return;
      }

      const validLogs = Array.isArray(result.data) ? result.data : [];
      logger.info("Workout logs fetched successfully", {
        userId,
        count: validLogs.length,
      });

      set({
        workoutLogs: validLogs,
        isLoading: false,
      });
    } catch (error) {
      logger.error(
        "Exception in fetchWorkoutLogs",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al cargar los registros de entrenamiento",
        isLoading: false,
      });
    }
  },
  fetchWorkoutLog: async (id: string) => {
    try {
      logger.debug("Fetching workout log details", { logId: id });
      set({ isLoading: true, error: null });
      const result = await getWorkoutLog(id);

      if (result.error) {
        logger.warn("Error fetching workout log details", {
          logId: id,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return;
      }
      logger.info("Workout log details fetched successfully", {
        logId: id,
        date: result.data?.date,
        hasExercises: result.data?.sets && result.data.sets.length > 0,
      });

      set({ currentWorkoutLog: result.data, isLoading: false });
    } catch (error) {
      logger.error(
        "Exception in fetchWorkoutLog",
        error instanceof Error ? error : new Error(String(error)),
        { logId: id }
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al cargar el registro de entrenamiento",
        isLoading: false,
      });
    }
  },
  fetchWorkoutSets: async (workoutId: string) => {
    try {
      logger.debug("Fetching workout sets", { workoutId });
      set({ isLoading: true, error: null });

      try {
        const data = await getWorkoutSets(workoutId);
        logger.info("Workout sets fetched successfully", {
          workoutId,
          count: data?.length || 0,
        });
        set({ workoutSets: data || [], isLoading: false });
      } catch (error) {
        logger.error(
          "Error fetching workout sets",
          error instanceof Error ? error : new Error(String(error)),
          { workoutId }
        );
        throw error;
      }
    } catch (error) {
      logger.error(
        "Exception in fetchWorkoutSets",
        error instanceof Error ? error : new Error(String(error)),
        { workoutId }
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al cargar los sets del entrenamiento",
        isLoading: false,
      });
    }
  },
  fetchWorkoutStats: async (userId: string, period = "month") => {
    const startTime = performance.now();
    try {
      logger.debug("Fetching workout stats", { userId, period });
      set({ isLoading: true, error: null });

      try {
        const data = await getWorkoutStats(userId, period);
        const elapsedTime = Math.round(performance.now() - startTime);

        logger.info("Workout stats fetched successfully", {
          userId,
          period,
          statsCount: data ? Object.keys(data).length : 0,
          elapsedMs: elapsedTime,
        });

        set({ workoutStats: data || [], isLoading: false });
      } catch (error) {
        logger.error(
          "Error fetching workout stats",
          error instanceof Error ? error : new Error(String(error)),
          { userId, period }
        );
        throw error;
      }
    } catch (error) {
      logger.error(
        "Exception in fetchWorkoutStats",
        error instanceof Error ? error : new Error(String(error)),
        { userId, period }
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al cargar las estadísticas",
        isLoading: false,
      });
    }
  },
  reset: () => {
    logger.debug("Resetting workout logs store state");
    set({
      currentWorkoutLog: null,
      workoutSets: [],
      workoutStats: null,
      error: null,
    });
  },
}));
