import { create } from "zustand";
import {
  getMesocycles,
  getMesocycle,
  getActiveMesocycles,
  createMesocycle,
  updateMesocycle,
} from "@/lib/actions/mesocycles";
import { Mesocycle, MesocycleWithRelations } from "@/lib/schemas/mesocycle";
import { createLogger } from "@/lib/utils/logger";

// Create a logger for this store
const logger = createLogger("mesocycles-store");

// Interface for the store state
interface MesocyclesState {
  mesocycles: Mesocycle[];
  activeMesocycles: Mesocycle[];
  currentMesocycle: MesocycleWithRelations | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMesocycles: (userId: string) => Promise<void>;
  fetchActiveMesocycles: (userId: string) => Promise<void>;
  fetchMesocycle: (id: string) => Promise<void>;
  createMesocycle: (data: any) => Promise<any>;
  updateMesocycle: (data: any) => Promise<any>;
  reset: () => void;
}

export const useMesocyclesStore = create<MesocyclesState>((set, get) => ({
  mesocycles: [],
  activeMesocycles: [],
  currentMesocycle: null,
  isLoading: false,
  error: null,

  fetchMesocycles: async (userId: string) => {
    try {
      logger.debug("Fetching mesocycles", { userId });
      set({ isLoading: true, error: null });
      const result = await getMesocycles(userId);

      if (result.error) {
        logger.warn("Error fetching mesocycles", {
          userId,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return;
      }

      const validMesocycles = Array.isArray(result.data) ? result.data : [];
      logger.info("Mesocycles fetched successfully", {
        userId,
        count: validMesocycles.length,
      });

      set({
        mesocycles: validMesocycles,
        isLoading: false,
      });
    } catch (error) {
      logger.error(
        "Exception in fetchMesocycles",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      set({
        error:
          typeof error === "string" ? error : "Error al cargar los mesociclos",
        isLoading: false,
      });
    }
  },

  fetchActiveMesocycles: async (userId: string) => {
    try {
      logger.debug("Fetching active mesocycles", { userId });
      set({ isLoading: true, error: null });
      const result = await getActiveMesocycles(userId);

      if (result.error) {
        logger.warn("Error fetching active mesocycles", {
          userId,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return;
      }

      const validMesocycles = Array.isArray(result.data) ? result.data : [];
      logger.info("Active mesocycles fetched successfully", {
        userId,
        count: validMesocycles.length,
      });

      set({
        activeMesocycles: validMesocycles,
        isLoading: false,
      });
    } catch (error) {
      logger.error(
        "Exception in fetchActiveMesocycles",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al cargar los mesociclos activos",
        isLoading: false,
      });
    }
  },

  fetchMesocycle: async (id: string) => {
    try {
      logger.debug("Fetching mesocycle details", { mesocycleId: id });
      set({ isLoading: true, error: null });
      const result = await getMesocycle(id);

      if (result.error) {
        logger.warn("Error fetching mesocycle details", {
          mesocycleId: id,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return;
      }
      console.log("result", result);

      logger.info("Mesocycle details fetched successfully", {
        mesocycleId: id,
        name: result.data?.name,
      });

      set({
        currentMesocycle: result.data as MesocycleWithRelations,
        isLoading: false,
      });
    } catch (error) {
      logger.error(
        "Exception in fetchMesocycle",
        error instanceof Error ? error : new Error(String(error)),
        { mesocycleId: id }
      );

      set({
        error:
          typeof error === "string" ? error : "Error al cargar el mesociclo",
        isLoading: false,
      });
    }
  },

  reset: () => {
    logger.debug("Resetting mesocycle store state");
    set({
      currentMesocycle: null,
      error: null,
    });
  },

  createMesocycle: async (data) => {
    try {
      logger.debug("Creating mesocycle", { name: data.name });
      set({ isLoading: true, error: null });

      const result = await createMesocycle(data);

      if (result.error) {
        logger.warn("Error creating mesocycle", {
          name: data.name,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return result;
      }

      logger.info("Mesocycle created successfully", {
        id: result.data?.id,
        name: data.name,
      });

      // Add the new mesocycle to the list if the user_id matches
      const userId = data.user_id;
      if (userId) {
        set((state) => ({
          mesocycles: [...state.mesocycles, result.data],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }

      return result;
    } catch (error) {
      logger.error(
        "Exception in createMesocycle",
        error instanceof Error ? error : new Error(String(error))
      );

      set({
        error:
          typeof error === "string" ? error : "Error al crear el mesociclo",
        isLoading: false,
      });

      return { error: "An unexpected error occurred", data: null };
    }
  },

  updateMesocycle: async (data) => {
    try {
      logger.debug("Updating mesocycle", { id: data.id, name: data.name });
      set({ isLoading: true, error: null });

      const result = await updateMesocycle(data);

      if (result.error) {
        logger.warn("Error updating mesocycle", {
          id: data.id,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return result;
      }

      logger.info("Mesocycle updated successfully", {
        id: result.data?.id,
        name: data.name,
      });

      // Update the mesocycle in the list
      set((state) => ({
        mesocycles: state.mesocycles.map((m) =>
          m.id === data.id ? { ...m, ...result.data } : m
        ),
        currentMesocycle:
          state.currentMesocycle?.id === data.id
            ? { ...state.currentMesocycle, ...result.data }
            : state.currentMesocycle,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      logger.error(
        "Exception in updateMesocycle",
        error instanceof Error ? error : new Error(String(error))
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al actualizar el mesociclo",
        isLoading: false,
      });

      return { error: "An unexpected error occurred", data: null };
    }
  },
}));
