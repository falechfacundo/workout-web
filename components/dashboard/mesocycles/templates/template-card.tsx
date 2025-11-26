import React from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MesocycleTemplateWithRelations } from "@/lib/schemas/mesocycle-template";

// Using the type from schema file instead of redefining it
interface TemplateCardProps {
  template: MesocycleTemplateWithRelations;
  isUserTemplate: boolean;
}

export function TemplateCard({
  template,
  isUserTemplate,
}: TemplateCardProps) {
  // Get the number of sessions and muscle groups
  const sessionCount = template.sessions?.length || 0;
  const muscleFocus = template.muscleFocus || [];
  const goals = template.goals || [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{template.name}</CardTitle>
          {template.is_public && <Badge variant="outline">Público</Badge>}
        </div>
        <CardDescription>
          {template.description || "Sin descripción"}
          {!isUserTemplate && template.creator && (
            <div className="mt-2 text-sm">
              Por: {template.creator.full_name || template.creator.username}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Duración</div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{template.duration_weeks} semanas</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Sesiones</div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>{sessionCount} sesiones de entrenamiento</span>
            </div>
          </div>

          {muscleFocus.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">Enfoque Muscular</div>
              <div className="flex flex-wrap gap-1">
                {muscleFocus.map((focus) => (
                  <Badge key={focus.id} variant="secondary" className="text-xs">
                    {focus.muscle_groups?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {goals.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">Objetivos</div>
              <div className="flex flex-wrap gap-1">
                {goals.map((goal) => (
                  <Badge key={goal.id} variant="outline" className="text-xs">
                    {getGoalLabel(goal.goal_type)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/mesocycles/templates/${template.id}`}>
              Ver Detalles <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {isUserTemplate && (
            <Button variant="default" asChild>
              <Link
                href={`/dashboard/mesocycles/templates/${template.id}/edit`}
              >
                Editar
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export function getGoalLabel(goalType: string): string {
  switch (goalType) {
    case "strength":
      return "Fuerza";
    case "hypertrophy":
      return "Hipertrofia";
    case "endurance":
      return "Resistencia";
    case "weight_loss":
      return "Pérdida de peso";
    case "flexibility":
      return "Flexibilidad";
    default:
      return goalType;
  }
}
