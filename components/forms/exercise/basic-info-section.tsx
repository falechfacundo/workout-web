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
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("exercise-basic-info");

export function BasicInfoSection() {
  const form = useFormContext();

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Bench Press" {...field} />
            </FormControl>
            <FormDescription>The name of the exercise</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., Lie on a bench and press the weight upward"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              A brief description of how to perform the exercise
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="video_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video URL</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., https://youtube.com/watch?v=..."
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Optional link to a demonstration video
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
