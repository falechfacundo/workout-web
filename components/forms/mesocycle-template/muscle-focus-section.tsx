"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";
import { useMuscleGroupsStore } from "@/lib/stores/muscle-groups-store";
import { Skeleton } from "@/components/ui/skeleton";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("template-muscle-focus-section");

export function MuscleFocusSection() {
  const form = useFormContext();
  const { muscleGroups, isLoading, fetchMuscleGroups } = useMuscleGroupsStore();

  useEffect(() => {
    logger.debug("Initializing muscle focus section");
    fetchMuscleGroups();
  }, [fetchMuscleGroups]);

  const {
    fields: muscleFields,
    append: appendMuscle,
    remove: removeMuscle,
  } = useFieldArray({
    control: form.control,
    name: "muscleFocus",
  });

  // Helper to find if a muscle group is already added
  const isMuscleGroupAlreadyAdded = (muscleGroupId: string) => {
    return (
      form
        .getValues()
        .muscleFocus?.some(
          (focus) => focus.muscle_group_id === muscleGroupId
        ) || false
    );
  };

  // Helper to get muscle group name by id
  const getMuscleGroupName = (id: string) => {
    return muscleGroups.find((mg) => mg.id === id)?.name || id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enfoque Muscular</CardTitle>
        <CardDescription>
          Selecciona los grupos musculares en los que se enfocará este mesociclo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {muscleFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {getMuscleGroupName(field.muscle_group_id)}
                </Badge>

                <FormField
                  control={form.control}
                  name={`muscleFocus.${index}.focus_level`}
                  render={({ field: focusField }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormLabel className="text-xs">
                        Nivel de Enfoque:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          className="w-16 h-8"
                          {...focusField}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            logger.debug("Focus level changed", {
                              muscleGroup: getMuscleGroupName(
                                field.muscle_group_id
                              ),
                              focusLevel: value,
                            });
                            focusField.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        (1-10)
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  logger.debug("Muscle group removed", {
                    muscleGroup: getMuscleGroupName(field.muscle_group_id),
                  });
                  removeMuscle(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="mt-4">
              <Select
                onValueChange={(value) => {
                  if (!isMuscleGroupAlreadyAdded(value)) {
                    logger.debug("Muscle group added", {
                      muscleGroup: getMuscleGroupName(value),
                      focusLevel: 5,
                    });
                    appendMuscle({
                      muscle_group_id: value,
                      focus_level: 5,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Añadir grupo muscular" />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem
                      key={group.id}
                      value={group.id}
                      disabled={isMuscleGroupAlreadyAdded(group.id)}
                    >
                      {group.name}{" "}
                      {isMuscleGroupAlreadyAdded(group.id) && "(Añadido)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
