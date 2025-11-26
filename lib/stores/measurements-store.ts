import { create } from "zustand";
import { createLogger } from "@/lib/utils/logger";
import { type Measurement } from "@/lib/schemas/measurement";

import {
  getMeasurements,
  addMeasurement as addMeasurementAction,
  updateMeasurement as updateMeasurementAction,
  deleteMeasurement as deleteMeasurementAction,
} from "@/lib/actions/measurements";

// Create a logger for this store
const logger = createLogger("measurements-store");

interface MeasurementsState {
  measurements: Measurement[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchMeasurements: (profileId: string) => Promise<void>;
  addMeasurement: (
    profileId: string,
    measurement: Partial<Measurement>
  ) => Promise<Measurement | null>;
  updateMeasurement: (
    id: string,
    measurement: Partial<Measurement>
  ) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  reset: () => void;
}

export const useMeasurementsStore = create<MeasurementsState>((set, get) => ({
  measurements: [],
  isLoading: false,
  error: null,

  fetchMeasurements: async (profileId: string) => {
    if (!profileId) return;

    set({ isLoading: true, error: null });

    try {
      logger.debug("Fetching measurements for profile", { profileId });
      const result = await getMeasurements({ profileId });

      if (result.error) {
        logger.warn("Error fetching measurements", {
          profileId,
          error: result.error,
        });
        set({
          error: result.error,
          isLoading: false,
        });
        return;
      }

      logger.info("Measurements fetched successfully", {
        profileId,
        count: result.data?.length || 0,
      });

      set({
        measurements: result.data || [],
        isLoading: false,
      });
    } catch (error) {
      logger.error(
        "Exception in fetchMeasurements",
        error instanceof Error ? error : new Error(String(error)),
        { profileId }
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Failed to load measurement history",
        isLoading: false,
      });
    }
  },

  addMeasurement: async (profileId, measurement) => {
    set({ isLoading: true, error: null });

    try {
      logger.debug("Adding new measurement", { profileId });

      const result = await addMeasurementAction({
        ...measurement,
        profileId,
      });

      if (result.error) {
        logger.warn("Error adding measurement", {
          profileId,
          error: result.error,
        });
        set({
          error: result.error,
          isLoading: false,
        });
        return null;
      }

      logger.info("Measurement added successfully", {
        profileId,
        measurementId: result.data?.id,
      });

      // Actualiza el estado con la nueva medición
      set((state) => ({
        measurements: [...state.measurements, result.data],
        isLoading: false,
      }));

      return result.data;
    } catch (error) {
      logger.error(
        "Exception in addMeasurement",
        error instanceof Error ? error : new Error(String(error)),
        { profileId }
      );

      set({
        error:
          typeof error === "string" ? error : "Failed to add new measurement",
        isLoading: false,
      });
      return null;
    }
  },

  updateMeasurement: async (id, measurement) => {
    set({ isLoading: true, error: null });

    try {
      logger.debug("Updating measurement", { id });

      const result = await updateMeasurementAction({
        ...measurement,
        id,
      });

      if (result.error) {
        logger.warn("Error updating measurement", {
          id,
          error: result.error,
        });
        set({
          error: result.error,
          isLoading: false,
        });
        return;
      }

      logger.info("Measurement updated successfully", { id });

      // Actualizar la medición en la lista
      set((state) => ({
        measurements: state.measurements.map((m) =>
          m.id === id ? { ...m, ...result.data } : m
        ),
        isLoading: false,
      }));
    } catch (error) {
      logger.error(
        "Exception in updateMeasurement",
        error instanceof Error ? error : new Error(String(error)),
        { id }
      );
      set({
        error:
          typeof error === "string" ? error : "Failed to update measurement",
        isLoading: false,
      });
    }
  },

  deleteMeasurement: async (id) => {
    set({ isLoading: true, error: null });

    try {
      logger.debug("Deleting measurement", { id });

      const result = await deleteMeasurementAction({ id });

      if (result.error) {
        logger.warn("Error deleting measurement", {
          id,
          error: result.error,
        });
        set({
          error: result.error,
          isLoading: false,
        });
        return;
      }

      logger.info("Measurement deleted successfully", { id });

      // Actualizamos el estado local sin necesidad de recargar todo
      set((state) => ({
        measurements: state.measurements.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      logger.error(
        "Exception in deleteMeasurement",
        error instanceof Error ? error : new Error(String(error)),
        { id }
      );
      set({
        error:
          typeof error === "string" ? error : "Failed to delete measurement",
        isLoading: false,
      });
    }
  },

  reset: () => {
    logger.debug("Resetting measurements store state");
    set({
      measurements: [],
      isLoading: false,
      error: null,
    });
  },
}));
