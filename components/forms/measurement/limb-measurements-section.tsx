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

export function LimbMeasurementsSection() {
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
        name="arm_left_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("armLeft")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("armLeftPlaceholder")}
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
        name="arm_right_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("armRight")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("armRightPlaceholder")}
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
        name="thigh_left_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("thighLeft")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("thighLeftPlaceholder")}
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
        name="thigh_right_cm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("thighRight")}</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder={t("thighRightPlaceholder")}
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
