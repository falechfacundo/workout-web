"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MesocycleTemplateForm } from "@/components/forms/mesocycle-template/mesocycle-template-form";

/**
 * BL-2: nueva plantilla de mesociclo.
 * Antes el link "Nueva Plantilla" llevaba a un 404; ahora usa el form existente.
 */
export default function NewMesocycleTemplatePage() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Plantilla</h1>
          <p className="text-muted-foreground">
            Definí la duración, objetivos y enfoque muscular de tu mesociclo.
          </p>
        </div>
        <MesocycleTemplateForm />
      </div>
    </DashboardLayout>
  );
}
