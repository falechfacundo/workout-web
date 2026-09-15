"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MesocycleTemplateForm } from "@/components/forms/mesocycle-template/mesocycle-template-form";
import { useMesocycleTemplatesStore } from "@/lib/stores/mesocycle-templates-store";
import type { MesocycleTemplateWithRelations } from "@/lib/schemas/mesocycle-template";

/**
 * BL-2: edición de plantilla de mesociclo.
 * Antes el link "Editar" de cada card propio llevaba a un 404.
 */
export default function EditMesocycleTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;
  const { fetchTemplate, isLoading } = useMesocycleTemplatesStore();
  const [template, setTemplate] =
    useState<MesocycleTemplateWithRelations | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchTemplate(templateId);
      if (!data) {
        setNotFound(true);
        return;
      }
      setTemplate(data);
    }
    load();
  }, [templateId, fetchTemplate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Cargando…</p>
      </DashboardLayout>
    );
  }

  if (notFound || !template) {
    return (
      <DashboardLayout>
        <p className="text-destructive text-sm">No se encontró la plantilla.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar: {template.name}
          </h1>
          <p className="text-muted-foreground">
            Modificá los datos de tu plantilla de mesociclo.
          </p>
        </div>
        <MesocycleTemplateForm
          initialTemplate={template}
          initialGoals={template.goals || []}
          initialMuscleFocus={template.muscleFocus || []}
        />
      </div>
    </DashboardLayout>
  );
}
