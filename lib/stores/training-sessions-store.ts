import { create } from "zustand";
import {
  getTrainingSessions,
  getTrainingSession,
  getTrainingSessionsByMesocycle,
  getSessionExercises,
  addExerciseToSession,
  updateSessionExercise,
} from "@/lib/actions/training-sessions";
import { createLogger } from "@/lib/utils/logger";
import { type TrainingSession } from "@/lib/schemas/training-session";
import { type SessionExercise } from "@/lib/schemas/session-exercise";

// Create a logger for this store
const logger = createLogger("training-sessions-store");

interface TrainingSessionsState {
  sessions: TrainingSession[];
  currentSession: TrainingSession | null;
  sessionExercises: SessionExercise[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchSessions: (userId: string) => Promise<void>;
  fetchSessionsByMesocycle: (mesocycleId: string) => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  fetchSessionExercises: (sessionId: string) => Promise<void>;
  addExerciseToSession: (data: any) => Promise<any>;
  updateSessionExercise: (data: any) => Promise<any>;
  reset: () => void;
}

export const useTrainingSessionsStore = create<TrainingSessionsState>(
  (set) => ({
    sessions: [],
    currentSession: null,
    sessionExercises: [],
    isLoading: false,
    error: null,
    fetchSessions: async (userId: string) => {
      const startTime = performance.now();
      try {
        logger.debug("Fetching training sessions", { userId });
        set({ isLoading: true, error: null });
        const result = await getTrainingSessions(userId);

        if (result.error) {
          logger.warn("Error fetching training sessions", {
            userId,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return;
        }

        const validSessions = Array.isArray(result.data) ? result.data : [];
        const elapsedTime = Math.round(performance.now() - startTime);

        logger.info("Training sessions fetched successfully", {
          userId,
          count: validSessions.length,
          elapsedMs: elapsedTime,
        });

        set({
          sessions: validSessions,
          isLoading: false,
        });
      } catch (error) {
        logger.error(
          "Exception in fetchSessions",
          error instanceof Error ? error : new Error(String(error)),
          { userId }
        );

        set({
          error:
            typeof error === "string" ? error : "Error al cargar las sesiones",
          isLoading: false,
        });
      }
    },
    fetchSessionsByMesocycle: async (mesocycleId: string) => {
      const startTime = performance.now();
      try {
        logger.debug("Fetching training sessions by mesocycle", {
          mesocycleId,
        });
        set({ isLoading: true, error: null });
        const result = await getTrainingSessionsByMesocycle(mesocycleId);

        if (result.error) {
          logger.warn("Error fetching training sessions by mesocycle", {
            mesocycleId,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return;
        }

        const validSessions = Array.isArray(result.data) ? result.data : [];
        const elapsedTime = Math.round(performance.now() - startTime);

        logger.info("Training sessions for mesocycle fetched successfully", {
          mesocycleId,
          count: validSessions.length,
          elapsedMs: elapsedTime,
        });

        set({
          sessions: validSessions,
          isLoading: false,
        });
      } catch (error) {
        logger.error(
          "Exception in fetchSessionsByMesocycle",
          error instanceof Error ? error : new Error(String(error)),
          { mesocycleId }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al cargar las sesiones del mesociclo",
          isLoading: false,
        });
      }
    },
    fetchSession: async (id: string) => {
      try {
        logger.debug("Fetching training session details", { sessionId: id });
        set({ isLoading: true, error: null });
        const result = await getTrainingSession(id);

        if (result.error) {
          logger.warn("Error fetching training session details", {
            sessionId: id,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return;
        }

        logger.info("Training session details fetched successfully", {
          sessionId: id,
          name: result.data?.name,
        });

        set({
          currentSession: result.data as TrainingSession,
          isLoading: false,
        });
      } catch (error) {
        logger.error(
          "Exception in fetchSession",
          error instanceof Error ? error : new Error(String(error)),
          { sessionId: id }
        );

        set({
          error:
            typeof error === "string" ? error : "Error al cargar la sesión",
          isLoading: false,
        });
      }
    },
    fetchSessionExercises: async (sessionId: string) => {
      const startTime = performance.now();
      try {
        logger.debug("Fetching session exercises", { sessionId });
        set({ isLoading: true, error: null });

        try {
          const data = await getSessionExercises(sessionId);
          const elapsedTime = Math.round(performance.now() - startTime);

          logger.info("Session exercises fetched successfully", {
            sessionId,
            count: data?.length || 0,
            elapsedMs: elapsedTime,
          });

          set({ sessionExercises: data || [], isLoading: false });
        } catch (error) {
          logger.error(
            "Error fetching session exercises",
            error instanceof Error ? error : new Error(String(error)),
            { sessionId }
          );
          throw error;
        }
      } catch (error) {
        logger.error(
          "Exception in fetchSessionExercises",
          error instanceof Error ? error : new Error(String(error)),
          { sessionId }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al cargar los ejercicios de la sesión",
          isLoading: false,
        });
      }
    },
    reset: () => {
      logger.debug("Resetting training sessions store state");
      set({
        currentSession: null,
        sessionExercises: [],
        error: null,
      });
    },
    addExerciseToSession: async (data) => {
      try {
        logger.debug("Adding exercise to session", {
          sessionId: data.session_template_id,
          exerciseId: data.exercise_id,
        });
        set({ isLoading: true, error: null });

        const result = await addExerciseToSession(data);

        if (result.error) {
          logger.warn("Error adding exercise to session", {
            sessionId: data.session_template_id,
            exerciseId: data.exercise_id,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return result;
        }

        logger.info("Exercise added to session successfully", {
          sessionId: data.session_template_id,
          exerciseId: data.exercise_id,
          exerciseSessionId: result.data?.id,
        });

        // Update the session exercises list
        set((state) => ({
          sessionExercises: [...state.sessionExercises, result.data],
          isLoading: false,
        }));

        return result;
      } catch (error) {
        logger.error(
          "Exception in addExerciseToSession",
          error instanceof Error ? error : new Error(String(error)),
          {
            sessionId: data.session_template_id,
            exerciseId: data.exercise_id,
          }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al agregar ejercicio a la sesión",
          isLoading: false,
        });

        return { error: "An unexpected error occurred", data: null };
      }
    },
    updateSessionExercise: async (data) => {
      try {
        logger.debug("Updating session exercise", {
          id: data.id,
          sessionId: data.session_template_id,
          exerciseId: data.exercise_id,
        });
        set({ isLoading: true, error: null });

        const result = await updateSessionExercise(data);

        if (result.error) {
          logger.warn("Error updating session exercise", {
            id: data.id,
            error: result.error,
          });
          set({ error: result.error, isLoading: false });
          return result;
        }

        logger.info("Session exercise updated successfully", {
          id: data.id,
          sessionId: data.session_template_id,
          exerciseId: data.exercise_id,
        });

        // Update the session exercise in the list
        set((state) => ({
          sessionExercises: state.sessionExercises.map((se) =>
            se.id === data.id ? { ...se, ...result.data } : se
          ),
          isLoading: false,
        }));

        return result;
      } catch (error) {
        logger.error(
          "Exception in updateSessionExercise",
          error instanceof Error ? error : new Error(String(error)),
          { id: data.id }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al actualizar el ejercicio de la sesión",
          isLoading: false,
        });

        return { error: "An unexpected error occurred", data: null };
      }
    },
  })
);
