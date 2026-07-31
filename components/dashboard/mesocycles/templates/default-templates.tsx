import React from "react";
import { TemplateCard } from "./template-card";
import { MesocycleTemplateWithRelations } from "@/lib/schemas/mesocycle-template";

interface DefaultTemplatesProps {
  defaultTemplates: MesocycleTemplateWithRelations[];
}

export function DefaultTemplates({ defaultTemplates }: DefaultTemplatesProps) {
  if (defaultTemplates.length === 0) {
    return null; // No mostrar nada si no hay plantillas por defecto
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Plantillas Predeterminadas</h2>
      <p className="text-muted-foreground">
        Estas plantillas están diseñadas por profesionales y pueden ser usadas
        como punto de partida para tus entrenamientos.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {defaultTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isUserTemplate={false}
          />
        ))}
      </div>
    </div>
  );
}
