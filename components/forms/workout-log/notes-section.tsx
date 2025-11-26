"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("workout-log-notes-section");

export function NotesSection() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder="e.g., Focus on form and mind-muscle connection"
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                logger.debug("Notes changed");
                field.onChange(e);
              }}
            />
          </FormControl>
          <FormDescription>Any notes for this workout</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
