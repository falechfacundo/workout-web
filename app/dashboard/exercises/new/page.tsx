"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ExerciseForm } from "@/components/forms/exercise/exercise-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "@/components/ui/data-skeletons";

export default function NewExercisePage() {
  // Use auth protection
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="mx-auto w-full max-w-2xl">
            <ChartSkeleton height={480} />
          </div>
        </div>
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
            <Link href="/dashboard/exercises">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Exercise</h1>
            <p className="text-muted-foreground">
              Create a new exercise for your training programs.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <ExerciseForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
