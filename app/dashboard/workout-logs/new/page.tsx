"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { WorkoutLogForm } from "@/components/forms/workout-log/workout-log-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function NewWorkoutLogPage() {
  // Use auth protection
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null; // Will be redirected by useRequireAuth
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/workout-logs">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Start New Workout
            </h1>
            <p className="text-muted-foreground">
              Begin a new training session.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <WorkoutLogForm userId={user.id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
