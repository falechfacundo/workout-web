import { create } from "zustand";
import { getUserProfile, updateUserProfile } from "@/lib/actions/profile";
import { createLogger } from "@/lib/utils/logger";
import { type Profile } from "@/lib/schemas/profile";

const logger = createLogger("profile-store");

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  // Acciones del perfil
  fetchProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  updateUserProfile: (data: any) => Promise<any>;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => {
  return {
    profile: null,
    isLoading: false,
    error: null,

    // Acciones del perfil
    fetchProfile: async () => {
      try {
        logger.debug("Fetching user profile");
        set({ isLoading: true, error: null });

        const response = await getUserProfile();

        if (response.error) {
          logger.warn("Error fetching user profile", { error: response.error });
          set({ error: response.error, isLoading: false });
          return;
        }

        logger.info("User profile fetched successfully");

        set({
          profile: response.data,
          isLoading: false,
        });
      } catch (error) {
        logger.error(
          "Exception in fetchProfile",
          error instanceof Error ? error : new Error(String(error))
        );

        set({
          error:
            typeof error === "string" ? error : "Error loading user profile",
          isLoading: false,
        });
      }
    },

    updateUserProfile: async (data) => {
      try {
        logger.debug("Updating user profile", { username: data.username });
        set({ isLoading: true, error: null });

        const result = await updateUserProfile(data);

        if (result.error) {
          logger.warn("Error updating user profile", {
            error: result.error,
            username: data.username,
          });
          set({ error: result.error, isLoading: false });
          return result;
        }

        logger.info("Profile updated successfully", {
          username: data.username,
        });

        // Actualizar el perfil en el store
        set({
          profile: { ...get().profile, ...result.data },
          isLoading: false,
        });

        return result;
      } catch (error) {
        logger.error(
          "Exception in updateUserProfile",
          error instanceof Error ? error : new Error(String(error))
        );

        set({
          error:
            typeof error === "string" ? error : "Error updating user profile",
          isLoading: false,
        });

        return { error: "An unexpected error occurred", data: null };
      }
    },

    setProfile: (profile) => set({ profile }),
    startLoading: () => set({ isLoading: true }),
    stopLoading: () => set({ isLoading: false }),
    setError: (error) => set({ error }),
    reset: () => set({ profile: null, isLoading: false, error: null }), // Acciones de mediciones
    fetchMeasurements: async (profileId) => {
      if (!profileId) return;

      set({ measurementsLoading: true, measurementsError: null });

      try {
        logger.debug("Fetching measurements for profile", { profileId });
        const result = await getMeasurements({ profileId });

        if (result.error) {
          logger.warn("Error fetching measurements", {
            profileId,
            error: result.error,
          });
          set({
            measurementsError: result.error,
            measurementsLoading: false,
          });
          return;
        }

        logger.info("Measurements fetched successfully", {
          profileId,
          count: result.data?.length || 0,
        });

        set({
          measurements: result.data || [],
          measurementsLoading: false,
        });
      } catch (error) {
        logger.error(
          "Exception in fetchMeasurements",
          error instanceof Error ? error : new Error(String(error)),
          { profileId }
        );

        set({
          measurementsError:
            typeof error === "string"
              ? error
              : "Failed to load measurement history",
          measurementsLoading: false,
        });
      }
    },
    addMeasurement: async (profileId, measurement) => {
      set({ measurementsLoading: true, measurementsError: null });

      try {
        logger.debug("Adding new measurement", { profileId });

        const result = await addMeasurement({
          ...measurement,
          profileId,
        });

        if (result.error) {
          logger.warn("Error adding measurement", {
            profileId,
            error: result.error,
          });
          set({
            measurementsError: result.error,
            measurementsLoading: false,
          });
          return null;
        }

        logger.info("Measurement added successfully", {
          profileId,
          measurementId: result.data?.id,
        });

        // Actualiza el estado con la nueva medición
        await get().fetchMeasurements(profileId);

        set({ measurementsLoading: false });
        return result.data;
      } catch (error) {
        logger.error(
          "Exception in addMeasurement",
          error instanceof Error ? error : new Error(String(error)),
          { profileId }
        );

        set({
          measurementsError:
            typeof error === "string" ? error : "Failed to add new measurement",
          measurementsLoading: false,
        });
        return null;
      }
    },
    updateMeasurement: async (id, measurement) => {
      set({ measurementsLoading: true, measurementsError: null });

      try {
        logger.debug("Updating measurement", { id });

        const result = await updateMeasurement({
          ...measurement,
          id,
        });

        if (result.error) {
          logger.warn("Error updating measurement", {
            id,
            error: result.error,
          });
          set({
            measurementsError: result.error,
            measurementsLoading: false,
          });
          return;
        }

        logger.info("Measurement updated successfully", { id });

        // Obtenemos el profileId de la medición que estamos actualizando
        const profileId = get().measurements.find(
          (m) => m.id === id
        )?.profile_id;

        if (profileId) {
          // Actualiza el estado local
          await get().fetchMeasurements(profileId);
        }

        set({ measurementsLoading: false });
      } catch (error) {
        logger.error(
          "Exception in updateMeasurement",
          error instanceof Error ? error : new Error(String(error)),
          { id }
        );
        set({
          measurementsError:
            typeof error === "string" ? error : "Failed to update measurement",
          measurementsLoading: false,
        });
      }
    },
    deleteMeasurement: async (id) => {
      set({ measurementsLoading: true, measurementsError: null });

      try {
        logger.debug("Deleting measurement", { id });

        // Guardamos el profileId antes de eliminar
        const profileId = get().measurements.find(
          (m) => m.id === id
        )?.profile_id;

        const result = await deleteMeasurement({ id });

        if (result.error) {
          logger.warn("Error deleting measurement", {
            id,
            error: result.error,
          });
          set({
            measurementsError: result.error,
            measurementsLoading: false,
          });
          return;
        }

        logger.info("Measurement deleted successfully", { id });

        // Actualizamos el estado local sin necesidad de recargar todo
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
          measurementsLoading: false,
        }));
      } catch (error) {
        logger.error(
          "Exception in deleteMeasurement",
          error instanceof Error ? error : new Error(String(error)),
          { id }
        );
        set({
          measurementsError:
            typeof error === "string" ? error : "Failed to delete measurement",
          measurementsLoading: false,
        });
      }
    },
  };
});
