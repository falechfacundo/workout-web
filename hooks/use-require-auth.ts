"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type UseRequireAuthOptions = {
  redirectTo?: string;
  redirectIfFound?: boolean;
};

/**
 * Hook to protect routes that require authentication.
 *
 * @param options.redirectTo - The path to redirect to if authentication check fails (default: '/auth/login')
 * @param options.redirectIfFound - If true, redirect when user is found (useful for guest-only pages)
 *
 * @returns An object containing the user, session, and loading state
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = "/auth/login", redirectIfFound = false } = options;
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const user = session?.user ?? null;

  useEffect(() => {
    // Don't do anything while auth state is loading
    if (isLoading) return;

    // Handle redirect based on authentication state
    if (!redirectIfFound && !user) {
      // User not found and we require them to be logged in
      router.push(redirectTo);
    } else if (redirectIfFound && user) {
      // User found but this page is for unauthenticated users only
      router.push("/dashboard");
    }
  }, [user, isLoading, redirectIfFound, redirectTo, router]);

  return { user, session, isLoading };
}