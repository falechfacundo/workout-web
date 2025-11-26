import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TrainingSessionForm } from "@/components/forms/training-session-form";
import { getMesocycle } from "@/lib/actions/mesocycles";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { differenceInWeeks } from "date-fns";

interface NewTrainingSessionPageProps {
  params: {
    id: string;
  };
}

export default async function NewTrainingSessionPage({
  params,
}: NewTrainingSessionPageProps) {
  try {
    const mesocycle = await getMesocycle(params.id);

    // Calculate total weeks in the mesocycle
    const startDate = new Date(mesocycle.start_date);
    const endDate = new Date(mesocycle.end_date);
    const totalWeeks = Math.max(
      1,
      Math.ceil(differenceInWeeks(endDate, startDate)) + 1
    );

    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/mesocycles/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Add Training Session
              </h1>
              <p className="text-muted-foreground">
                Create a new training session for {mesocycle.name}.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">
            <TrainingSessionForm
              mesocycleId={params.id}
              totalWeeks={totalWeeks}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    return notFound();
  }
}
