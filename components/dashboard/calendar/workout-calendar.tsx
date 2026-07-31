"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Dumbbell } from "lucide-react";
import { createClient } from "@/lib/utils/supabase/client";
import { useRequireAuth } from "@/hooks/use-require-auth";
import Link from "next/link";

interface ScheduledSession {
  id: string;
  name: string;
  scheduled_date: string;
  status: string;
  mesocycle?: {
    name: string;
  };
}

interface WorkoutLog {
  id: string;
  date: string;
  training_session_id?: string;
  session?: {
    name: string;
  };
  exercise_logs?: any[];
}

interface DayInfo {
  date: Date;
  scheduledSessions: ScheduledSession[];
  workoutLogs: WorkoutLog[];
}

export function WorkoutCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useRequireAuth();

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      setIsLoading(true);
      try {
        const supabase = createClient();
        const startDate = startOfMonth(currentMonth);
        const endDate = endOfMonth(currentMonth);

        const [sessionsResult, logsResult] = await Promise.all([
          supabase
            .from("training_sessions")
            .select("id, name, scheduled_date, status, mesocycle:mesocycles(name)")
            .gte("scheduled_date", format(startDate, "yyyy-MM-dd"))
            .lte("scheduled_date", format(endDate, "yyyy-MM-dd"))
            .order("scheduled_date") as any,
          supabase
            .from("workout_logs")
            .select("id, date, training_session_id, session:training_sessions(name), exercise_logs(id)")
            .gte("date", format(startDate, "yyyy-MM-dd"))
            .lte("date", format(endDate, "yyyy-MM-dd"))
            .order("date") as any,
        ]);

        // Filter sessions to only user's mesocycles
        const userSessions = (sessionsResult.data || []).filter(
          (s: any) => s.mesocycle?.user_id === user.id
        );

        setScheduledSessions(userSessions);
        setWorkoutLogs(logsResult.data || []);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user, currentMonth]);

  const getDayInfo = (date: Date): DayInfo => {
    const dayStr = format(date, "yyyy-MM-dd");
    return {
      date,
      scheduledSessions: scheduledSessions.filter(s => s.scheduled_date === dayStr),
      workoutLogs: workoutLogs.filter(w => w.date === dayStr),
    };
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(getDayInfo(date));
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_350px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Workout Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDay?.date}
            onDayClick={handleDayClick}
            className="rounded-md border"
            modifiers={{
              hasScheduled: (date) =>
                scheduledSessions.some(s => s.scheduled_date === format(date, "yyyy-MM-dd")),
              hasCompleted: (date) =>
                workoutLogs.some(w => w.date === format(date, "yyyy-MM-dd")),
            }}
            modifiersStyles={{
              hasScheduled: {
                backgroundColor: "hsl(var(--primary) / 0.1)",
                fontWeight: "bold",
              },
              hasCompleted: {
                backgroundColor: "hsl(var(--primary) / 0.2)",
                fontWeight: "bold",
              },
            }}
          />
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/20" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/40" />
              <span>Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDay ? format(selectedDay.date, "MMMM d, yyyy") : "Select a Day"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : selectedDay ? (
            <div className="space-y-4">
              {selectedDay.scheduledSessions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Scheduled Sessions
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.scheduledSessions.map(session => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{session.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.mesocycle?.name || "No mesocycle"}
                          </p>
                        </div>
                        <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.workoutLogs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed Workouts
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.workoutLogs.map(log => (
                      <Link
                        key={log.id}
                        href={`/dashboard/workout-logs/${log.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {log.session?.name || "Workout"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.exercise_logs?.length || 0} exercises
                          </p>
                        </div>
                        <Badge variant="default">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.scheduledSessions.length === 0 && selectedDay.workoutLogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events for this day
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Click on a day to see details
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
