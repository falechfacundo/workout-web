import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ExerciseSkeleton } from "@/components/dashboard/exercises/exercise-skeleton";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
            <p className="text-muted-foreground">
              Manage your exercise library for your training programs.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <ExerciseSkeleton />
          <ExerciseSkeleton />
          <ExerciseSkeleton />
        </div>
      </div>
    </DashboardLayout>
  );
}