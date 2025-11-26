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

const logger = createLogger("session-exercise-notes-section");

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
              placeholder="e.g., Focus on slow eccentric"
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                logger.debug("Notes changed");
                field.onChange(e);
              }}
            />
          </FormControl>
          <FormDescription>
            Any additional notes for this exercise
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
