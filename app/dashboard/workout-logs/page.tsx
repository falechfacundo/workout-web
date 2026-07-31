"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  ChevronDown,
  Clock,
  Dumbbell,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MuscleGroupVolumeChart } from "@/components/dashboard/workout/muscle-group-volume-chart";
import { useWorkoutLogsStore } from "@/lib/stores/workout-logs-store";
import { useMesocyclesStore } from "@/lib/stores/mesocycles-store";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";

export default function WorkoutLogsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMesocycleId, setSelectedMesocycleId] = useState<string | null>(
    null
  );

  const {
    workoutLogs,
    workoutSets,
    isLoading: workoutLogsLoading,
    error: workoutLogsError,
    fetchWorkoutLogs,
    fetchWorkoutSets,
  } = useWorkoutLogsStore();

  const { mesocycles, fetchMesocycles } = useMesocyclesStore();

  // Métricas de grupos musculares por workout derivadas de logs y sets
  const calculatedMuscleGroupData = useMemo(() => {
    const muscleGroupMetricsMap: Record<string, any> = {};

    if (!workoutLogs || !workoutSets) return muscleGroupMetricsMap;

    workoutLogs.forEach((log) => {
      const workoutSetsList = workoutSets.filter(
        (set) => set.workout_log_id === log.id
      );

      if (workoutSetsList && workoutSetsList.length > 0) {
        muscleGroupMetricsMap[log.id] =
          calculateMuscleGroupMetricsFromSets(workoutSetsList);
      }
    });

    return muscleGroupMetricsMap;
  }, [workoutLogs, workoutSets]);

  // Logs filtrados derivados de los datos y criterios de filtrado
  const filteredWorkoutLogs = useMemo(() => {
    if (!workoutLogs) return [];

    let filtered = [...workoutLogs];

    if (searchQuery) {
      filtered = filtered.filter((log) => {
        const sessionName = log.session?.name?.toLowerCase() || "";
        const mesocycleName = log.mesocycle?.name?.toLowerCase() || "";
        return (
          sessionName.includes(searchQuery.toLowerCase()) ||
          mesocycleName.includes(searchQuery.toLowerCase())
        );
      });
    }

    if (selectedMesocycleId) {
      filtered = filtered.filter(
        (log) => log.mesocycle_id === selectedMesocycleId
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return filtered;
  }, [workoutLogs, searchQuery, selectedMesocycleId]);

  // Verificar autenticación y cargar datos
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/auth/login");
          return;
        }

        setUser(user);
        await Promise.all([
          fetchWorkoutLogs(user.id),
          fetchMesocycles(user.id),
        ]);
      } catch (err) {
        console.error("Error loading workout logs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase.auth, fetchWorkoutLogs, fetchMesocycles]);

  // Efecto para cargar los sets de cada workout cuando los logs cambian
  useEffect(() => {
    async function loadWorkoutSets() {
      if (!workoutLogs || workoutLogs.length === 0) return;

      for (const log of workoutLogs) {
        try {
          await fetchWorkoutSets(log.id);
        } catch (err) {
          console.error(`Error loading sets for workout ${log.id}:`, err);
        }
      }
    }

    loadWorkoutSets();
  }, [workoutLogs, fetchWorkoutSets]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMesocycleFilter = (mesocycleId: string | null) => {
    setSelectedMesocycleId(mesocycleId);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearFilter = () => {
    setSelectedMesocycleId(null);
  };

  if (loading || workoutLogsLoading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Workout Logs</h1>
          </div>
          <div className="flex justify-center p-8">Loading workout logs...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (workoutLogsError) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Dumbbell className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="mb-2 text-center text-lg font-medium">
                Error loading workout logs
              </p>
              <p className="mb-4 text-center text-muted-foreground">
                {workoutLogsError}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workout Logs</h1>
            <p className="text-muted-foreground">
              Track and review your workout history.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/workout-logs/new">
              <Plus className="mr-2 h-4 w-4" />
              Start New Workout
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search workout logs..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-background pl-8"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Filter by Mesocycle
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mesocycles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedMesocycleId === null}
                onClick={() => handleMesocycleFilter(null)}
              >
                All
              </DropdownMenuCheckboxItem>
              {mesocycles.map((mesocycle) => (
                <DropdownMenuCheckboxItem
                  key={mesocycle.id}
                  checked={selectedMesocycleId === mesocycle.id}
                  onClick={() => mesocycle.id && handleMesocycleFilter(mesocycle.id)}
                >
                  {mesocycle.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges para filters activos */}
        {(searchQuery || selectedMesocycleId) && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <button onClick={clearSearch} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedMesocycleId && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Mesocycle:{" "}
                {mesocycles.find((m) => m.id === selectedMesocycleId)?.name ||
                  "Unknown"}
                <button onClick={clearFilter} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="grid gap-4">
          {!filteredWorkoutLogs || filteredWorkoutLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Dumbbell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-2 text-center text-lg font-medium">
                  {workoutLogs.length === 0
                    ? "No workout logs yet"
                    : "No workout logs found matching your search criteria"}
                </p>
                <p className="mb-4 text-center text-muted-foreground">
                  {workoutLogs.length === 0
                    ? "Start tracking your workouts to see your progress over time."
                    : "Try adjusting your search or filters."}
                </p>
                {workoutLogs.length === 0 && (
                  <Button asChild>
                    <Link href="/dashboard/workout-logs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Start First Workout
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredWorkoutLogs.map((log) => {
              const sets: any[] =
                workoutSets.filter((set: any) => set.workout_log_id === log.id) ||
                [];
              const muscleGroupData = calculatedMuscleGroupData[log.id] || [];

              return (
                <Card key={log.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>
                            {log.session?.name || "Custom Workout"}
                          </CardTitle>
                          <CardDescription>
                            {log.mesocycle?.name
                              ? `${log.mesocycle.name} - `
                              : ""}
                            {new Date(log.date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge>
                        {log.end_time
                          ? new Date(log.date).toLocaleDateString() ===
                            new Date().toLocaleDateString()
                            ? "Today"
                            : new Date(log.date).toLocaleDateString()
                          : "In Progress"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <div className="text-sm font-medium">Duration</div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{log.duration_minutes || "?"} minutes</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Exercises</div>
                          <div className="text-muted-foreground">
                            {new Set(sets.map((set) => set.exercise_id)).size}{" "}
                            completed
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Volume</div>
                          <div className="text-muted-foreground">
                            {sets.length} sets
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Total Weight
                          </div>
                          <div className="text-muted-foreground">
                            {sets
                              .reduce(
                                (sum, set) =>
                                  sum +
                                  (set.weight || 0) *
                                    (set.reps || 0),
                                0
                              )
                              .toLocaleString()}{" "}
                            kg
                          </div>
                        </div>
                      </div>

                      <Tabs defaultValue="exercises">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="exercises">Exercises</TabsTrigger>
                          <TabsTrigger value="muscle-groups">
                            Muscle Groups
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="exercises" className="mt-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Exercises</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(
                                new Set(
                                  sets
                                    .filter((set) => set.exercise)
                                    .map((set) => set.exercise?.name)
                                )
                              ).map((name) => (
                                <Badge key={name} variant="outline">
                                  {name}
                                </Badge>
                              ))}
                              {Array.from(
                                new Set(
                                  sets
                                    .filter((set) => set.exercise)
                                    .map((set) => set.exercise?.name)
                                )
                              ).length === 0 && (
                                <span className="text-muted-foreground">
                                  No exercises recorded
                                </span>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="muscle-groups" className="mt-4">
                          <div className="space-y-4">
                            <div className="text-sm font-medium">
                              Volume by Muscle Group
                            </div>
                            <div className="h-64">
                              <MuscleGroupVolumeChart data={muscleGroupData} />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex justify-end gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/workout-logs/${log.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Función auxiliar para calcular las métricas de grupos musculares
function calculateMuscleGroupMetricsFromSets(sets: any[]) {
  // Group sets by exercise
  const exerciseSets: Record<string, any> = {};

  sets.forEach((set) => {
    if (!set.exercise || !set.exercise_id) return;

    if (!exerciseSets[set.exercise_id]) {
      exerciseSets[set.exercise_id] = {
        exercise: set.exercise,
        sets: [],
      };
    }

    exerciseSets[set.exercise_id].sets.push(set);
  });

  // Calculate volume and weight per muscle group
  const muscleGroupMetrics: Record<string, any> = {};

  for (const exerciseId in exerciseSets) {
    const { exercise, sets } = exerciseSets[exerciseId];

    // Get primary muscle group
    if (exercise.primary_muscle_group_id) {
      const primaryMuscleId = exercise.primary_muscle_group_id;
      const primaryMuscleName = exercise.primary_muscle?.name || "Unknown";

      if (!muscleGroupMetrics[primaryMuscleId]) {
        muscleGroupMetrics[primaryMuscleId] = {
          id: primaryMuscleId,
          name: primaryMuscleName,
          sets: 0,
          volume: 0,
          weight: 0,
        };
      }

      // Add full volume for primary muscle
      muscleGroupMetrics[primaryMuscleId].sets += sets.length;

      for (const set of sets) {
        const setVolume = (set.weight || 0) * (set.reps || 0);
        muscleGroupMetrics[primaryMuscleId].volume += setVolume;
        muscleGroupMetrics[primaryMuscleId].weight += set.weight || 0;
      }
    }

    // Add secondary muscle groups (with reduced volume)
    if (
      exercise.secondary_muscle_groups &&
      exercise.secondary_muscle_groups.length > 0
    ) {
      for (const secondaryMuscle of exercise.secondary_muscle_groups) {
        const muscleId = secondaryMuscle.id;
        const muscleName = secondaryMuscle.name;

        if (!muscleGroupMetrics[muscleId]) {
          muscleGroupMetrics[muscleId] = {
            id: muscleId,
            name: muscleName,
            sets: 0,
            volume: 0,
            weight: 0,
          };
        }

        // Add half volume for secondary muscles
        muscleGroupMetrics[muscleId].sets += sets.length * 0.5;

        for (const set of sets) {
          const setVolume =
            (set.weight || 0) * (set.reps || 0) * 0.5;
          muscleGroupMetrics[muscleId].volume += setVolume;
          muscleGroupMetrics[muscleId].weight += (set.weight || 0) * 0.5;
        }
      }
    }
  }

  return Object.values(muscleGroupMetrics);
}
