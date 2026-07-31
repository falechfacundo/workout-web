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
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("goals-section");

const GOAL_TYPES = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "endurance", label: "Endurance" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "maintenance", label: "Maintenance" },
  { value: "custom", label: "Custom" },
];

export function GoalsSection() {
  const form = useFormContext();

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
          <h3 className="text-lg font-medium">Mesocycle Goals</h3>
          <p className="text-sm text-muted-foreground">
            Define specific goals for this mesocycle
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addGoal}>
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>

      {form.watch("goals")?.map((_: any, index: number) => (
        <div key={index} className="space-y-4 rounded-lg border p-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Goal {index + 1}</h4>
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
                <FormLabel>Goal Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GOAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Increase bench press by 10kg"
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
                <FormLabel>Target Value (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 100kg"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Numerical target if applicable
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
