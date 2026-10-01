import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface TemplatePageHeaderProps {
  title?: string;
}

export function TemplatePageHeader({ title }: TemplatePageHeaderProps) {
  const t = useTranslations("mesocycleTemplates");

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title ?? t("pageTitle")}</h1>
      <Button asChild>
        <Link href="/dashboard/mesocycles/templates/new">
          <Plus className="mr-2 h-4 w-4" />
          {t("newTemplate")}
        </Link>
      </Button>
    </div>
  );
}
