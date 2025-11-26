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
import { useMesocyclesStore } from "@/lib/stores/mesocycles-store";
import { Skeleton } from "@/components/ui/skeleton";

const logger = createLogger("workout-log-mesocycle-selector");

interface MesocycleSelectorProps {
  userId: string;
}

export function MesocycleSelector({ userId }: MesocycleSelectorProps) {
  const form = useFormContext();
  const { activeMesocycles, isLoading, fetchActiveMesocycles } =
    useMesocyclesStore();

  useEffect(() => {
    logger.debug("Initializing mesocycle selector", { userId });
    fetchActiveMesocycles(userId);
  }, [userId, fetchActiveMesocycles]);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <FormField
      control={form.control}
      name="mesocycle_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mesocycle</FormLabel>
          <Select
            onValueChange={(value) => {
              logger.debug("Mesocycle selected", { mesocycleId: value });
              field.onChange(value);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a mesocycle (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None (Free Workout)</SelectItem>
              {activeMesocycles.map((mesocycle) => (
                <SelectItem key={mesocycle.id} value={mesocycle.id}>
                  {mesocycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            The mesocycle this workout belongs to
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
