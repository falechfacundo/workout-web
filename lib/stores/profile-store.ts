import { create } from "zustand";
import {
  getCurrentProfile,
  updateUserProfile,
  type ProfileFormData,
} from "@/lib/actions/profile";
import { createLogger } from "@/lib/utils/logger";
import { type Profile } from "@/lib/schemas/profile";

const logger = createLogger("profile-store");

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  updateUserProfile: (data: ProfileFormData) => Promise<any>;
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
  };
});
