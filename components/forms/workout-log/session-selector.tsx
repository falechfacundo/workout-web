"use client";

import { useEffect } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";
import { useTrainingSessionsStore } from "@/lib/stores/training-sessions-store";
import { Skeleton } from "@/components/ui/skeleton";

const logger = createLogger("workout-log-session-selector");

interface SessionSelectorProps {
  mesocycleId: string | undefined;
}

export function SessionSelector({ mesocycleId }: SessionSelectorProps) {
  const form = useFormContext();
  const { sessions, isLoading, fetchMesocycleSessions } =
    useTrainingSessionsStore();

  useEffect(() => {
    if (mesocycleId && mesocycleId !== "none") {
      logger.debug("Fetching sessions for mesocycle", { mesocycleId });
      fetchMesocycleSessions(mesocycleId);
    }
  }, [mesocycleId, fetchMesocycleSessions]);

  if (!mesocycleId || mesocycleId === "none") {
    return null;
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <FormField
      control={form.control}
      name="session_template_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Training Session</FormLabel>
          <Select
            onValueChange={(value) => {
              logger.debug("Session selected", { sessionId: value });
              field.onChange(value);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a training session (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Custom Workout</SelectItem>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.name}{" "}
                  {session.week_number ? `(Week ${session.week_number})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            The training session template to follow
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
