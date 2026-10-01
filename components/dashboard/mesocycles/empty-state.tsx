import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function EmptyState() {
  const t = useTranslations("mesocycles");

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">{t("empty")}</p>
        <Button asChild>
          <Link href="/dashboard/mesocycles/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("emptyCreateFirst")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
