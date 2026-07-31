"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Plus, Target } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { differenceInWeeks } from "date-fns";
import { WeekContent } from "@/components/dashboard/mesocycles/week-content";
import { useMesocyclesStore } from "@/lib/stores/mesocycles-store";
import { useEffect } from "react";

export default function MesocycleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentMesocycle, fetchMesocycle, isLoading, error } =
    useMesocyclesStore();

  // Cargar los datos desde el store cuando el componente se monta
  useEffect(() => {
    fetchMesocycle(id);
  }, [id, fetchMesocycle]);

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Cargando mesociclo...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Mostrar error si ocurre
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <h3 className="font-semibold text-red-600">Error</h3>
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Si no hay datos, mostrar no encontrado
  if (!currentMesocycle) {
    // return notFound();
    return null;
  }

  // Calcular las semanas del mesociclo
  const startDate = new Date(currentMesocycle.start_date);
  const endDate = new Date(currentMesocycle.end_date);
  const totalWeeks = Math.max(
    1,
    Math.ceil(differenceInWeeks(endDate, startDate)) + 1
  );

  // Get current week (for default tab)
  const today = new Date();
  let currentWeek = 1;
  if (today >= startDate && today <= endDate) {
    currentWeek = Math.min(
      totalWeeks,
      Math.max(1, Math.ceil(differenceInWeeks(today, startDate)) + 1)
    );
  }

  // Calculate progress percentage
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.max(
    0,
    Math.min(
      totalDays,
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    )
  );
  const progressPercentage =
    totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/mesocycles">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentMesocycle.name}
              </h1>
              <p className="text-muted-foreground">
                {currentMesocycle.description || "No description specified"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/mesocycles/edit/${id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Mesocycle
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/mesocycles/${id}/sessions/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Session
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge>
                    {currentMesocycle.status.charAt(0).toUpperCase() +
                      currentMesocycle.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Week {currentWeek} of {totalWeeks}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>
                    Started:{" "}
                    {new Date(currentMesocycle.start_date).toLocaleDateString()}
                  </div>
                  <div>
                    Ends:{" "}
                    {new Date(currentMesocycle.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentMesocycle.goals && currentMesocycle.goals.length > 0 ? (
                  currentMesocycle.goals.map((goal, index) => (
                    <div
                      key={goal.id || index}
                      className="flex items-center gap-2"
                    >
                      <Target className="h-5 w-5 text-primary" />
                      <span className="font-medium">{goal.notes || goal.goal_type}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted" />
                    <span className="text-muted-foreground">
                      No goals specified
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Training Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-2xl font-bold">{totalWeeks} weeks</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-2xl font-bold capitalize">
                    {currentMesocycle.status}
                  </div>
                </div>
                {/* <div>
                  <div className="text-sm font-medium">RIR Range</div>
                  <div className="text-2xl font-bold">1-3</div>
                  <div className="text-xs text-muted-foreground">
                    reps in reserve
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Rest</div>
                  <div className="text-2xl font-bold">60-180s</div>
                  <div className="text-xs text-muted-foreground">
                    between sets
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue={`week${currentWeek}`}>
          <div className="flex items-center justify-between">
            <TabsList className="overflow-auto">
              {Array.from({ length: totalWeeks }, (_, i) => (
                <TabsTrigger key={i + 1} value={`week${i + 1}`}>
                  Week {i + 1}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {Array.from({ length: totalWeeks }, (_, weekIndex) => {
            const weekNumber = weekIndex + 1;
            return (
              <TabsContent
                key={weekNumber}
                value={`week${weekNumber}`}
                className="mt-4"
              >
                <WeekContent mesocycleId={id} weekNumber={weekNumber} />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
