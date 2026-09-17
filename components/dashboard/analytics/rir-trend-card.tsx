"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { getRirWeeklyTrend } from "@/lib/actions/analytics";

interface WeekStat {
  weekStart: string;
  sets: number;
  effectiveSets: number;
  avgRir: number | null;
  tonelaje: number;
}

export function RirTrendCard({ userId }: { userId: string }) {
  const [data, setData] = useState<WeekStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getRirWeeklyTrend(userId, 10);
        setData((result.data as WeekStat[]) || []);
      } catch (err) {
        console.error("Error loading RIR trend:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Intensidad semanal
        </CardTitle>
        <CardDescription>
          Sets totales vs efectivos (RIR ≤ 2) y RIR promedio por semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Registrá sets con RIR para ver la tendencia de intensidad.
          </div>
        ) : (
          <ChartContainer
            config={{
              sets: {
                label: "Sets",
                color: "hsl(var(--chart-2))",
              },
              effectiveSets: {
                label: "Efectivos",
                color: "hsl(var(--primary))",
              },
              avgRir: {
                label: "RIR prom.",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="weekStart"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string) => value.slice(5)}
                />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 10]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltipContent indicator="dashed" />} />
                <Bar
                  yAxisId="left"
                  dataKey="sets"
                  fill="var(--color-sets)"
                  radius={4}
                  name="Sets"
                />
                <Bar
                  yAxisId="left"
                  dataKey="effectiveSets"
                  fill="var(--color-effectiveSets)"
                  radius={4}
                  name="Efectivos"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgRir"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="RIR promedio"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
