"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { saveLiveWorkout } from "@/lib/actions/workout-logs";

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

export interface LastPerformance {
  exercise_id: string;
  exercise_name: string;
  date: string;
  weight: number | null;
  reps: number;
  rir: number | null;
}

function initialSets(ex: PlayerExercise, last?: LastPerformance): PerformedSet[] {
  return Array.from({ length: Math.max(1, ex.sets) }, () => ({
    weight: last?.weight != null ? String(last.weight) : "",
    reps: last?.reps != null ? String(last.reps) : "",
    rir: last?.rir != null ? String(last.rir) : "",
    isDone: false,
  }));
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

interface WorkoutDraft {
  startedAt: string;
  setsByExercise: Record<string, PerformedSet[]>;
}

function draftKey(sessionId: string) {
  return `gymtrack:live-workout:${sessionId}`;
}

function readDraft(sessionId: string): WorkoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(draftKey(sessionId));
    return raw ? (JSON.parse(raw) as WorkoutDraft) : null;
  } catch {
    return null;
  }
}

function clearDraft(sessionId: string) {
  try {
    window.sessionStorage.removeItem(draftKey(sessionId));
  } catch {
    return;
  }
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
  sessionId: string;
  mesocycleId: string;
  sessionName: string;
  sessionHref: string;
  exercises: PlayerExercise[];
  lastPerformance?: Record<string, LastPerformance>;
  onSaved?: (result: WorkoutResult) => void;
}

