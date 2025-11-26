import { create } from "zustand";
import { getMuscleGroups } from "@/lib/actions/muscle-groups";
import { createLogger } from "@/lib/utils/logger";
import { MuscleGroup } from "@/lib/schemas/muscle-groups";

const logger = createLogger("muscle-groups-store");

interface MuscleGroupsState {
  muscleGroups: MuscleGroup[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMuscleGroups: () => Promise<void>;
  reset: () => void;
}

export const useMuscleGroupsStore = create<MuscleGroupsState>((set) => ({
  muscleGroups: [],
  isLoading: false,
  error: null,

  fetchMuscleGroups: async () => {
    try {
      logger.debug("Fetching muscle groups");
      set({ isLoading: true, error: null });

      const result = await getMuscleGroups();

      if (result.error) {
        logger.warn("Error fetching muscle groups", { error: result.error });
        set({ error: result.error, isLoading: false });
        return;
      }

      const validMuscleGroups = Array.isArray(result.data) ? result.data : [];
      logger.info("Muscle groups fetched successfully", {
        count: validMuscleGroups.length,
      });

      set({
        muscleGroups: validMuscleGroups,
        isLoading: false,
      });
    } catch (error) {
      logger.error(
        "Exception in fetchMuscleGroups",
        error instanceof Error ? error : new Error(String(error))
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al cargar los grupos musculares",
        isLoading: false,
      });
    }
  },

  reset: () => {
    logger.debug("Resetting muscle groups store state");
    set({
      error: null,
    });
  },
}));
