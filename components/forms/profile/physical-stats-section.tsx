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
import { useTranslations } from "next-intl";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("physical-stats-section");

export function PhysicalStatsSection() {
  const form = useFormContext();
  const t = useTranslations("profileForm");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="weight_kg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("weightKg")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("weightPlaceholder")}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : null;
                  logger.debug("Weight changed", { value });
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="height_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("heightCm")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder={t("heightPlaceholder")}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseInt(e.target.value)
                    : null;
                  logger.debug("Height changed", { value });
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
