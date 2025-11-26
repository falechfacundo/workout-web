import { create } from "zustand";
import {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
} from "@/lib/actions/exercises";
import { type ExerciseWithRelations } from "@/lib/schemas/exercise";
import { createLogger } from "@/lib/utils/logger";

// Create a logger for this store
const logger = createLogger("exercises-store");

// Interfaz para el estado del store
interface ExercisesState {
  exercises: ExerciseWithRelations[];
  filteredExercises: ExerciseWithRelations[];
  currentExercise: ExerciseWithRelations | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedMuscleGroupId: string;

  // Acciones
  fetchExercises: () => Promise<void>;
  fetchExercise: (id: string) => Promise<void>;
  createExercise: (data: any) => Promise<any>;
  updateExercise: (data: any) => Promise<any>;
  setSearchQuery: (query: string) => void;
  setSelectedMuscleGroup: (id: string) => void;
  filterExercises: () => void;
  reset: () => void;
}

export const useExercisesStore = create<ExercisesState>((set, get) => ({
  exercises: [],
  filteredExercises: [],
  currentExercise: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  selectedMuscleGroupId: "",

  fetchExercises: async () => {
    try {
      logger.debug("Fetching exercises");
      set({ isLoading: true, error: null });
      const result = await getExercises();

      if (result.error) {
        logger.warn("Error fetching exercises", { error: result.error });
        set({ error: result.error, isLoading: false });
        return;
      }

      const validExercises = Array.isArray(result.data) ? result.data : [];

      logger.info("Exercises fetched successfully", {
        count: validExercises.length,
        defaultCount: validExercises.filter((e) => e.is_default).length,
      });

      set({
        exercises: validExercises,
        filteredExercises: validExercises,
        isLoading: false,
      });

      // Apply current filters
      get().filterExercises();
    } catch (error) {
      logger.error(
        "Exception in fetchExercises",
        error instanceof Error ? error : new Error(String(error))
      );

      set({
        error:
          typeof error === "string" ? error : "Error al cargar los ejercicios",
        isLoading: false,
      });
    }
  },

  fetchExercise: async (id: string) => {
    try {
      logger.debug("Fetching exercise details", { exerciseId: id });
      set({ isLoading: true, error: null });
      const result = await getExercise(id);

      if (result.error) {
        logger.warn("Error fetching exercise details", {
          exerciseId: id,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return;
      }

      logger.info("Exercise details fetched successfully", {
        exerciseId: id,
        name: result.data?.name,
      });

      set({
        currentExercise: result.data as ExerciseWithRelations,
        isLoading: false,
      });
    } catch (error) {
      logger.error(
        "Exception in fetchExercise",
        error instanceof Error ? error : new Error(String(error)),
        { exerciseId: id }
      );

      set({
        error:
          typeof error === "string" ? error : "Error al cargar el ejercicio",
        isLoading: false,
      });
    }
  },

  setSearchQuery: (query: string) => {
    logger.debug("Setting search query", { query });
    set({ searchQuery: query });
    get().filterExercises();
  },

  setSelectedMuscleGroup: (id: string) => {
    logger.debug("Setting selected muscle group", { muscleGroupId: id });
    set({ selectedMuscleGroupId: id });
    get().filterExercises();
  },

  filterExercises: () => {
    const { exercises, searchQuery, selectedMuscleGroupId } = get();
    let filtered = [...exercises];
    const startCount = filtered.length;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by muscle group
    if (selectedMuscleGroupId) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.primary_muscle?.id === selectedMuscleGroupId ||
          exercise.secondary_muscle_groups?.some(
            (mg) => mg.id === selectedMuscleGroupId
          )
      );
    }

    logger.debug("Exercises filtered", {
      totalCount: exercises.length,
      filteredCount: filtered.length,
      hasSearchQuery: !!searchQuery,
      hasMuscleGroupFilter: !!selectedMuscleGroupId,
    });

    set({ filteredExercises: filtered });
  },

  reset: () => {
    logger.debug("Resetting exercise store state");
    set({
      currentExercise: null,
      searchQuery: "",
      selectedMuscleGroupId: "",
      error: null,
    });
  },

  createExercise: async (data) => {
    try {
      logger.debug("Creating exercise", { name: data.name });
      set({ isLoading: true, error: null });

      const result = await createExercise(data);

      if (result.error) {
        logger.warn("Error creating exercise", {
          name: data.name,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return result;
      }

      logger.info("Exercise created successfully", {
        id: result.data?.id,
        name: data.name,
      });

      // Add the new exercise to the list
      set((state) => {
        const newExercises = [...state.exercises, result.data];
        return {
          exercises: newExercises,
          filteredExercises:
            state.searchQuery || state.selectedMuscleGroupId
              ? state.filteredExercises // Mantener la lista filtrada actual
              : newExercises, // Si no hay filtros, actualizar también la lista filtrada
          isLoading: false,
        };
      });

      return result;
    } catch (error) {
      logger.error(
        "Exception in createExercise",
        error instanceof Error ? error : new Error(String(error))
      );

      set({
        error:
          typeof error === "string" ? error : "Error al crear el ejercicio",
        isLoading: false,
      });

      return { error: "An unexpected error occurred", data: null };
    }
  },

  updateExercise: async (data) => {
    try {
      logger.debug("Updating exercise", { id: data.id, name: data.name });
      set({ isLoading: true, error: null });

      const result = await updateExercise(data);

      if (result.error) {
        logger.warn("Error updating exercise", {
          id: data.id,
          error: result.error,
        });
        set({ error: result.error, isLoading: false });
        return result;
      }

      logger.info("Exercise updated successfully", {
        id: result.data?.id,
        name: data.name,
      });

      // Update the exercise in both lists
      set((state) => ({
        exercises: state.exercises.map((ex) =>
          ex.id === data.id ? { ...ex, ...result.data } : ex
        ),
        filteredExercises: state.filteredExercises.map((ex) =>
          ex.id === data.id ? { ...ex, ...result.data } : ex
        ),
        currentExercise:
          state.currentExercise?.id === data.id
            ? { ...state.currentExercise, ...result.data }
            : state.currentExercise,
        isLoading: false,
      }));

      return result;
    } catch (error) {
      logger.error(
        "Exception in updateExercise",
        error instanceof Error ? error : new Error(String(error))
      );

      set({
        error:
          typeof error === "string"
            ? error
            : "Error al actualizar el ejercicio",
        isLoading: false,
      });

      return { error: "An unexpected error occurred", data: null };
    }
  },
}));
