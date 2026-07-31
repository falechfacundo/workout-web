"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PerformanceMetrics } from "@/components/dashboard/analytics/performance-metrics";
import { VolumeByMuscleGroup } from "@/components/dashboard/analytics/volume-by-muscle-group";
import { ExerciseProgressChart } from "@/components/dashboard/analytics/exercise-progress-chart";
import { WorkoutFrequencyChart } from "@/components/dashboard/analytics/workout-frequency-chart";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function AnalyticsPage() {
  // Use auth protection
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">Loading analytics data...</div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null; // Will be redirected by useRequireAuth
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your progress and analyze your training data.
          </p>
        </div>

        <PerformanceMetrics userId={user.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <VolumeByMuscleGroup userId={user.id} />
          <ExerciseProgressChart userId={user.id} />
        </div>

        <WorkoutFrequencyChart userId={user.id} />
      </div>
    </DashboardLayout>
  );
}
