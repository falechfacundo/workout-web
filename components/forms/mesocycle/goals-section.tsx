"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("goals-section");

const GOAL_TYPE_KEYS = [
  { value: "strength", key: "goalStrength" },
  { value: "hypertrophy", key: "goalHypertrophy" },
  { value: "endurance", key: "goalEndurance" },
  { value: "weight_loss", key: "goalWeightLoss" },
  { value: "maintenance", key: "goalMaintenance" },
  { value: "custom", key: "goalCustom" },
] as const;

export function GoalsSection() {
  const form = useFormContext();
  const t = useTranslations("mesocycleForm");

  const addGoal = () => {
    logger.debug("Adding new goal");
    const currentGoals = form.getValues("goals") || [];
    form.setValue("goals", [
      ...currentGoals,
      { type: "strength", description: "", target_value: "" },
    ]);
  };

  const removeGoal = (index: number) => {
    logger.debug("Removing goal", { index });
    const currentGoals = form.getValues("goals") || [];
    form.setValue(
      "goals",
      currentGoals.filter((_: any, i: number) => i !== index)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{t("goalsTitle")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("goalsDescription")}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addGoal}>
          <Plus className="mr-2 h-4 w-4" /> {t("addGoal")}
        </Button>
      </div>

      {form.watch("goals")?.map((_: any, index: number) => (
        <div key={index} className="space-y-4 rounded-lg border p-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{t("goalNumber", { number: index + 1 })}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeGoal(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={form.control}
            name={`goals.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("goalType")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectGoalType")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GOAL_TYPE_KEYS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(type.key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`goals.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("goalDescription")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("goalDescriptionPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`goals.${index}.target_value`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("targetValue")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("targetValuePlaceholder")}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  {t("targetValueDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
