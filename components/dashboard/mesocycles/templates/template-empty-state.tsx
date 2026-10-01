import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function TemplateEmptyState() {
  const t = useTranslations("mesocycleTemplates");

  return (
    <div className="text-center p-12 border rounded-lg">
      <h3 className="text-lg font-medium mb-2">{t("emptyTitle")}</h3>
      <p className="text-muted-foreground mb-4">{t("emptyDesc")}</p>
      <Button asChild>
        <Link href="/dashboard/mesocycles/templates/new">
          <Plus className="mr-2 h-4 w-4" />
          {t("createTemplate")}
        </Link>
      </Button>
    </div>
  );
}
