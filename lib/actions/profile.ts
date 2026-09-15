"use server";

import { z } from "zod";

import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeAction } from "@/lib/utils/safe-action";
import { type Profile, profileFormSchema } from "@/lib/schemas/profile";

export type ProfileFormData = z.infer<typeof profileFormSchema>;

export async function getCurrentProfile() {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "User not authenticated" };
    }

    const profile = await db.profile.findFirst({
      where: { user_id: user.id },
    });

    if (!profile) {
      return { data: null, error: "Profile not found" };
    }

    return { data: profile as any as Profile, error: null };
  });
}

export async function updateUserProfile(data: ProfileFormData) {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "User not authenticated" };
    }

    const validatedData = profileFormSchema.parse(data);

    const profile = await db.profile.update({
      where: { user_id: user.id },
      data: {
        ...validatedData,
      },
    });

    return { data: profile as any as Profile, error: null };
  });
}