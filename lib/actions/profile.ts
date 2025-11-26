"use server";

import { z } from "zod";

import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";
import { type Profile, profileFormSchema } from "@/lib/schemas/profile";

// Create a specific logger for this module
const logger = createLogger("profile-actions");
  sex: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .nullable(),
  experience_level: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional()
    .nullable(),
  training_goal: z
    .enum([
      "strength",
      "hypertrophy",
      "endurance",
      "weight_loss",
      "general_fitness",
      "sport_specific",
    ])
    .optional()
    .nullable(),
  weekly_availability: z
    .number()
    .min(1, "Must be at least 1 day")
    .max(7, "Cannot exceed 7 days")
    .optional()
    .nullable(),
  session_duration_preference: z
    .number()
    .min(10, "Session must be at least 10 minutes")
    .optional()
    .nullable(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

// Get the current user's profile
export const getCurrentProfile = safeAction(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "User not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
});

// Update the user's profile
export const updateUserProfile = safeAction(profileFormSchema, async (data) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "User not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
});
