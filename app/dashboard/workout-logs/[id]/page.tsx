import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkoutLog, getWorkoutSets } from "@/lib/actions/workout-logs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MuscleGroupVolumeChart } from "@/components/dashboard/workout/muscle-group-volume-chart";

interface WorkoutLogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkoutLogDetailPage({
  params,
}: WorkoutLogDetailPageProps) {
  const { id } = await params;

  let workout: any;
  let sets: any[] = [];
  try {
    const workoutResult = await getWorkoutLog(id);

    if (workoutResult.error || !workoutResult.data) {
      return notFound();
    }

    workout = workoutResult.data;
    sets = (await getWorkoutSets(id)) as any[];
  } catch (error) {
    console.error("Error loading workout log:", error);
    return notFound();
  }

  // Calculate muscle group metrics
  const muscleGroupData = await calculateMuscleGroupMetrics(sets);

  // Group sets by exercise
  const exerciseSets: Record<string, any> = {};
  sets.forEach((set: any) => {
    if (!exerciseSets[set.exercise_id]) {
      exerciseSets[set.exercise_id] = {
        exercise: set.exercise,
        sets: [],
      };
    }
    exerciseSets[set.exercise_id].sets.push(set);
  });

  return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/workout-logs">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {workout.session?.name || "Custom Workout"}
                </h1>
                <p className="text-muted-foreground">
                  {workout.mesocycle?.name
                    ? `${workout.mesocycle.name} - `
                    : ""}
                  {workout.date} {workout.start_time ? `- ${new Date(workout.start_time).toLocaleTimeString()}` : ""}
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="exercises">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="exercises" className="mt-4">
              <div className="grid gap-4">
                {Object.values(exerciseSets).map((item: any) => (
                  <Card key={item.exercise.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle>{item.exercise.name}</CardTitle>
                            <CardDescription>
                              {item.exercise.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border">
                        <div className="grid grid-cols-12 gap-2 p-3 font-medium text-sm border-b">
                          <div className="col-span-1">Set</div>
                          <div className="col-span-3">Reps</div>
                          <div className="col-span-3">Weight</div>
                          <div className="col-span-2">RIR</div>
                          <div className="col-span-3"></div>
                        </div>
                        {item.sets.map((set: any) => (
                          <div
                            key={set.id}
                            className="grid grid-cols-12 gap-2 p-3 items-center border-b last:border-0"
                          >
                            <div className="col-span-1 font-medium">
                              {set.set_number}
                            </div>
                            <div className="col-span-3">
                              {set.reps}
                            </div>
                            <div className="col-span-3">
                              {set.weight || 0} kg
                            </div>
                            <div className="col-span-2">
                              {set.rir !== null && set.rir !== undefined
                                ? set.rir
                                : "-"}
                            </div>
                            <div className="col-span-3"></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {Object.keys(exerciseSets).length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <Dumbbell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="mb-2 text-center text-lg font-medium">
                        No exercises logged yet
                      </p>
                      <p className="mb-4 text-center text-muted-foreground">
                        Start adding exercises to track your workout.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Workout Summary</CardTitle>
                    <CardDescription>
                      Overview of your workout performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <div className="text-sm font-medium">
                          Total Exercises
                        </div>
                        <div className="text-2xl font-bold">
                          {Object.keys(exerciseSets).length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Sets</div>
                        <div className="text-2xl font-bold">{sets.length}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Reps</div>
                        <div className="text-2xl font-bold">
                          {sets.reduce(
                            (sum: number, set: any) => sum + set.reps,
                            0
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Volume</div>
                        <div className="text-2xl font-bold">
                          {sets
                            .reduce(
                              (sum: number, set: any) =>
                                sum + (set.weight || 0) * set.reps,
                              0
                            )
                            .toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Volume by Muscle Group</CardTitle>
                    <CardDescription>
                      Training volume distribution across muscle groups
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <MuscleGroupVolumeChart data={muscleGroupData} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
}

async function calculateMuscleGroupMetrics(sets: any[]) {
  const exerciseSets: Record<string, any> = {};

  sets.forEach((set: any) => {
    if (!set.exercise || !set.exercise_id) return;

    if (!exerciseSets[set.exercise_id]) {
      exerciseSets[set.exercise_id] = {
        exercise: set.exercise,
        sets: [],
      };
    }

    exerciseSets[set.exercise_id].sets.push(set);
  });

  const muscleGroupMetrics: Record<string, any> = {};

  for (const exerciseId in exerciseSets) {
    const { exercise, sets } = exerciseSets[exerciseId];

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

      muscleGroupMetrics[primaryMuscleId].sets += sets.length;

      for (const set of sets) {
        const setVolume = (set.weight || 0) * set.reps;
        muscleGroupMetrics[primaryMuscleId].volume += setVolume;
        muscleGroupMetrics[primaryMuscleId].weight += set.weight || 0;
      }
    }

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

        muscleGroupMetrics[muscleId].sets += sets.length * 0.5;

        for (const set of sets) {
          const setVolume = (set.weight || 0) * set.reps * 0.5;
          muscleGroupMetrics[muscleId].volume += setVolume;
          muscleGroupMetrics[muscleId].weight += (set.weight || 0) * 0.5;
        }
      }
    }
  }

  return Object.values(muscleGroupMetrics);
}
