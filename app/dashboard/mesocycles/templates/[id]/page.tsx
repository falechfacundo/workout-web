"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Dumbbell, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useMesocycleTemplatesStore } from "@/lib/stores/mesocycle-templates-store";
import { getGoalLabel } from "@/components/dashboard/mesocycles/templates/template-card";
import { StatCardSkeleton } from "@/components/ui/data-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import type { MesocycleTemplateWithRelations } from "@/lib/schemas/mesocycle-template";

/**
 * BL-2: detalle de plantilla de mesociclo.
 * Antes el link "Ver Detalles" de cada card llevaba a un 404.
 */
export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params.id as string;
  const { fetchTemplate, isLoading } = useMesocycleTemplatesStore();
  const [template, setTemplate] =
    useState<MesocycleTemplateWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTemplate(templateId);
        if (!data) {
          setError("No se encontró la plantilla.");
          return;
        }
        setTemplate(data);
      } catch {
        setError("Error al cargar la plantilla.");
      }
    }
    load();
  }, [templateId, fetchTemplate]);

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <Button variant="ghost" asChild className="w-fit px-2">
          <Link href="/dashboard/mesocycles/templates">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Plantillas
          </Link>
        </Button>

        {isLoading && (
          <div className="grid gap-4 md:gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-80 max-w-full" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        {template && (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {template.name}
                </h1>
                <p className="text-muted-foreground">
                  {template.description || "Sin descripción"}
                </p>
              </div>
              <Button asChild>
                <Link href={`/dashboard/mesocycles/templates/${template.id}/edit`}>
                  Editar
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" /> Duración
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {template.duration_weeks} semanas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Dumbbell className="h-4 w-4" /> Sesiones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {template.sessions?.length || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4" /> Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1">
                  {(template.goals || []).length > 0 ? (
                    (template.goals || []).map((goal) => (
                      <Badge key={goal.id} variant="outline" className="text-xs">
                        {getGoalLabel(goal.goal_type)}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Sin objetivos</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
