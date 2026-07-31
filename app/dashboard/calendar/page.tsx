"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { WorkoutCalendar } from "@/components/dashboard/calendar/workout-calendar";
import { ReminderList } from "@/components/dashboard/reminders/reminder-list";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function CalendarPage() {
  const { isLoading: authLoading } = useRequireAuth();

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View your scheduled training sessions, completed workouts, and
              manage reminders.
            </p>
          </div>
        </div>
        <WorkoutCalendar />
        <ReminderList />
      </div>
    </DashboardLayout>
  );
}
