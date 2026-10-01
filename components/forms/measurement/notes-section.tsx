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
import { useTranslations } from "next-intl";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("measurement-notes-section");

export function NotesSection() {
  const form = useFormContext();
  const t = useTranslations("measurementForm");

  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("notes")}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={t("notesPlaceholder")}
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
