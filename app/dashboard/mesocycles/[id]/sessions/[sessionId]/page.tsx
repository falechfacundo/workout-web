"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useTrainingSessionsStore } from "@/lib/stores/training-sessions-store";
import { ArrowLeft, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TrainingSessionDetailPageProps {
  params: {
    id: string;
    sessionId: string;
  };
}

export default function TrainingSessionDetailPage({
  params,
}: TrainingSessionDetailPageProps) {
  const router = useRouter();
  const {
    currentSession,
    sessionExercises,
    isLoading,
    error,
    fetchSession,
    fetchSessionExercises,
    reset,
  } = useTrainingSessionsStore();

  useEffect(() => {
    // Cargar los datos de la sesión y sus ejercicios
    async function loadData() {
      try {
        await fetchSession(params.sessionId);
        await fetchSessionExercises(params.sessionId);
      } catch (error) {
        console.error("Error loading session data:", error);
      }
    }

    loadData();

    // Limpiar al desmontar
    return () => {
      reset();
    };
  }, [params.sessionId, fetchSession, fetchSessionExercises, reset]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col items-center justify-center p-12">
            <div className="text-center">
              <h2 className="text-xl font-medium">Cargando sesión...</h2>
              <p className="text-muted-foreground mt-2">
                Espera mientras se cargan los datos de la sesión
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !currentSession) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col items-center justify-center p-12">
            <div className="text-center">
              <h2 className="text-xl font-medium text-destructive">
                Error al cargar la sesión
              </h2>
              <p className="text-muted-foreground mt-2">
                {error || "No se pudo encontrar la sesión solicitada"}
              </p>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="mt-4"
              >
                Volver
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/mesocycles/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentSession.name}
              </h1>
              <p className="text-muted-foreground">
                {currentSession.day_of_week !== null
                  ? `${dayNames[currentSession.day_of_week]} - `
                  : ""}
                {currentSession.week_number
                  ? `Week ${currentSession.week_number}`
                  : ""}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link
              href={`/dashboard/mesocycles/${params.id}/sessions/${params.sessionId}/exercises/new`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Link>
          </Button>
        </div>

        {currentSession.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{currentSession.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Exercises</h2>

          {sessionExercises.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Dumbbell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-2 text-center text-lg font-medium">
                  No exercises added yet
                </p>
                <p className="mb-4 text-center text-muted-foreground">
                  Start building your workout by adding exercises to this
                  session.
                </p>
                <Button asChild>
                  <Link
                    href={`/dashboard/mesocycles/${params.id}/sessions/${params.sessionId}/exercises/new`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Exercise
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            sessionExercises.map((exercise: any) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{exercise.exercise.name}</CardTitle>
                        <CardDescription>
                          {exercise.exercise.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-sm font-medium">Sets</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.target_sets}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Reps</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.target_reps_min && exercise.target_reps_max
                          ? `${exercise.target_reps_min}-${exercise.target_reps_max}`
                          : exercise.target_reps_min ||
                            exercise.target_reps_max ||
                            "Not specified"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">RIR</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.target_rir !== null
                          ? exercise.target_rir
                          : "Not specified"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Rest</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.planned_rest_seconds
                          ? `${exercise.planned_rest_seconds} seconds`
                          : "Not specified"}
                      </div>
                    </div>
                  </div>

                  {exercise.notes && (
                    <div className="mt-4">
                      <div className="text-sm font-medium">Notes</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.notes}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/mesocycles/${params.id}/sessions/${params.sessionId}/exercises/${exercise.id}/edit`}
                      >
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
