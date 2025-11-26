"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("training-session-basic-info");

export function BasicInfoSection() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Session Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="e.g., Push Day" 
              {...field} 
              onChange={(e) => {
                logger.debug("Session name changed", { value: e.target.value });
                field.onChange(e);
              }}
            />
          </FormControl>
          <FormDescription>
            The name of your training session
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
