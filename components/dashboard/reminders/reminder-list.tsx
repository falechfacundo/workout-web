"use client";

import { useState, useEffect } from "react";
import { Clock, Bell, BellOff, Trash2, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWorkoutRemindersStore } from "@/lib/stores/workout-reminders-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ReminderForm } from "./reminder-form";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ReminderList() {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { user } = useRequireAuth();
  const {
    reminders,
    isLoading,
    fetchReminders,
    removeReminder,
    toggleReminder,
  } = useWorkoutRemindersStore();

  useEffect(() => {
    if (user) {
      fetchReminders(user.id);
    }
  }, [user, fetchReminders]);

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    await toggleReminder(id, !currentEnabled);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await removeReminder(deleteId);
      setDeleteId(null);
    }
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingReminder(null);
  };

  if (showForm) {
    return (
      <ReminderForm
        reminder={editingReminder}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Workout Reminders
        </CardTitle>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BellOff className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No reminders set. Add one to get notified about your workouts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={reminder.is_enabled}
                    onCheckedChange={() =>
                      handleToggle(reminder.id, reminder.is_enabled)
                    }
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      {reminder.day_of_week != null && (
                        <Badge variant="secondary">
                          {dayNames[reminder.day_of_week]}
                        </Badge>
                      )}
                      {reminder.time_of_day && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {reminder.time_of_day}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline">
                        {reminder.notification_type}
                      </Badge>
                      {(reminder as any).training_session?.name && (
                        <span className="text-xs text-muted-foreground">
                          {(reminder as any).training_session.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(reminder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this reminder? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
