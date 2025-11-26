import { ExerciseCard } from "./exercise-card";
import { ExerciseSkeleton } from "./exercise-skeleton";
import { EmptyExerciseState } from "./empty-exercise-state";
import { type ExerciseWithRelations } from "@/lib/schemas/exercise";

interface ExerciseListProps {
  exercises: ExerciseWithRelations[];
  isLoading: boolean;
  searchQuery: string;
  selectedMuscleGroupId: string;
}

export function ExerciseList({
  exercises,
  isLoading,
  searchQuery,
  selectedMuscleGroupId,
}: ExerciseListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ExerciseSkeleton />
        <ExerciseSkeleton />
        <ExerciseSkeleton />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <EmptyExerciseState
        showFiltersMessage={Boolean(searchQuery || selectedMuscleGroupId)}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
}
