import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TemplateEmptyState() {
  return (
    <div className="text-center p-12 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">
        No tienes plantillas de mesociclo
      </h3>
      <p className="text-muted-foreground mb-4">
        Crea tu primera plantilla para empezar a planificar tus ciclos de
        entrenamiento.
      </p>
      <Button asChild>
        <Link href="/dashboard/mesocycles/templates/new">
          <Plus className="mr-2 h-4 w-4" />
          Crear Plantilla
        </Link>
      </Button>
    </div>
  );
}
