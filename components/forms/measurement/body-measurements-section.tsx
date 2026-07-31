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

export function BodyMeasurementsSection() {
  const form = useFormContext();

  const handleNumberInput = (field: any, value: string) => {
    const parsedValue = value ? parseFloat(value) : null;
    field.onChange(parsedValue);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="weight_kg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight (kg)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Weight in kg"
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
        name="body_fat_percentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Body Fat Percentage (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Body fat %"
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
        name="chest_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chest (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Chest measurement"
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
        name="waist_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Waist (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Waist measurement"
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
        name="hips_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hips (cm)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="Hip measurement"
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
