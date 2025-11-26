"use client";

import { ComponentType } from "react";
import { useRequireAuth } from "./use-require-auth";

type WithAuthOptions = {
  redirectTo?: string;
  redirectIfFound?: boolean;
  LoadingComponent?: ComponentType;
};

/**
 * Higher-Order Component that protects routes requiring authentication
 *
 * @param Component - The component to wrap with authentication protection
 * @param options - Configuration options for the auth protection
 * @returns A new component with authentication protection
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo,
    redirectIfFound,
    LoadingComponent = DefaultLoading,
  } = options;

  return function AuthProtectedComponent(props: P) {
    const { user, isLoading } = useRequireAuth({
      redirectTo,
      redirectIfFound,
    });

    if (isLoading) {
      return <LoadingComponent />;
    }

    // If we're redirecting, don't render anything
    if (!redirectIfFound && !user) {
      return null;
    }

    // If this is a guest-only page and we have a user, don't render
    if (redirectIfFound && user) {
      return null;
    }

    // Otherwise, render the protected component
    return <Component {...props} />;
  };
}

function DefaultLoading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
