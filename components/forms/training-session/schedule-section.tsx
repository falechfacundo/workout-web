"use client";

import {
  FormControl,
  FormDescription,
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

const logger = createLogger("training-session-schedule");

interface ScheduleSectionProps {
  totalWeeks: number;
}

export function ScheduleSection({ totalWeeks }: ScheduleSectionProps) {
  const form = useFormContext();

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="week_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Week Number</FormLabel>
            <Select
              onValueChange={(value) => {
                const numValue = parseInt(value);
                logger.debug("Week number changed", { value: numValue });
                field.onChange(numValue);
              }}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: totalWeeks }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Week {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Which week of the mesocycle this session belongs to
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="day_of_week"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Day of Week</FormLabel>
            <Select
              onValueChange={(value) => {
                const numValue = parseInt(value);
                logger.debug("Day of week changed", { value: numValue });
                field.onChange(numValue);
              }}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Which day of the week this session is scheduled for
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
