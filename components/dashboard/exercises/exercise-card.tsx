import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ExerciseWithRelations } from "@/lib/schemas/exercise";
import { Dumbbell } from "lucide-react";
import Link from "next/link";

interface ExerciseCardProps {
  exercise: ExerciseWithRelations;
}

// Function to convert incidence level (1-10) to percentage (10-100%)
const incidenceToPercentage = (level?: number) => {
  if (!level) return "N/A";
  return `${level * 10}%`;
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Dumbbell className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle>{exercise.name}</CardTitle>
          <CardDescription>
            {exercise.description || "No description"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {exercise.primary_muscle && (
            <Badge variant="outline">
              {exercise.primary_muscle.name} (
              {incidenceToPercentage(exercise.primary_muscle.incidence_level)})
            </Badge>
          )}
          {exercise.secondary_muscle_groups?.map((muscleGroup) => (
            <Badge key={muscleGroup.id} variant="outline">
              {muscleGroup.name} (
              {incidenceToPercentage(muscleGroup.incidence_level)})
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {!exercise.is_default && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/exercises/edit/${exercise.id}`}>
                Edit
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
