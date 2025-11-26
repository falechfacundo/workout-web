"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("measurement-notes-section");

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
              placeholder="Any additional notes about these measurements"
              className="resize-none"
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                logger.debug("Measurement notes changed");
                field.onChange(e);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
