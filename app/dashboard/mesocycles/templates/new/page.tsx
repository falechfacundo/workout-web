"use client";

"use client";

import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MesocycleTemplateForm } from "@/components/forms/mesocycle-template/mesocycle-template-form";

/**
 * BL-2: nueva plantilla de mesociclo.
 * Antes el link "Nueva Plantilla" llevaba a un 404; ahora usa el form existente.
 */
export default function NewMesocycleTemplatePage() {
  const t = useTranslations("mesocycleTemplateForm");

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("newPageTitle")}</h1>
          <p className="text-muted-foreground">{t("newPageDesc")}</p>
        </div>
        <MesocycleTemplateForm />
      </div>
    </DashboardLayout>
  );
}
