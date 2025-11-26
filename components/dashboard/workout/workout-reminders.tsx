"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const reminderSchema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
  days: z.array(z.string()).min(1, "Please select at least one day"),
  notificationType: z.enum(["browser", "email", "both"]),
})

type ReminderFormValues = z.infer<typeof reminderSchema>

interface WorkoutRemindersProps {
  userId: string
}

export function WorkoutReminders({ userId }: WorkoutRemindersProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      enabled: false,
      time: "18:00",
      days: ["1", "3", "5"], // Monday, Wednesday, Friday
      notificationType: "browser",
    },
  })

  async function onSubmit(values: ReminderFormValues) {
    setIsSubmitting(true)

    try {
      // In a real app, you would save these settings to the database
      console.log("Reminder settings:", values)

      // Request notification permission if browser notifications are enabled
      if (values.enabled && (values.notificationType === "browser" || values.notificationType === "both")) {
        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission()
          if (permission !== "granted") {
            toast({
              variant: "destructive",
              title: "Notification permission denied",
              description: "Please enable notifications in your browser settings to receive workout reminders.",
            })
          }
        }
      }

      toast({
        title: "Reminders updated",
        description: values.enabled
          ? "Your workout reminders have been set up successfully."
          : "Workout reminders have been disabled.",
      })
    } catch (error) {
      console.error("Error setting reminders:", error)
      toast({
        variant: "destructive",
        title: "Failed to update reminders",
        description: "There was an error updating your reminder settings.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          Workout Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Workout Reminders</DialogTitle>
          <DialogDescription>Set up reminders for your scheduled workouts.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Reminders</FormLabel>
                    <FormDescription>Receive notifications for your scheduled workouts</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("enabled") && (
              <>
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>The time of day to send reminders</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Days</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: "0", label: "Sun" },
                          { value: "1", label: "Mon" },
                          { value: "2", label: "Tue" },
                          { value: "3", label: "Wed" },
                          { value: "4", label: "Thu" },
                          { value: "5", label: "Fri" },
                          { value: "6", label: "Sat" },
                        ].map((day) => (
                          <Button
                            key={day.value}
                            type="button"
                            variant={field.value.includes(day.value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const updatedDays = field.value.includes(day.value)
                                ? field.value.filter((d) => d !== day.value)
                                : [...field.value, day.value]
                              field.onChange(updatedDays)
                            }}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                      <FormDescription>Select the days of the week to receive reminders</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notificationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select notification type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="browser">Browser Notifications</SelectItem>
                          <SelectItem value="email">Email Notifications</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>How you want to receive your reminders</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
