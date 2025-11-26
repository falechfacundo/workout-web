"use client";

import { useState, useEffect } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { useExercisesStore } from "@/lib/stores/exercises-store";
import { createLogger } from "@/lib/utils/logger";
import { Skeleton } from "@/components/ui/skeleton";

const logger = createLogger("session-exercise-selector");

export function ExerciseSelector() {
  const form = useFormContext();
  const { exercises, isLoading, fetchExercises } = useExercisesStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    logger.debug("Initializing exercise selector");
    fetchExercises();
  }, [fetchExercises]);

  return (
    <FormField
      control={form.control}
      name="exercise_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Exercise</FormLabel>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? exercises.find(
                          (exercise) => exercise.id === field.value
                        )?.name
                      : "Select an exercise"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search exercises..." />
                  <CommandList>
                    <CommandEmpty>No exercise found.</CommandEmpty>
                    <CommandGroup>
                      {exercises.map((exercise) => (
                        <CommandItem
                          value={exercise.name}
                          key={exercise.id}
                          onSelect={() => {
                            logger.debug("Exercise selected", {
                              exerciseName: exercise.name,
                            });
                            form.setValue("exercise_id", exercise.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              exercise.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {exercise.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          <FormDescription>The exercise to add to this session</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
