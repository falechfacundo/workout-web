import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

interface MesocycleCardProps {
  mesocycle: {
    id: string;
    name: string;
    description?: string | null;
    start_date: string;
    end_date: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  };
}

const STATUS_KEYS: Record<
  string,
  "statusPlanned" | "statusInProgress" | "statusCompleted" | "statusCancelled"
> = {
  planned: "statusPlanned",
  in_progress: "statusInProgress",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

export function MesocycleCard({ mesocycle }: MesocycleCardProps) {
  const t = useTranslations("mesocycles");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : es;
  const statusKey = STATUS_KEYS[mesocycle.status];
  const statusLabel = statusKey ? t(statusKey) : mesocycle.status;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{mesocycle.name}</CardTitle>
            <CardDescription>{mesocycle.description || t("noDescription")}</CardDescription>
          </div>
          <Badge
            variant={
              mesocycle.status === "in_progress" ? "default" : "outline"
            }
          >
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-sm font-medium">{t("startDate")}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(mesocycle.start_date), "MMM d, yyyy", {
                  locale: dateLocale,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{t("endDate")}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(mesocycle.end_date), "MMM d, yyyy", {
                  locale: dateLocale,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{t("status")}</div>
              <div className="text-sm text-muted-foreground">
                {statusLabel}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{t("description")}</div>
              <div className="text-sm text-muted-foreground">
                {mesocycle.description || t("noDescription")}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/mesocycles/edit/${mesocycle.id}`}>
                {t("editButton")}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/dashboard/mesocycles/${mesocycle.id}`}>
                {t("viewButton")}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
