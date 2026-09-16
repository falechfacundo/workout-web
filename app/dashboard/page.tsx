"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RowListSkeleton } from "@/components/ui/data-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MuscleGroupVolumeChart } from "@/components/dashboard/workout/muscle-group-volume-chart";
import { WorkoutFrequencyChart } from "@/components/dashboard/analytics/workout-frequency-chart";
import { useMesocyclesStore } from "@/lib/stores/mesocycles-store";
import { useWorkoutLogsStore } from "@/lib/stores/workout-logs-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getPerformanceMetrics, getVolumeByMuscleGroup } from "@/lib/actions/analytics";

function MetricCard({
  title,
  loading,
  value,
  caption,
}: {
  title: string;
  loading: boolean;
  value: string;
  caption: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{caption}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MesocyclesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [volumeLoading, setVolumeLoading] = useState(true);
  const [muscleGroupVolume, setMuscleGroupVolume] = useState<any[]>([]);

  const { user, isLoading: authLoading } = useRequireAuth();

  const {
    activeMesocycles,
    isLoading: mesocyclesLoading,
    fetchActiveMesocycles,
  } = useMesocyclesStore();
  const { fetchWorkoutStats } = useWorkoutLogsStore();

  useEffect(() => {
    async function loadData() {
      if (authLoading || !user) return;

      try {
        await Promise.all([
          fetchActiveMesocycles(user.id),
          fetchWorkoutStats(user.id, "month"),
        ]);

        const metricsResult = await getPerformanceMetrics(user.id);

        if (metricsResult.error) {
          setError("Error loading performance metrics");
        } else {
          setMetrics(
            metricsResult.data || {
              totalWorkouts: 0,
              totalVolume: 0,
              totalSets: 0,
              avgDuration: 0,
            }
          );
        }
        setMetricsLoading(false);

        const { data: volumeData, error: volumeError } =
          await getVolumeByMuscleGroup(user.id, "month");

        if (volumeError) {
          console.error("Error loading muscle group volume:", volumeError);
        } else {
          setMuscleGroupVolume((volumeData as any[]) || []);
        }
        setVolumeLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Error loading dashboard data");
        setMetricsLoading(false);
        setVolumeLoading(false);
      }
    }

    loadData();
  }, [authLoading, user, fetchActiveMesocycles, fetchWorkoutStats]);

  if (authLoading && !user) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your workout training management dashboard.
              </p>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <RowListSkeleton rows={3} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-52" />
              </CardHeader>
              <CardContent>
                <MesocyclesListSkeleton />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full rounded-lg" />
            </CardContent>
          </Card>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your workout training management dashboard.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/workout-logs/new">Start New Workout</Link>
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Workouts"
            loading={metricsLoading}
            value={`${metrics?.totalWorkouts ?? 0}`}
            caption="Workouts completed"
          />
          <MetricCard
            title="Total Volume"
            loading={metricsLoading}
            value={(metrics?.totalVolume ?? 0).toLocaleString()}
            caption="Weight × reps this month"
          />
          <MetricCard
            title="Total Sets"
            loading={metricsLoading}
            value={`${metrics?.totalSets ?? 0}`}
            caption="Sets completed this month"
          />
          <MetricCard
            title="Avg. Duration"
            loading={metricsLoading}
            value={`${metrics?.avgDuration ?? 0}`}
            caption="Minutes per workout"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Upcoming Workouts</CardTitle>
              <CardDescription>
                Your scheduled training sessions for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mesocyclesLoading ? (
                <RowListSkeleton rows={3} />
              ) : activeMesocycles.length > 0 ? (
                <div className="space-y-4">
                  {activeMesocycles.slice(0, 3).map((mesocycle, index) => (
                    <div
                      key={mesocycle.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {mesocycle.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {["Today", "Tomorrow", "Friday"][index]} •{" "}
                          {mesocycle.status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/mesocycles/${mesocycle.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 text-center text-muted-foreground">
                  <p>
                    No active mesocycles. Create a training program to get
                    started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Active Mesocycles</CardTitle>
              <CardDescription>Your current training programs</CardDescription>
            </CardHeader>
            <CardContent>
              {mesocyclesLoading ? (
                <MesocyclesListSkeleton />
              ) : activeMesocycles.length > 0 ? (
                <div className="space-y-4">
                  {activeMesocycles.map((mesocycle) => {
                    const startDate = new Date(mesocycle.start_date);
                    const endDate = new Date(mesocycle.end_date);
                    const today = new Date();
                    const totalDays = Math.ceil(
                      (endDate.getTime() - startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const daysElapsed = Math.max(
                      0,
                      Math.min(
                        totalDays,
                        Math.ceil(
                          (today.getTime() - startDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                    );
                    const progressPercentage =
                      totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

                    return (
                      <div key={mesocycle.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{mesocycle.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.ceil(daysElapsed / 7)} of{" "}
                            {Math.ceil(totalDays / 7)} weeks
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <div>
                            Started:{" "}
                            {new Date(
                              mesocycle.start_date
                            ).toLocaleDateString()}
                          </div>
                          <div>
                            Ends:{" "}
                            {new Date(mesocycle.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 text-center text-muted-foreground">
                  <p>
                    No active mesocycles. Create a training program to get
                    started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="volume">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="volume">Muscle Group Volume</TabsTrigger>
            <TabsTrigger value="frequency">Workout Frequency</TabsTrigger>
          </TabsList>
          <TabsContent value="volume" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Volume by Muscle Group</CardTitle>
                <CardDescription>
                  Training volume distribution across muscle groups this month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {volumeLoading ? (
                  <Skeleton className="h-80 w-full rounded-lg" />
                ) : (
                  <MuscleGroupVolumeChart data={muscleGroupVolume} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="frequency" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Frequency</CardTitle>
                <CardDescription>
                  Number of workouts completed over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <WorkoutFrequencyChart userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}