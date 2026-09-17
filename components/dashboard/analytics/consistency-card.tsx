"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkoutHeatmap, getWorkoutStreak } from "@/lib/actions/analytics";

interface HeatmapEntry {
  date: string;
  count: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkout: string | null;
}

const WEEKS = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

function intensityClass(count: number | undefined) {
  if (!count) return "bg-muted";
  if (count === 1) return "bg-primary/40";
  if (count === 2) return "bg-primary/70";
  return "bg-primary";
}

export function ConsistencyCard({ userId }: { userId: string }) {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [heatResult, streakResult] = await Promise.all([
          getWorkoutHeatmap(userId, WEEKS),
          getWorkoutStreak(userId),
        ]);
        setHeatmap((heatResult.data as HeatmapEntry[]) || []);
        setStreak((streakResult.data as unknown as StreakData) || null);
      } catch (err) {
        console.error("Error loading consistency data:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [userId]);

  const counts = new Map(heatmap.map((e) => [e.date, e.count]));

  const days: { date: string; count: number | undefined }[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(today.getTime() - (WEEKS * 7 - 1) * DAY_MS);
  for (let d = new Date(start); d <= today; d = new Date(d.getTime() + DAY_MS)) {
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: counts.get(key) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Consistency
        </CardTitle>
        <CardDescription>
          Workouts over the last {WEEKS} weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-2xl font-bold">
                  {streak?.currentStreak ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current streak (days)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {streak?.longestStreak ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Longest streak (days)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">{heatmap.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active days (period)
                </p>
              </div>
            </div>

            <div
              className="grid gap-1"
              style={{
                gridTemplateRows: "repeat(7, 0.75rem)",
                gridAutoFlow: "column",
                gridAutoColumns: "0.75rem",
              }}
            >
              {days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count ?? 0} workouts`}
                  className={`h-3 w-3 rounded-sm ${intensityClass(day.count)}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
