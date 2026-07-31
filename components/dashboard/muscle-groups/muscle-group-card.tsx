import { Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "@/lib/database.types";

type MuscleGroup = Database["public"]["Tables"]["muscle_groups"]["Row"];

export function MuscleGroupCard({ muscleGroup }: { muscleGroup: MuscleGroup }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle>{muscleGroup.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>Loading exercise count...</p>
        </div>
      </CardContent>
    </Card>
  );
}
