"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("measurement-limb-section");

export function LimbMeasurementsSection() {
  const form = useFormContext();

  const handleNumberInput = (field: any, value: string) => {
    const parsedValue = value ? parseFloat(value) : null;
    field.onChange(parsedValue);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="arm_left_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Left Arm (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Left arm measurement"
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="arm_right_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Right Arm (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Right arm measurement"
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="thigh_left_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Left Thigh (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Left thigh measurement"
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="thigh_right_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Right Thigh (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Right thigh measurement"
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
