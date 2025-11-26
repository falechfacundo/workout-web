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
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("training-preferences-section");

export function TrainingPreferencesSection() {
  const form = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="experience_level"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience Level</FormLabel>
            <Select
              onValueChange={(value) => {
                logger.debug("Experience level changed", { value });
                field.onChange(value);
              }}
              defaultValue={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
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
            <FormLabel>Training Goal</FormLabel>
            <Select
              onValueChange={(value) => {
                logger.debug("Training goal changed", { value });
                field.onChange(value);
              }}
              defaultValue={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary goal" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="hypertrophy">
                  Hypertrophy (Muscle Growth)
                </SelectItem>
                <SelectItem value="endurance">Endurance</SelectItem>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="general_fitness">General Fitness</SelectItem>
                <SelectItem value="sport_specific">Sport Specific</SelectItem>
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
            <FormLabel>Weekly Availability (days)</FormLabel>
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
                  <SelectValue placeholder="Days per week" />
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
            <FormLabel>Preferred Session Duration (minutes)</FormLabel>
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
                  <SelectValue placeholder="Minutes per session" />
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
