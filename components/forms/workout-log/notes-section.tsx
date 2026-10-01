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
import { useTranslations } from "next-intl";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("workout-log-notes-section");

export function NotesSection() {
  const form = useFormContext();
  const t = useTranslations("newWorkoutLog");

  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("notesLabel")}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={t("notesPlaceholder")}
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                logger.debug("Notes changed");
                field.onChange(e);
              }}
            />
          </FormControl>
          <FormDescription>{t("notesDescription")}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
