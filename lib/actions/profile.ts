"use server";

import { z } from "zod";

import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { type Profile, profileFormSchema } from "@/lib/schemas/profile";

export type ProfileFormData = z.infer<typeof profileFormSchema>;

export async function getCurrentProfile() {
  return safeAction(async () => {
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

    return { data: profile as Profile, error: null };
  });
}

export async function updateUserProfile(data: ProfileFormData) {
  return safeAction(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const validatedData = profileFormSchema.parse(data);

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: profile as Profile, error: null };
  });
}
