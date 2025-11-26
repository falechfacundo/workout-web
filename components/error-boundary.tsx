"use client";

import { useEffect } from "react";
import { ServerError } from "./server-error";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error);
  }, [error]);

  return <ServerError error={error} reset={reset} />;
}
