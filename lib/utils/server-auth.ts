"use server";

import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function requireAuth(
  options: {
    redirectTo?: string;
  } = {}
) {
  const { redirectTo = "/auth/login" } = options;
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const returnUrl = encodeURIComponent(
      global?.window?.location?.pathname || ""
    );
    const redirectUrl = returnUrl
      ? `${redirectTo}?returnUrl=${returnUrl}`
      : redirectTo;

    redirect(redirectUrl);
  }

  return session!.user;
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return session.user;
}
