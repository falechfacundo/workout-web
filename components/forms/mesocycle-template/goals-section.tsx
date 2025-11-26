"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("template-goals-section");

const GOAL_OPTIONS = [
  { value: "strength", label: "Fuerza" },
  { value: "hypertrophy", label: "Hipertrofia" },
  { value: "endurance", label: "Resistencia" },
  { value: "weight_loss", label: "Pérdida de peso" },
  { value: "flexibility", label: "Flexibilidad" },
];

export function GoalsSection() {
  const form = useFormContext();

  const {
    fields: goalFields,
    append: appendGoal,
    remove: removeGoal,
  } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  // Helper to find if a goal type is already added
  const isGoalAlreadyAdded = (goalType: string) => {
    return (
      form.getValues().goals?.some((goal) => goal.goal_type === goalType) ||
      false
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objetivos</CardTitle>
        <CardDescription>
          Define los objetivos principales de este mesociclo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goalFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {GOAL_OPTIONS.find((g) => g.value === field.goal_type)?.label}
                </Badge>

                <FormField
                  control={form.control}
                  name={`goals.${index}.priority`}
                  render={({ field: priorityField }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormLabel className="text-xs">Prioridad:</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          className="w-16 h-8"
                          {...priorityField}
                          value={priorityField.value || ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value)
                              : null;
                            logger.debug("Goal priority changed", {
                              goalType: field.goal_type,
                              priority: value,
                            });
                            priorityField.onChange(value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  logger.debug("Goal removed", {
                    goalType: field.goal_type,
                    index,
                  });
                  removeGoal(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 mt-4">
            {GOAL_OPTIONS.map((goal) => (
              <Button
                key={goal.value}
                type="button"
                variant={isGoalAlreadyAdded(goal.value) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (!isGoalAlreadyAdded(goal.value)) {
                    logger.debug("Goal added", {
                      goalType: goal.value,
                      priority: goalFields.length + 1,
                    });
                    appendGoal({
                      goal_type: goal.value as any,
                      priority: goalFields.length + 1,
                    });
                  }
                }}
                disabled={isGoalAlreadyAdded(goal.value)}
                className="flex items-center gap-1"
              >
                {isGoalAlreadyAdded(goal.value) && (
                  <Check className="h-3 w-3" />
                )}
                {goal.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
