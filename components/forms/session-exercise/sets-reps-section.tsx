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
        name="sets"
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
      <FormField
        control={form.control}
        name="reps"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reps</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  logger.debug("Reps value changed", { value });
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>Number of repetitions per set</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
