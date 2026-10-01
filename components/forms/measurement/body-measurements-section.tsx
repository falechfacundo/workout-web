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

export function BodyMeasurementsSection() {
  const form = useFormContext();
  const t = useTranslations("measurementForm");

  const handleNumberInput = (field: any, value: string) => {
    const parsedValue = value ? parseFloat(value) : null;
    field.onChange(parsedValue);
  };

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
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="body_fat_percentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("bodyFat")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("bodyFatPlaceholder")}
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="chest_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("chest")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("chestPlaceholder")}
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="waist_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("waist")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("waistPlaceholder")}
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hips_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("hips")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("hipsPlaceholder")}
                {...field}
                value={field.value || ""}
                onChange={(e) => handleNumberInput(field, e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
