import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SessionExerciseForm } from "@/components/forms/session-exercise/session-exercise-form";
import { getTrainingSession } from "@/lib/actions/training-sessions";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

interface NewSessionExercisePageProps {
  params: Promise<{
    id: string;
    sessionId: string;
  }>;
}

export default async function NewSessionExercisePage({
  params,
}: NewSessionExercisePageProps) {
  const { id, sessionId } = await params;

  let session: any;
  try {
    const result = await getTrainingSession(sessionId);
    session = (result as any).data;
  } catch {
    return notFound();
  }

  if (!session) {
    return notFound();
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/dashboard/mesocycles/${id}/sessions/${sessionId}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Add Exercise
            </h1>
            <p className="text-muted-foreground">
              Add an exercise to {session.name}.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <SessionExerciseForm
            sessionId={sessionId}
            mesocycleId={id}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
