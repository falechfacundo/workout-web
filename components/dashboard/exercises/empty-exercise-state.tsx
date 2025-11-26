import { Button } from "@/components/ui/button";
import { Dumbbell, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyExerciseStateProps {
  showFiltersMessage: boolean;
}

export function EmptyExerciseState({ showFiltersMessage }: EmptyExerciseStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Dumbbell className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No exercises found</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {showFiltersMessage
          ? "Try adjusting your filters or search term"
          : "Start by adding some exercises to your library"}
      </p>
      <Button asChild>
        <Link href="/dashboard/exercises/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Link>
      </Button>
    </div>
  );
}