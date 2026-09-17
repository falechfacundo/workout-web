"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListCardSkeleton } from "@/components/ui/data-skeletons";
import { useTrainingSessionsStore } from "@/lib/stores/training-sessions-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getLastExercisePerformance } from "@/lib/actions/analytics";
import {
  LiveWorkout,
  type PlayerExercise,
  type LastPerformance,
} from "@/components/dashboard/workout/live-workout";

export default function LiveSessionPage() {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [lastPerformance, setLastPerformance] = useState<
    Record<string, LastPerformance>
  >({});
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
    async function load() {
      try {
        await Promise.all([
          fetchSession(sessionId),
          fetchSessionExercises(sessionId),
        ]);
      } catch (err) {
        console.error("Error loading session for live workout:", err);
      }
    }

    load();
    return () => reset();
  }, [sessionId, fetchSession, fetchSessionExercises, reset]);

  useEffect(() => {
    if (!user) return;
    getLastExercisePerformance(user.id)
      .then((result) => {
        const list = (result.data as LastPerformance[]) || [];
        setLastPerformance(
          Object.fromEntries(list.map((p) => [p.exercise_id, p]))
        );
      })
      .catch((err) =>
        console.error("Error loading last exercise performance:", err)
      );
  }, [user]);

  if (authLoading || (isLoading && !currentSession)) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <ListCardSkeleton />
          <ListCardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !currentSession || !user) {
    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex flex-col items-center justify-center p-12">
            <div className="text-center">
              <h2 className="text-xl font-medium text-destructive">
                Error loading the session
              </h2>
              <p className="mt-2 text-muted-foreground">
                {error || "The requested session could not be found"}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/mesocycles/${id}/sessions/${sessionId}`)
                }
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to session
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <LiveWorkout
        userId={user.id}
        sessionId={sessionId}
        mesocycleId={id}
        sessionName={currentSession.name}
        sessionHref={`/dashboard/mesocycles/${id}/sessions/${sessionId}`}
        exercises={sessionExercises as unknown as PlayerExercise[]}
        lastPerformance={lastPerformance}
        onSaved={(result) => router.push(`/dashboard/workout-logs/${result.logId}`)}
      />
    </DashboardLayout>
  );
}