export function LiveWorkout({
  sessionId,
  mesocycleId,
  sessionName,
  sessionHref,
  exercises,
  lastPerformance,
  onSaved,
}: LiveWorkoutProps) {
  const router = useRouter();
  const t = useTranslations("liveWorkout");
  const [initialDraft] = useState(() => readDraft(sessionId));
  const [startedAt] = useState(() =>
    initialDraft ? new Date(initialDraft.startedAt) : new Date()
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const prevRest = useRef<number | null>(null);

  const restSeconds =
    restEndsAt === null
      ? null
      : Math.max(0, Math.ceil((restEndsAt - now) / 1000));

  const [setsByExercise, setSetsByExercise] = useState<
    Record<string, PerformedSet[]>
  >(() =>
    Object.fromEntries(
      exercises.map((ex) => [
        ex.id,
        initialDraft?.setsByExercise[ex.id] ??
          initialSets(ex, lastPerformance?.[ex.exercise_id]),
      ])
    )
  );

  const isDirty = Object.values(setsByExercise).some((sets) =>
    sets.some(
      (s) => s.isDone || s.weight.trim() !== "" || s.reps.trim() !== ""
    )
  );

  useEffect(() => {
    if (restEndsAt === null) return;
    const tick = () => setNow(Date.now());
    const t = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [restEndsAt]);

  useEffect(() => {
    if (saved) return;
    try {
      const draft: WorkoutDraft = {
        startedAt: startedAt.toISOString(),
        setsByExercise,
      };
      window.sessionStorage.setItem(draftKey(sessionId), JSON.stringify(draft));
    } catch {
      return;
    }
  }, [saved, sessionId, setsByExercise, startedAt]);

  useEffect(() => {
    if (!isDirty || saving || saved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, saving, saved]);

  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel = lock;
      } catch {
        return;
      }
    };
    void request();
    document.addEventListener("visibilitychange", request);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      void sentinel?.release();
    };
  }, []);

  function startRest(seconds: number) {
    const start = Date.now();
    setNow(start);
    setRestEndsAt(start + seconds * 1000);
  }

  function handleBack() {
    if (isDirty && !saved) {
      setConfirmLeaveOpen(true);
      return;
    }
    router.push(sessionHref);
  }

  function leaveWithoutSaving() {
    clearDraft(sessionId);
    setSaved(true);
    router.push(sessionHref);
  }

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
      startRest(restBetween);
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
      const sets = exercises.flatMap((exercise) =>
        (setsByExercise[exercise.id] ?? []).flatMap((set, idx) => {
          if (set.reps.trim() === "" && set.weight.trim() === "") return [];
          const reps = Number.parseInt(set.reps, 10);
          if (Number.isNaN(reps)) return [];
          const weight = Number.parseFloat(set.weight);
          const rir = Number.parseInt(set.rir, 10);
          return [
            {
              exercise_id: exercise.exercise_id,
              set_number: idx + 1,
              reps,
              weight: Number.isNaN(weight) ? null : weight,
              rir: Number.isNaN(rir) ? null : rir,
            },
          ];
        })
      );

      const { data: log, error } = await saveLiveWorkout({
        training_session_id: sessionId,
        mesocycle_id: mesocycleId,
        date: format(end, "yyyy-MM-dd"),
        start_time: startedAt.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: Math.max(
          1,
          Math.round((end.getTime() - startedAt.getTime()) / 60000)
        ),
        sets,
      });

      if (error || !log) {
        toast.error(error || t("saveError"));
        return;
      }

      setSaved(true);
      clearDraft(sessionId);
      toast.success(t("saved"));
      onSaved?.({ logId: log.id });
    } catch (err) {
      console.error("Error saving live workout:", err);
      toast.error(t("saveUnexpected"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="shrink-0" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">{t("back")}</span>
          </Button>
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-bold tracking-tight">{sessionName}</h1>
            <p className="text-muted-foreground">
              {t("setsCompleted", { done: totals.done, planned: totals.planned })}
            </p>
          </div>
        </div>
        <Button onClick={() => setConfirmFinishOpen(true)} disabled={saving}>
          <Square className="mr-2 h-4 w-4" />
          {saving ? t("saving") : t("finish")}
        </Button>
      </div>

      {restSeconds !== null && (
        <Card className="sticky top-16 z-20 border-primary/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {formatSeconds(restSeconds)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("restInProgress")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = Date.now();
                  setNow(current);
                  setRestEndsAt((e) => Math.max(e ?? current, current) + 30_000);
                }}
              >
                <Plus className="mr-1 h-3 w-3" />
                30s
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRestEndsAt(null)}>
                {t("skip")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {t("noExercises")}
          </CardContent>
        </Card>
      ) : (
        exercises.map((exercise, exIdx) => {
          const sets = setsByExercise[exercise.id] ?? [];
          return (
            <Card key={exercise.id}>
              <CardHeader className="px-4 pb-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {exIdx + 1}
                  </span>
                  <div>
                    <CardTitle>{exercise.exercise?.name ?? t("exerciseFallback")}</CardTitle>
                    <CardDescription>
                      {exercise.sets} × {exercise.reps}
                      {exercise.rir != null ? ` @ RIR ${exercise.rir}` : ""}
                      {exercise.rest_between_sets
                        ? ` — ${t("restInfo", { seconds: exercise.rest_between_sets })}`
                        : ""}
                    </CardDescription>
                    {lastPerformance?.[exercise.exercise_id] && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("lastTime", {
                          date: new Date(
                            lastPerformance[exercise.exercise_id].date
                          ).toLocaleDateString(),
                          weight: lastPerformance[exercise.exercise_id].weight ?? "—",
                          reps: lastPerformance[exercise.exercise_id].reps,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-2">
                  <div className="grid grid-cols-[2rem_1fr_1fr_3rem_2.75rem] items-center gap-2 text-xs text-muted-foreground">
                    <span>{t("colSet")}</span>
                    <span>{t("colWeight")}</span>
                    <span>{t("colReps")}</span>
                    <span>{t("colRir")}</span>
                    <span />
                  </div>
                  {sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={cn(
                        "grid grid-cols-[2rem_1fr_1fr_3rem_2.75rem] items-center gap-2",
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
                        aria-label={t("weightLabel", { n: setIdx + 1 })}
                        className="h-11 px-2"
                      />
                      <Input
                        inputMode="numeric"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, { reps: e.target.value })
                        }
                        placeholder={String(exercise.reps)}
                        aria-label={t("repsLabel", { n: setIdx + 1 })}
                        className="h-11 px-2"
                      />
                      <Input
                        inputMode="numeric"
                        value={set.rir}
                        onChange={(e) =>
                          updateSet(exercise.id, setIdx, { rir: e.target.value })
                        }
                        placeholder={exercise.rir != null ? String(exercise.rir) : ""}
                        aria-label={t("rirLabel", { n: setIdx + 1 })}
                        className="h-11 px-2"
                      />
                      <Button
                        type="button"
                        variant={set.isDone ? "default" : "outline"}
                        size="icon"
                        className="h-11 w-11"
                        aria-pressed={set.isDone}
                        aria-label={t("doneLabel", { n: setIdx + 1 })}
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
                    {t("addSet")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <AlertDialog open={confirmFinishOpen} onOpenChange={setConfirmFinishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("finishTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("finishDescription", { done: totals.done, planned: totals.planned })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keepTraining")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish}>
              {t("saveAndFinish")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("leaveTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("leaveDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keepTraining")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={leaveWithoutSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("leaveConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
