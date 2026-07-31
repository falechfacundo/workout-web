import { create } from "zustand";
import {
  getCurrentProfile,
  updateUserProfile,
  type ProfileFormData,
} from "@/lib/actions/profile";
import { getMeasurements, addMeasurement, updateMeasurement, deleteMeasurement } from "@/lib/actions/measurements";
import { createLogger } from "@/lib/utils/logger";
import { type Profile } from "@/lib/schemas/profile";
import { type Measurement } from "@/lib/schemas/measurement";

const logger = createLogger("profile-store");

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  measurements: Measurement[];
  measurementsLoading: boolean;
  measurementsError: string | null;

  fetchProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  updateUserProfile: (data: ProfileFormData) => Promise<any>;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string | null) => void;
  reset: () => void;

  fetchMeasurements: (profileId: string) => Promise<void>;
  addMeasurement: (profileId: string, measurement: any) => Promise<any>;
  updateMeasurement: (id: string, measurement: any) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => {
  return {
    profile: null,
    isLoading: false,
    error: null,
    measurements: [],
    measurementsLoading: false,
    measurementsError: null,

    fetchProfile: async () => {
      try {
        logger.debug("Fetching user profile");
        set({ isLoading: true, error: null });

        const response = await getCurrentProfile();

        if (response.error) {
          logger.warn("Error fetching user profile", { error: response.error });
          set({ error: response.error, isLoading: false });
          return;
        }

        set({
          profile: response.data as Profile,
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
          set({ error: result.error, isLoading: false });
          return result;
        }

        set({
          profile: { ...get().profile, ...(result.data as Partial<Profile>) } as Profile,
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
    reset: () => set({ profile: null, isLoading: false, error: null }),

    fetchMeasurements: async (profileId: string) => {
      if (!profileId) return;
      set({ measurementsLoading: true, measurementsError: null });
      try {
        const result = await getMeasurements();
        if (result.error) {
          set({ measurementsError: result.error, measurementsLoading: false });
          return;
        }
        set({ measurements: (result.data as Measurement[]) || [], measurementsLoading: false });
      } catch (error) {
        set({
          measurementsError:
            typeof error === "string" ? error : "Failed to load measurement history",
          measurementsLoading: false,
        });
      }
    },

    addMeasurement: async (profileId: string) => {
      set({ measurementsLoading: true, measurementsError: null });
      try {
        const result = await addMeasurement();
        if (result.error) {
          set({ measurementsError: result.error, measurementsLoading: false });
          return null;
        }
        await get().fetchMeasurements(profileId);
        set({ measurementsLoading: false });
        return result.data;
      } catch (error) {
        set({
          measurementsError:
            typeof error === "string" ? error : "Failed to add new measurement",
          measurementsLoading: false,
        });
        return null;
      }
    },

    updateMeasurement: async (id: string) => {
      set({ measurementsLoading: true, measurementsError: null });
      try {
        const result = await updateMeasurement();
        if (result.error) {
          set({ measurementsError: result.error, measurementsLoading: false });
          return;
        }
        const profileId = get().measurements.find((m) => m.id === id)?.user_id;
        if (profileId) {
          await get().fetchMeasurements(profileId);
        }
        set({ measurementsLoading: false });
      } catch (error) {
        set({
          measurementsError:
            typeof error === "string" ? error : "Failed to update measurement",
          measurementsLoading: false,
        });
      }
    },

    deleteMeasurement: async (id: string) => {
      set({ measurementsLoading: true, measurementsError: null });
      try {
        const result = await deleteMeasurement();
        if (result.error) {
          set({ measurementsError: result.error, measurementsLoading: false });
          return;
        }
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
          measurementsLoading: false,
        }));
      } catch (error) {
        set({
          measurementsError:
            typeof error === "string" ? error : "Failed to delete measurement",
          measurementsLoading: false,
        });
      }
    },
  };
});
