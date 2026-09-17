"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, TrendingDown, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { compareMesocycleBlocks } from "@/lib/actions/analytics";

interface BlockStats {
  name: string;
  startDate: string;
  weeks: number;
  completedSessions: number;
  totalSets: number;
  effectiveSets: number;
  tonelaje: number;
}

interface ComparisonData {
  current: BlockStats;
  previous: BlockStats | null;
}

function Delta({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) return null;
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = value === 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        isNeutral
          ? "text-muted-foreground"
          : isPositive
            ? "text-primary"
            : "text-destructive"
      }`}
    >
      <Icon className="h-3 w-3" />
      {value > 0 ? "+" : ""}
      {value}%
    </span>
  );
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function StatBlock({
  label,
  current,
  previous,
  format,
  invertDelta = false,
}: {
  label: string;
  current: number;
  previous: number | null;
  format?: (v: number) => string;
  invertDelta?: boolean;
}) {
  const fmt = format ?? ((v: number) => v.toLocaleString());
  const delta =
    previous !== null ? pctChange(current, previous) : null;

  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-xl font-bold tabular-nums">{fmt(current)}</span>
        <Delta value={delta} invert={invertDelta} />
      </div>
      {previous !== null && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          Anterior: {fmt(previous)}
        </p>
      )}
    </div>
  );
}

export function BlockComparisonCard({ mesocycleId }: { mesocycleId: string }) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await compareMesocycleBlocks(mesocycleId);
        if (!result.error) {
          setData((result.data as unknown as ComparisonData) || null);
        }
      } catch (err) {
        console.error("Error loading block comparison:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [mesocycleId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          Comparativa de bloques
        </CardTitle>
        <CardDescription>
          {data?.previous
            ? `${data.current.name} vs ${data.previous.name}`
            : "Bloque actual (sin bloque previo para comparar)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">
            Datos de comparación no disponibles.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock
              label="Sesiones completadas"
              current={data.current.completedSessions}
              previous={data.previous?.completedSessions ?? null}
            />
            <StatBlock
              label="Sets totales"
              current={data.current.totalSets}
              previous={data.previous?.totalSets ?? null}
            />
            <StatBlock
              label="Sets efectivos (RIR ≤ 2)"
              current={data.current.effectiveSets}
              previous={data.previous?.effectiveSets ?? null}
            />
            <StatBlock
              label="Tonelaje (kg)"
              current={data.current.tonelaje}
              previous={data.previous?.tonelaje ?? null}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
