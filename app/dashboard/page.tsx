"use client";

import { useState, useEffect } from "react";
import { Dumbbell, Calendar, Target, BarChart3, Clock } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MuscleGroupVolumeChart } from "@/components/dashboard/workout/muscle-group-volume-chart";
import { WorkoutFrequencyChart } from "@/components/dashboard/analytics/workout-frequency-chart";
import { createClient } from "@/lib/utils/supabase/client";
import { useMesocyclesStore } from "@/lib/stores/mesocycles-store";
import { useWorkoutLogsStore } from "@/lib/stores/workout-logs-store";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muscleGroupVolume, setMuscleGroupVolume] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const supabase = createClient();

  const { user, isLoading: authLoading } = useRequireAuth();

  const { activeMesocycles, fetchActiveMesocycles } = useMesocyclesStore();
  const { workoutStats, fetchWorkoutStats } = useWorkoutLogsStore();

  // Cargar datos cuando el usuario está autenticado
  useEffect(() => {
    async function loadData() {
      if (authLoading || !user) return;

      setLoading(true);
      try {
        // Cargar datos necesarios para el dashboard
        await Promise.all([
          fetchActiveMesocycles(user.id),
          fetchWorkoutStats(user.id, "month"),
        ]);

        // Obtener métricas de rendimiento
        const { data: analyticsData, error: analyticsError } = await supabase
          .from("analytics_performance_metrics")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (analyticsError && analyticsError.code !== "PGRST116") {
          setError("Error loading performance metrics");
        } else {
          setMetrics(
            analyticsData || {
              totalWorkouts: 0,
              totalVolume: 0,
              totalSets: 0,
              avgDuration: 0,
            }
          );
        }

        // Obtener volumen por grupo muscular
        const { data: volumeData, error: volumeError } = await supabase.rpc(
          "get_volume_by_muscle_group",
          { user_id_param: user.id, period_param: "month" }
        );

        if (volumeError) {
          console.error("Error loading muscle group volume:", volumeError);
        } else {
          setMuscleGroupVolume(volumeData || []);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, user, supabase, fetchActiveMesocycles, fetchWorkoutStats]);

  // Muestra loading durante la carga
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">Loading dashboard data...</div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null; // Will be redirected by useRequireAuth
  }

  // Muestra error si ocurre
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {error || "Error loading dashboard data"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalWorkouts || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Workouts completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics?.totalVolume || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Weight × reps this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalSets || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Sets completed this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.avgDuration || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Minutes per workout
              </p>
            </CardContent>
          </Card>
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
              <div className="space-y-4">
                {activeMesocycles.length > 0 ? (
                  activeMesocycles.slice(0, 3).map((mesocycle, index) => (
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
                  ))
                ) : (
                  <div className="flex items-center justify-center p-4 text-center text-muted-foreground">
                    <p>
                      No active mesocycles. Create a training program to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Active Mesocycles</CardTitle>
              <CardDescription>Your current training programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeMesocycles.length > 0 ? (
                  activeMesocycles.map((mesocycle) => {
                    // Calculate progress
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
                  })
                ) : (
                  <div className="flex items-center justify-center p-4 text-center text-muted-foreground">
                    <p>
                      No active mesocycles. Create a training program to get
                      started.
                    </p>
                  </div>
                )}
              </div>
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
                <MuscleGroupVolumeChart data={muscleGroupVolume} />
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
                {user && <WorkoutFrequencyChart userId={user.id} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
