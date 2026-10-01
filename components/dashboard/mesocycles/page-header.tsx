import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function PageHeader() {
  const t = useTranslations("mesocycles");

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Button asChild>
        <Link href="/dashboard/mesocycles/new">
          <Plus className="mr-2 h-4 w-4" />
          {t("createMesocycle")}
        </Link>
      </Button>
    </div>
  );
}
