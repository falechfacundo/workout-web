"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("sets-reps-section");

export function SetsRepsSection() {
  const form = useFormContext();

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="target_sets"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sets</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  logger.debug("Sets value changed", { value });
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>Number of sets to perform</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="target_reps_min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Reps</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    logger.debug("Min reps value changed", { value });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>Minimum reps</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_reps_max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Reps</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    logger.debug("Max reps value changed", { value });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>Maximum reps</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
