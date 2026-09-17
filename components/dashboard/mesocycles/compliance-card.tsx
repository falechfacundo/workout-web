"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMesocycleCompliance } from "@/lib/actions/analytics";

interface ComplianceData {
  mesocycleId: string;
  name: string;
  totalSessions: number;
  completedSessions: number;
  dueSessions: number;
  overdueSessions: number;
  compliance: number | null;
}

export function ComplianceCard({ mesocycleId }: { mesocycleId: string }) {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getMesocycleCompliance(mesocycleId);
        if (!result.error) {
          setData((result.data as unknown as ComplianceData) || null);
        }
      } catch (err) {
        console.error("Error loading compliance:", err);
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
          <CalendarCheck className="h-5 w-5 text-primary" />
          Compliance
        </CardTitle>
        <CardDescription>
          Planned sessions completed vs scheduled so far
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">
            Compliance data unavailable.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-2xl font-bold">
                  {data.compliance !== null ? `${data.compliance}%` : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.compliance === null
                    ? "No sessions due yet"
                    : "Compliance rate"}
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {data.completedSessions}/{data.totalSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sessions completed
                </p>
              </div>
              {data.overdueSessions > 0 && (
                <Badge variant="destructive">
                  {data.overdueSessions} overdue
                </Badge>
              )}
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${data.compliance ?? 0}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
