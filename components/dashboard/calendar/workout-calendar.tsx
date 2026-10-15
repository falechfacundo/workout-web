"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Dumbbell } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getScheduledSessionsByDateRange } from "@/lib/actions/training-sessions";
import { getWorkoutLogsByDateRange } from "@/lib/actions/workout-logs";
import { RowListSkeleton } from "@/components/ui/data-skeletons";
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
  const t = useTranslations("workoutCalendar");
  const dateLocale = useLocale() === "es" ? es : enUS;

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      setIsLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
        const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

        const [sessionsResult, logsResult] = await Promise.all([
          getScheduledSessionsByDateRange(user.id, startDate, endDate),
          getWorkoutLogsByDateRange(user.id, startDate, endDate),
        ]);

        setScheduledSessions(sessionsResult.data as any[]);
        setWorkoutLogs(logsResult.data as any[]);
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
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 p-4 sm:p-6">
          <CardTitle>{t("title")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={t("previousMonth")}
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[7.5rem] text-center text-sm font-medium">
              {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("nextMonth")}
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <Calendar
            mode="single"
            locale={dateLocale}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            hideNavigation
            selected={selectedDay?.date}
            onDayClick={handleDayClick}
            className="w-full rounded-md border p-2 sm:p-3"
            classNames={{
              month_caption: "hidden",
              weekday: "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground",
              day: "relative aspect-square flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20",
            }}
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
              <span>{t("scheduled")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/40" />
              <span>{t("completed")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDay ? format(selectedDay.date, "PPP", { locale: dateLocale }) : t("selectDay")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <RowListSkeleton rows={2} />
          ) : selectedDay ? (
            <div className="space-y-4">
              {selectedDay.scheduledSessions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("scheduledSessions")}
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
                            {session.mesocycle?.name || t("noMesocycle")}
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
                    {t("completedWorkouts")}
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
                            {log.session?.name || t("workoutFallback")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("exercisesCount", { count: log.exercise_logs?.length || 0 })}
                          </p>
                        </div>
                        <Badge variant="default">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          {t("completed")}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay.scheduledSessions.length === 0 && selectedDay.workoutLogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noEvents")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("tapDay")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
