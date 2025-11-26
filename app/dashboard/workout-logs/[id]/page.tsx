import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkoutLog, getWorkoutSets } from "@/lib/actions/workout-logs";
import { WorkoutTimer } from "@/components/workout/workout-timer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MuscleGroupVolumeChart } from "@/components/workout/muscle-group-volume-chart";

interface WorkoutLogDetailPageProps {
  params: {
    id: string;
  };
}

export default async function WorkoutLogDetailPage({
  params,
}: WorkoutLogDetailPageProps) {
  try {
    const workout = await getWorkoutLog(params.id);
    const sets = await getWorkoutSets(params.id);

    // Group sets by exercise
    const exerciseSets = {};
    sets.forEach((set) => {
      if (!exerciseSets[set.exercise_id]) {
        exerciseSets[set.exercise_id] = {
          exercise: set.exercise,
          sets: [],
        };
      }
      exerciseSets[set.exercise_id].sets.push(set);
    });

    // Calculate muscle group metrics
    const muscleGroupData = await calculateMuscleGroupMetrics(sets);

    const isCompleted = !!workout.completed_at;

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
                  {new Date(workout.started_at).toLocaleString()}
                </p>
              </div>
            </div>
            {!isCompleted && (
              <Button asChild>
                <Link href={`/dashboard/workout-logs/${params.id}/complete`}>
                  <Save className="mr-2 h-4 w-4" />
                  Complete Workout
                </Link>
              </Button>
            )}
          </div>

          {!isCompleted && <WorkoutTimer className="mb-2" />}

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
                          <div className="col-span-2">Reps</div>
                          <div className="col-span-3">Weight</div>
                          <div className="col-span-2">RIR</div>
                          <div className="col-span-3">Rest</div>
                          <div className="col-span-1"></div>
                        </div>
                        {item.sets.map((set, index) => (
                          <div
                            key={set.id}
                            className="grid grid-cols-12 gap-2 p-3 items-center border-b last:border-0"
                          >
                            <div className="col-span-1 font-medium">
                              {set.set_number}
                            </div>
                            <div className="col-span-2">
                              {set.reps_performed}
                            </div>
                            <div className="col-span-3">
                              {set.weight_lifted} {set.weight_unit}
                            </div>
                            <div className="col-span-2">
                              {set.rir_achieved !== null
                                ? set.rir_achieved
                                : "-"}
                            </div>
                            <div className="col-span-3">
                              {set.rest_taken_seconds
                                ? `${set.rest_taken_seconds}s`
                                : "-"}
                            </div>
                            <div className="col-span-1"></div>
                          </div>
                        ))}
                      </div>

                      {!isCompleted && (
                        <div className="mt-4 flex justify-end">
                          <Button size="sm" asChild>
                            <Link
                              href={`/dashboard/workout-logs/${params.id}/exercise/${item.exercise.id}`}
                            >
                              Add Set
                            </Link>
                          </Button>
                        </div>
                      )}
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
                      {!isCompleted && (
                        <Button asChild>
                          <Link
                            href={`/dashboard/workout-logs/${params.id}/add-exercise`}
                          >
                            Add First Exercise
                          </Link>
                        </Button>
                      )}
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
                            (sum, set) => sum + set.reps_performed,
                            0
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Volume</div>
                        <div className="text-2xl font-bold">
                          {sets
                            .reduce(
                              (sum, set) =>
                                sum + set.weight_lifted * set.reps_performed,
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
  } catch (error) {
    console.error("Error loading workout log:", error);
    return notFound();
  }
}

async function calculateMuscleGroupMetrics(sets: any[]) {
  // Group sets by exercise
  const exerciseSets = sets.reduce((acc, set) => {
    if (!acc[set.exercise_id]) {
      acc[set.exercise_id] = {
        exercise: set.exercise,
        sets: [],
      };
    }
    acc[set.exercise_id].sets.push(set);
    return acc;
  }, {});

  // Calculate volume and weight per muscle group
  const muscleGroupMetrics = {};

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
        const setVolume = set.weight_lifted * set.reps_performed;
        muscleGroupMetrics[primaryMuscleId].volume += setVolume;
        muscleGroupMetrics[primaryMuscleId].weight += set.weight_lifted;
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
          const setVolume = set.weight_lifted * set.reps_performed * 0.5;
          muscleGroupMetrics[muscleId].volume += setVolume;
          muscleGroupMetrics[muscleId].weight += set.weight_lifted * 0.5;
        }
      }
    }
  }

  return Object.values(muscleGroupMetrics);
}
