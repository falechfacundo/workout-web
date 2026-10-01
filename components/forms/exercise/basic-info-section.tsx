"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

export function BasicInfoSection() {
  const form = useFormContext();
  const t = useTranslations("exercises");

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("name")}</FormLabel>
            <FormControl>
              <Input placeholder={t("namePlaceholder")} {...field} />
            </FormControl>
            <FormDescription>{t("nameDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("description")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("descriptionPlaceholder")}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>{t("descriptionDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="video_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("videoUrl")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("videoUrlPlaceholder")}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>{t("videoUrlDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
