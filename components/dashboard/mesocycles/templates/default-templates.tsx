import React from "react";
import { useTranslations } from "next-intl";
import { TemplateCard } from "./template-card";
import { MesocycleTemplateWithRelations } from "@/lib/schemas/mesocycle-template";

interface DefaultTemplatesProps {
  defaultTemplates: MesocycleTemplateWithRelations[];
}

export function DefaultTemplates({ defaultTemplates }: DefaultTemplatesProps) {
  const t = useTranslations("mesocycleTemplates");

  if (defaultTemplates.length === 0) {
    return null; // No mostrar nada si no hay plantillas por defecto
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("defaultTemplatesTitle")}</h2>
      <p className="text-muted-foreground">{t("defaultTemplatesDesc")}</p>

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
