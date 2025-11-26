"use client";

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
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("training-parameters-section");

export function TrainingParametersSection() {
  const form = useFormContext();

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="target_rir"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target RIR</FormLabel>
            <Select
              onValueChange={(value) => {
                const numValue = parseInt(value);
                logger.debug("RIR value changed", { value: numValue });
                field.onChange(numValue);
              }}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select RIR" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">0 (Failure)</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Reps in reserve (how many reps you could still do)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="planned_rest_seconds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rest Time (seconds)</FormLabel>
            <Select
              onValueChange={(value) => {
                const numValue = parseInt(value);
                logger.debug("Rest time changed", { value: numValue });
                field.onChange(numValue);
              }}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select rest time" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="90">90 seconds</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="180">3 minutes</SelectItem>
                <SelectItem value="240">4 minutes</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Planned rest time between sets</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
