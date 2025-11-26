"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Dumbbell, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTrainingSessionsStore } from "@/lib/stores/training-sessions-store";

interface WeekContentProps {
  mesocycleId: string;
  weekNumber: number;
}

export function WeekContent({ mesocycleId, weekNumber }: WeekContentProps) {
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [exercisesLoaded, setExercisesLoaded] = useState<{
    [key: string]: boolean;
  }>({});
  const [exercisesData, setExercisesData] = useState<{ [key: string]: any[] }>(
    {}
  );

  const {
    sessions,
    isLoading,
    error,
    fetchSessionsByMesocycle,
    fetchSessionExercises,
  } = useTrainingSessionsStore();

  // Filtrar sesiones para esta semana
  const weekSessions = sessions.filter(
    (session) => session.week_number === weekNumber
  );

  useEffect(() => {
    async function loadSessions() {
      await fetchSessionsByMesocycle(mesocycleId);
      setSessionsLoaded(true);
    }

    loadSessions();
  }, [mesocycleId, fetchSessionsByMesocycle]);

  // Cargar ejercicios para cada sesión
  useEffect(() => {
    async function loadExercises() {
      if (!sessionsLoaded || weekSessions.length === 0) return;

      for (const session of weekSessions) {
        if (!exercisesLoaded[session.id]) {
          try {
            const exercises = await fetchSessionExercises(session.id);
            setExercisesData((prev) => ({
              ...prev,
              [session.id]: exercises,
            }));
            setExercisesLoaded((prev) => ({
              ...prev,
              [session.id]: true,
            }));
          } catch (err) {
            console.error(
              `Error loading exercises for session ${session.id}:`,
              err
            );
            setExercisesLoaded((prev) => ({
              ...prev,
              [session.id]: true, // Marcarlo como cargado aunque haya fallado
            }));
          }
        }
      }
    }

    loadExercises();
  }, [sessionsLoaded, weekSessions, fetchSessionExercises, exercisesLoaded]);

  if (isLoading || !sessionsLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Cargando sesiones para la semana {weekNumber}...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">
            Error al cargar las sesiones: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (weekSessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="mb-2 text-center text-lg font-medium">
            No hay sesiones para la Semana {weekNumber}
          </p>
          <p className="mb-4 text-center text-muted-foreground">
            Añade sesiones de entrenamiento para planificar tus entrenamientos
            de esta semana.
          </p>
          <Button asChild>
            <Link href={`/dashboard/mesocycles/${mesocycleId}/sessions/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Sesión
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dayNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  return (
    <div className="grid gap-4">
      {weekSessions.map((session) => {
        const sessionExercises = exercisesData[session.id] || [];
        const isExercisesLoading = !exercisesLoaded[session.id];

        return (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{session.name}</CardTitle>
                    <CardDescription>
                      {session.day_of_week !== null
                        ? `${dayNames[session.day_of_week]} - `
                        : ""}
                      {isExercisesLoading
                        ? "Cargando ejercicios..."
                        : `${sessionExercises.length} ejercicios`}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">
                  {session.day_of_week !== null
                    ? dayNames[session.day_of_week]
                    : "Flexible"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="font-medium">Ejercicios</div>
                  <div className="space-y-2">
                    {isExercisesLoading ? (
                      <p className="text-center text-muted-foreground py-4">
                        Cargando ejercicios...
                      </p>
                    ) : sessionExercises.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No hay ejercicios añadidos a esta sesión
                      </p>
                    ) : (
                      sessionExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex flex-col gap-2 rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <Dumbbell className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {exercise.exercise.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {exercise.target_sets} series ×{" "}
                                {exercise.target_reps_min &&
                                exercise.target_reps_max
                                  ? `${exercise.target_reps_min}-${exercise.target_reps_max}`
                                  : exercise.target_reps_min ||
                                    exercise.target_reps_max ||
                                    "?"}{" "}
                                reps
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {exercise.planned_rest_seconds || 90}s
                                  descanso
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Target className="h-3 w-3" />
                                <span>
                                  RIR:{" "}
                                  {exercise.target_rir !== null
                                    ? exercise.target_rir
                                    : "?"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {exercise.notes && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              <span className="font-medium">Notas:</span>{" "}
                              {exercise.notes}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/mesocycles/${mesocycleId}/sessions/${session.id}`}
                    >
                      Ver
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link
                      href={`/dashboard/workout-logs/new?template=${session.id}`}
                    >
                      Empezar Entrenamiento
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
