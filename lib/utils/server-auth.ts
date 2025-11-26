"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Utility function to require authentication in server components or server actions
 * Returns the user if authenticated, otherwise redirects
 *
 * @param options Configuration options
 * @returns User object if authenticated
 */
export async function requireAuth(
  options: {
    redirectTo?: string;
  } = {}
) {
  const { redirectTo = "/auth/login" } = options;
  const cookieStore = cookies();
  const supabase = createClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Get the current URL to use as returnUrl parameter
    const returnUrl = encodeURIComponent(
      global?.window?.location?.pathname || ""
    );
    const redirectUrl = returnUrl
      ? `${redirectTo}?returnUrl=${returnUrl}`
      : redirectTo;

    redirect(redirectUrl);
  }

  return session.user;
}

/**
 * Utility to get current user in server components without redirection
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return session.user;
}
