"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useWorkoutRemindersStore } from "@/lib/stores/workout-reminders-store";
import { useRequireAuth } from "@/hooks/use-require-auth";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface ReminderFormProps {
  reminder?: any;
  onClose: () => void;
}

export function ReminderForm({ reminder, onClose }: ReminderFormProps) {
  const { user } = useRequireAuth();
  const { addReminder, updateReminder } = useWorkoutRemindersStore();

  const [dayOfWeek, setDayOfWeek] = useState<string>(
    reminder?.day_of_week?.toString() || ""
  );
  const [timeOfDay, setTimeOfDay] = useState(reminder?.time_of_day || "");
  const [isEnabled, setIsEnabled] = useState(reminder?.is_enabled ?? true);
  const [notificationType, setNotificationType] = useState(
    reminder?.notification_type || "browser"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const formData = {
        id: reminder?.id,
        user_id: user.id,
        day_of_week: dayOfWeek ? parseInt(dayOfWeek) : null,
        time_of_day: timeOfDay || null,
        is_enabled: isEnabled,
        notification_type: notificationType,
      };

      const result = reminder
        ? await updateReminder(formData)
        : await addReminder(formData);

      if (!result.error) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardTitle>
          {reminder ? "Edit Reminder" : "New Reminder"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger>
                <SelectValue placeholder="Select a day (optional)" />
              </SelectTrigger>
              <SelectContent>
                {dayNames.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_of_day">Time</Label>
            <Input
              id="time_of_day"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification_type">Notification Type</Label>
            <Select
              value={notificationType}
              onValueChange={setNotificationType}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="browser">Browser</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              id="is_enabled"
            />
            <Label htmlFor="is_enabled">Enabled</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : reminder
                ? "Update Reminder"
                : "Create Reminder"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
