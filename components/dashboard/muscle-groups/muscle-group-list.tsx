import { Database } from "@/lib/database.types";
import { MuscleGroupCard } from "./muscle-group-card";
import { MuscleGroupSkeleton } from "./muscle-group-skeleton";

type MuscleGroup = Database["public"]["Tables"]["muscle_groups"]["Row"];

interface MuscleGroupListProps {
  muscleGroups: MuscleGroup[];
  isLoading: boolean;
}

export function MuscleGroupList({
  muscleGroups,
  isLoading,
}: MuscleGroupListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        <>
          <MuscleGroupSkeleton />
          <MuscleGroupSkeleton />
          <MuscleGroupSkeleton />
        </>
      ) : muscleGroups.length > 0 ? (
        muscleGroups.map((muscleGroup) => (
          <MuscleGroupCard key={muscleGroup.id} muscleGroup={muscleGroup} />
        ))
      ) : (
        <div className="col-span-full text-center text-muted-foreground">
          No muscle groups found
        </div>
      )}
    </div>
  );
}
