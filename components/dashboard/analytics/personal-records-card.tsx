"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPersonalRecords } from "@/lib/actions/analytics";

interface PersonalRecord {
  exercise_id: string;
  exercise_name: string;
  best_weight: number;
  best_reps: number;
  estimated_1rm: number;
  achieved_at: Date | string;
}

export function PersonalRecordsCard({ userId }: { userId: string }) {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getPersonalRecords(userId, 8);
        setRecords((result.data as PersonalRecord[]) || []);
      } catch (err) {
        console.error("Error loading personal records:", err);
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
          <Trophy className="h-5 w-5 text-primary" />
          Personal Records
        </CardTitle>
        <CardDescription>
          Best set per exercise by estimated 1RM
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Log workouts with weight to see your records here.
          </p>
        ) : (
          <div className="space-y-1">
            {records.map((pr) => (
              <div
                key={pr.exercise_id}
                className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {pr.exercise_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pr.best_weight} kg × {pr.best_reps} reps —{" "}
                    {new Date(pr.achieved_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums text-primary">
                    {Math.round(pr.estimated_1rm)} kg
                  </div>
                  <p className="text-xs text-muted-foreground">est. 1RM</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
