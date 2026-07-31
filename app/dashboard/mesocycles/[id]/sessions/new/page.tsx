import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TrainingSessionForm } from "@/components/forms/training-session/training-session-form";
import { getMesocycle } from "@/lib/actions/mesocycles";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

interface NewTrainingSessionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewTrainingSessionPage({
  params,
}: NewTrainingSessionPageProps) {
  const { id } = await params;

  let mesocycle: Awaited<ReturnType<typeof getMesocycle>>;
  try {
    mesocycle = await getMesocycle(id);
  } catch {
    return notFound();
  }

  if (!mesocycle.data) {
    return notFound();
  }

  const mesocycleData = mesocycle.data;

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/mesocycles/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Add Training Session
            </h1>
            <p className="text-muted-foreground">
              Create a new training session for {mesocycleData.name}.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <TrainingSessionForm mesocycleId={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
