"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Plus,
  Square,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createExerciseLogSet,
  createWorkoutLog,
  updateWorkoutLog,
} from "@/lib/actions/workout-logs";
import { updateTrainingSessionStatus } from "@/lib/actions/training-sessions";

export interface PlayerExercise {
  id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  rir?: number | null;
  rest_between_sets?: number | null;
  order_index?: number;
  exercise?: {
    name: string;
    description?: string | null;
  };
}

interface PerformedSet {
  weight: string;
  reps: string;
  rir: string;
  isDone: boolean;
}

export interface WorkoutResult {
  logId: string;
}

function emptySet(): PerformedSet {
  return { weight: "", reps: "", rir: "", isDone: false };
}

function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    [880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + i * 0.2;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.2);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    return;
  }
}

interface LiveWorkoutProps {
  userId: string;
  sessionId: string;
  mesocycleId: string;
  sessionName: string;
  sessionHref: string;
  exercises: PlayerExercise[];
  onSaved?: (result: WorkoutResult) => void;
}

export function LiveWorkout({
  userId,
  sessionId,
  mesocycleId,
  sessionName,
  sessionHref,
  exercises,
  onSaved,
}: LiveWorkoutProps) {
  const [startedAt] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const prevRest = useRef<number | null>(null);

  const [setsByExercise, setSetsByExercise] = useState<
    Record<string, PerformedSet[]>
  >(() =>
    Object.fromEntries(
      exercises.map((ex) => [
        ex.id,
        Array.from({ length: Math.max(1, ex.sets) }, () => emptySet()),
      ])
    )
  );

  const restActive = restSeconds !== null;

  useEffect(() => {
    if (!restActive) return;
    const t = setInterval(() => {
      setRestSeconds((s) => (s === null ? null : Math.max(0, s - 1)));
    }, 1000);
    return () => clearInterval(t);
  }, [restActive]);

  useEffect(() => {
    if (prevRest.current !== null && prevRest.current > 0 && restSeconds === 0) {
      playChime();
    }
    prevRest.current = restSeconds;
  }, [restSeconds]);

  const totals = useMemo(() => {
    const planned = exercises.reduce(
      (acc, ex) => acc + Math.max(1, setsByExercise[ex.id]?.length ?? ex.sets),
      0
    );
    const done = exercises.reduce(
      (acc, ex) =>
        acc + (setsByExercise[ex.id] ?? []).filter((s) => s.isDone).length,
      0
    );
    return { planned, done };
  }, [exercises, setsByExercise]);

  function updateSet(
    exerciseId: string,
    setIdx: number,
    patch: Partial<PerformedSet>
  ) {
    setSetsByExercise((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).map((s, i) =>
        i === setIdx ? { ...s, ...patch } : s
      ),
    }));
  }

  function toggleSetDone(
    exerciseId: string,
    setIdx: number,
    restBetween?: number | null
  ) {
    const sets = setsByExercise[exerciseId] ?? [];
    const wasDone = sets[setIdx]?.isDone ?? false;
    setSetsByExercise((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).map((s, i) =>
        i === setIdx ? { ...s, isDone: !s.isDone } : s
      ),
    }));
    if (!wasDone && restBetween && restBetween > 0) {
      setRestSeconds(restBetween);
    }
  }

  function addSet(exerciseId: string) {
    setSetsByExercise((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] ?? []), emptySet()],
    }));
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const end = new Date();
      const { data: log, error } = await createWorkoutLog({
        user_id: userId,
        training_session_id: sessionId,
        mesocycle_id: mesocycleId,
        date: end.toISOString().split("T")[0],
        start_time: startedAt.toISOString(),
        end_time: end.toISOString(),
      });

      if (error || !log) {
        toast.error(error || "No se pudo guardar el entrenamiento");
        setSaving(false);
        return;
      }

      const logId = log.id;

      for (const exercise of exercises) {
        const performed = setsByExercise[exercise.id] ?? [];
        for (const [idx, set] of performed.entries()) {
          const hasData = set.reps.trim() !== "" || set.weight.trim() !== "";
          if (!hasData) continue;
          const reps = Number.parseInt(set.reps, 10);
          if (Number.isNaN(reps)) continue;
          const weight =
            set.weight.trim() === ""
              ? undefined
              : Number.parseFloat(set.weight);
          const rir =
            set.rir.trim() === "" ? undefined : Number.parseInt(set.rir, 10);

          await createExerciseLogSet({
            workout_log_id: logId,
            exercise_id: exercise.exercise_id,
            set_number: idx + 1,
            reps,
            weight:
              weight !== undefined && !Number.isNaN(weight) ? weight : undefined,
            rir: rir !== undefined && !Number.isNaN(rir) ? rir : undefined,
          });
        }
      }

      const duration = Math.max(
        1,
        Math.round((end.getTime() - startedAt.getTime()) / 60000)
      );
      await updateWorkoutLog(logId, {
        user_id: userId,
        training_session_id: sessionId,
        mesocycle_id: mesocycleId,
        date: end.toISOString().split("T")[0],
        start_time: startedAt.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: duration,
      });

      await updateTrainingSessionStatus(sessionId, "completed");

      toast.success("Entrenamiento guardado");
      onSaved?.({ logId });
    } catch (err) {
      console.error("Error saving live workout:", err);
      toast.error("Error inesperado al guardar el entrenamiento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={sessionHref}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{sessionName}</h1>
            <p className="text-muted-foreground">
              {totals.done}/{totals.planned} sets completados
            </p>
          </div>
        </div>
        <Button onClick={handleFinish} disabled={saving}>
          <Square className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Finish Workout"}
        </Button>
      </div>

      {restSeconds !== null && (
        <Card className="border-primary/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {formatSeconds(restSeconds)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Descanso en curso
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestSeconds((s) => (s ?? 0) + 30)}
              >
                <Plus className="mr-1 h-3 w-3" />
                30s
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRestSeconds(null)}>
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Esta sesión no tiene ejercicios. Agregalos desde el detalle de la
            sesión antes de entrenar.
          </CardContent>
        </Card>
      ) : (
        exercises.map((exercise, exIdx) => {
          const sets = setsByExercise[exercise.id] ?? [];
          return (
            <Card key={exercise.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {exIdx + 1}
                  </span>
                  <div>
                    <CardTitle>{exercise.exercise?.name ?? "Ejercicio"}</CardTitle>
                    <CardDescription>
                      {exercise.sets} × {exercise.reps}
                      {exercise.rir != null ? ` @ RIR ${exercise.rir}` : ""}
                      {exercise.rest_between_sets
                        ? ` — descanso ${exercise.rest_between_sets}s`
                        : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2.5rem] items-center gap-2 text-xs text-muted-foreground">
                    <span>Set</span>
                    <span>Peso (kg)</span>
                    <span>Reps</span>
                    <span>RIR</span>
                    <span />
                  </div>
                  {sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={cn(
                        "grid grid-cols-[2.5rem_1fr_1fr_3.5rem_2.5rem] items-center gap-2",
                        set.isDone && "opacity-60"
                      )}
                    >
                      <span className="text-sm font-medium">{setIdx + 1}</span>
                      <Input
                        inputMode="decimal"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, { weight: e.target.value })
                        }
                        placeholder={setIdx > 0 ? sets[setIdx - 1].weight || "—" : "0"}
                        className="h-9"
                      />
                      <Input
                        inputMode="numeric"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, { reps: e.target.value })
                        }
                        placeholder={String(exercise.reps)}
                        className="h-9"
                      />
                      <Input
                        inputMode="numeric"
                        value={set.rir}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, { rir: e.target.value })
                        }
                        placeholder={exercise.rir != null ? String(exercise.rir) : ""}
                        className="h-9"
                      />
                      <Button
                        type="button"
                        variant={set.isDone ? "default" : "outline"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() =>
                          toggleSetDone(
                            exercise.id,
                            setIdx,
                            exercise.rest_between_sets
                          )
                        }
                      >
                        {set.isDone ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{setIdx + 1}</span>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSet(exercise.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add set
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
