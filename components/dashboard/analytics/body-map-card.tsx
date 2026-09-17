"use client";

import { useEffect, useMemo, useState } from "react";
import { PersonStanding } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getMuscleVolumeByRegion } from "@/lib/actions/analytics";
import { BodyMap, BodyMapLegend } from "@/components/dashboard/analytics/body-map";

interface RegionStat {
  muscle_group_id: string;
  name: string;
  sets: number;
  effective_sets: number;
  tonelaje: number;
}

type Metric = "sets" | "effective_sets" | "tonelaje";

interface BodyMapCardProps {
  userId: string;
  mesocycleId?: string;
}

export function BodyMapCard({ userId, mesocycleId }: BodyMapCardProps) {
  const [data, setData] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");
  const [metric, setMetric] = useState<Metric>("sets");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getMuscleVolumeByRegion(
          userId,
          mesocycleId ? { mesocycleId } : { period }
        );
        setData((result.data as RegionStat[]) || []);
      } catch (err) {
        console.error("Error loading muscle volume by region:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [userId, mesocycleId, period]);

  const { intensityByName, statByName } = useMemo(() => {
    const max = Math.max(...data.map((d) => d[metric]), 0);
    const intensity: Record<string, number> = {};
    const stats: Record<string, string> = {};
    for (const d of data) {
      const value = d[metric];
      intensity[d.name] = max > 0 ? value / max : 0;
      stats[d.name] =
        `${d.name}: ${d.sets.toFixed(1)} sets (${d.effective_sets.toFixed(1)} efectivos, ${Math.round(d.tonelaje).toLocaleString()} kg)`;
    }
    return { intensityByName: intensity, statByName: stats };
  }, [data, metric]);

  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PersonStanding className="h-5 w-5 text-primary" />
              Body Map
            </CardTitle>
            <CardDescription>
              {mesocycleId
                ? "Volumen entrenado en este mesociclo por región"
                : "Volumen de trabajo por región muscular"}
            </CardDescription>
          </div>
          <Tabs
            value={metric}
            onValueChange={(v) => setMetric(v as Metric)}
          >
            <TabsList>
              <TabsTrigger value="sets">Sets</TabsTrigger>
              <TabsTrigger value="effective_sets">Efectivos</TabsTrigger>
              <TabsTrigger value="tonelaje">Tonelaje</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {!mesocycleId && (
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as "week" | "month" | "all")}
          >
            <TabsList>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="all">Histórico</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center gap-6">
            <Skeleton className="h-[380px] w-40" />
            <Skeleton className="h-[380px] w-40" />
          </div>
        ) : !hasData ? (
          <div className="flex h-[380px] items-center justify-center text-muted-foreground">
            Sin entrenamientos registrados en este período.
          </div>
        ) : (
          <div className="space-y-4">
            <BodyMap
              intensityByName={intensityByName}
              formatStat={(name) => statByName[name] ?? name}
            />
            <BodyMapLegend />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
