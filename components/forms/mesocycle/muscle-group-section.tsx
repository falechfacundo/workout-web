"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useMuscleGroupsStore } from "@/lib/stores/muscle-groups-store";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { MuscleGroup } from "@/lib/schemas/muscle-group";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("muscle-group-section");

export function MuscleGroupSection() {
  const form = useFormContext();
  const { muscleGroups, isLoading, fetchMuscleGroups } = useMuscleGroupsStore();

  useEffect(() => {
    logger.debug("Initializing muscle group section");
    fetchMuscleGroups();
  }, [fetchMuscleGroups]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Muscle Group Focus</h3>
        <p className="text-sm text-muted-foreground">
          Select muscle groups to focus on during this mesocycle
        </p>
      </div>

      <FormField
        control={form.control}
        name="focus_muscle_groups"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {isLoading
                ? // Show skeletons while loading
                  Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="rounded-md border p-4 space-y-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))
                : muscleGroups.map((item: MuscleGroup) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="focus_muscle_groups"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, item.id])
                                    : field.onChange(
                                        currentValue.filter(
                                          (value: string) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
