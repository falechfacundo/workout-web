"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("personal-info-section");

export function PersonalInfoSection() {
  const form = useFormContext();
  const t = useTranslations("profileForm");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("username")}</FormLabel>
            <FormControl>
              <Input
                placeholder="username"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("fullName")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("fullNamePlaceholder")}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="birth_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("dateOfBirth")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{t("pickDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={(date) => {
                    logger.debug("Birth date selected", { date });
                    field.onChange(date);
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sex"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("sex")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("select")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">{t("sexMale")}</SelectItem>
                <SelectItem value="female">{t("sexFemale")}</SelectItem>
                <SelectItem value="other">{t("sexOther")}</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  {t("sexPreferNotToSay")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
