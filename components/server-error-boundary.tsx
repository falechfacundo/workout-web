"use client";

import { useEffect } from "react";
import { ServerError } from "./server-error";

interface ServerErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  context?: string;
}

export function ServerErrorBoundary({
  error,
  reset,
  context = "server",
}: ServerErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(`${context} error:`, error);
  }, [error, context]);

  // Handle specific error types
  if (error.message.includes("NEXT_NOT_FOUND")) {
    return (
      <ServerError
        error={new Error("The requested resource was not found")}
        reset={reset}
      />
    );
  }

  if (error.message.includes("NEXT_REDIRECT")) {
    return null; // Let Next.js handle the redirect
  }

  // For database or other server errors, show a generic message
  if (
    error.message.includes("Database") ||
    error.message.includes("NEXT_SERVER")
  ) {
    return (
      <ServerError
        error={new Error("A server error occurred. Please try again later.")}
        reset={reset}
      />
    );
  }

  // Default error view
  return <ServerError error={error} reset={reset} />;
}
