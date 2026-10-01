"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("training-preferences-section");

export function TrainingPreferencesSection() {
  const form = useFormContext();
  const t = useTranslations("profileForm");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="experience_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("experienceLevel")}</FormLabel>
            <Select
              onValueChange={(value) => {
                logger.debug("Experience level changed", { value });
                field.onChange(value);
              }}
              defaultValue={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("experiencePlaceholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beginner">{t("experienceBeginner")}</SelectItem>
                <SelectItem value="intermediate">{t("experienceIntermediate")}</SelectItem>
                <SelectItem value="advanced">{t("experienceAdvanced")}</SelectItem>
                <SelectItem value="expert">{t("experienceExpert")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="training_goal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("trainingGoal")}</FormLabel>
            <Select
              onValueChange={(value) => {
                logger.debug("Training goal changed", { value });
                field.onChange(value);
              }}
              defaultValue={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("trainingGoalPlaceholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="strength">{t("goalStrength")}</SelectItem>
                <SelectItem value="hypertrophy">
                  {t("goalHypertrophy")}
                </SelectItem>
                <SelectItem value="endurance">{t("goalEndurance")}</SelectItem>
                <SelectItem value="weight_loss">{t("goalWeightLoss")}</SelectItem>
                <SelectItem value="general_fitness">{t("goalGeneralFitness")}</SelectItem>
                <SelectItem value="sport_specific">{t("goalSportSpecific")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="weekly_availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("weeklyAvailability")}</FormLabel>
            <Select
              onValueChange={(value) => {
                const intValue = parseInt(value);
                logger.debug("Weekly availability changed", {
                  value: intValue,
                });
                field.onChange(intValue);
              }}
              defaultValue={field.value?.toString() || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("daysPerWeek")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="session_duration_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("sessionDuration")}</FormLabel>
            <Select
              onValueChange={(value) => {
                const intValue = parseInt(value);
                logger.debug("Session duration preference changed", {
                  value: intValue,
                });
                field.onChange(intValue);
              }}
              defaultValue={field.value?.toString() || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("minutesPerSession")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="45">45</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="75">75</SelectItem>
                <SelectItem value="90">90</SelectItem>
                <SelectItem value="120">120</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
