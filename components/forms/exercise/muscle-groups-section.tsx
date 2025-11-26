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
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { useMuscleGroupsStore } from "@/lib/stores/muscle-groups-store";
import { createLogger } from "@/lib/utils/logger";
import { Skeleton } from "@/components/ui/skeleton";

const logger = createLogger("exercise-muscle-groups");

export function MuscleGroupsSection() {
  const form = useFormContext();
  const { muscleGroups, isLoading, error, fetchMuscleGroups } =
    useMuscleGroupsStore();

  useEffect(() => {
    logger.debug("Initializing muscle groups section");
    fetchMuscleGroups();
  }, [fetchMuscleGroups]);

  return (
    <>
      <FormField
        control={form.control}
        name="primary_muscle_group_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Muscle Group</FormLabel>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a primary muscle group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormDescription>
              The main muscle group targeted by this exercise
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="secondary_muscle_groups"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secondary Muscle Groups</FormLabel>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value.length && "text-muted-foreground"
                      )}
                    >
                      {field.value.length
                        ? `${field.value.length} muscle group${
                            field.value.length > 1 ? "s" : ""
                          } selected`
                        : "Select secondary muscle groups"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search muscle groups..." />
                    <CommandList>
                      <CommandEmpty>No muscle group found.</CommandEmpty>
                      <CommandGroup>
                        {muscleGroups
                          .filter(
                            (group) =>
                              group.id !==
                              form.getValues("primary_muscle_group_id")
                          )
                          .map((group) => (
                            <CommandItem
                              value={group.name}
                              key={group.id}
                              onSelect={() => {
                                const current = field.value || [];
                                const updated = current.includes(group.id)
                                  ? current.filter((id) => id !== group.id)
                                  : [...current, group.id];
                                field.onChange(updated);
                                logger.debug(
                                  "Secondary muscle group selection changed",
                                  {
                                    group: group.name,
                                    isSelected: !current.includes(group.id),
                                    totalSelected: updated.length,
                                  }
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(group.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {group.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            <FormDescription>
              Other muscle groups that are also worked during this exercise
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
