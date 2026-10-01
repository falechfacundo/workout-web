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
import { useTranslations } from "next-intl";
import { useMuscleGroupsStore } from "@/lib/stores/muscle-groups-store";
import { createLogger } from "@/lib/utils/logger";
import { Skeleton } from "@/components/ui/skeleton";

const logger = createLogger("exercise-muscle-groups");

export function MuscleGroupsSection() {
  const form = useFormContext();
  const t = useTranslations("exercises");
  const { muscleGroups, isLoading, fetchMuscleGroups } =
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
            <FormLabel>{t("primaryMuscleGroup")}</FormLabel>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("primaryMuscleGroupPlaceholder")} />
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
              {t("primaryMuscleGroupDescription")}
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
            <FormLabel>{t("secondaryMuscleGroups")}</FormLabel>
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
                        ? t("secondaryMuscleGroupsSelected", {
                            count: field.value.length,
                          })
                        : t("secondaryMuscleGroupsPlaceholder")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t("searchMuscleGroups")} />
                    <CommandList>
                      <CommandEmpty>{t("noMuscleGroupFound")}</CommandEmpty>
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
                                  ? current.filter((id: string) => id !== group.id)
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
              {t("secondaryMuscleGroupsDescription")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
