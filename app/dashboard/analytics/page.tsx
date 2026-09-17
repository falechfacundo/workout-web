"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PerformanceMetrics } from "@/components/dashboard/analytics/performance-metrics";
import { VolumeByMuscleGroup } from "@/components/dashboard/analytics/volume-by-muscle-group";
import { ExerciseProgressChart } from "@/components/dashboard/analytics/exercise-progress-chart";
import { WorkoutFrequencyChart } from "@/components/dashboard/analytics/workout-frequency-chart";
import { ConsistencyCard } from "@/components/dashboard/analytics/consistency-card";
import { PersonalRecordsCard } from "@/components/dashboard/analytics/personal-records-card";
import { BodyMapCard } from "@/components/dashboard/analytics/body-map-card";
import { RirTrendCard } from "@/components/dashboard/analytics/rir-trend-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StatGridSkeleton,
  ChartSkeleton,
} from "@/components/ui/data-skeletons";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function AnalyticsPage() {
  // Use auth protection
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <StatGridSkeleton />
          <div className="grid gap-4 md:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <ChartSkeleton height={320} />
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

        <div className="grid gap-4 md:grid-cols-2">
          <WorkoutFrequencyChart userId={user.id} />
          <ConsistencyCard userId={user.id} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RirTrendCard userId={user.id} />
          <BodyMapCard userId={user.id} />
        </div>

        <BodyMapCard userId={user.id} />

        <PersonalRecordsCard userId={user.id} />
      </div>
    </DashboardLayout>
  );
}
