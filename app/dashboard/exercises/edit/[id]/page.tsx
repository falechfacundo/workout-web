import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ExerciseForm } from "@/components/forms/exercise/exercise-form";
import { getExercise } from "@/lib/actions/exercises";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditExercisePageProps {
  params: {
    id: string;
  };
}

export default async function EditExercisePage({
  params,
}: EditExercisePageProps) {
  try {
    const exercise = await getExercise(params.id);

    return (
      <DashboardLayout>
        <div className="grid gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/exercises">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit Exercise
              </h1>
              <p className="text-muted-foreground">
                Update an existing exercise.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">
            <ExerciseForm initialData={exercise} />
          </div>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    return notFound();
  }
}
