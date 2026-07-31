"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { createLogger } from "@/lib/utils/logger";

import {
  workoutLogFormSchema,
  type WorkoutLogFormValues,
} from "@/lib/schemas/workout-log";

import { createWorkoutLog } from "@/lib/actions/workout-logs";

import { MesocycleSelector } from "./mesocycle-selector";
import { SessionSelector } from "./session-selector";
import { NotesSection } from "./notes-section";

const logger = createLogger("workout-log-form");

interface WorkoutLogFormProps {
  userId: string;
}

export function WorkoutLogForm({ userId }: WorkoutLogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkoutLogFormValues>({
    resolver: zodResolver(workoutLogFormSchema),
    defaultValues: {
      user_id: userId,
      date: new Date().toISOString().split("T")[0],
      mesocycle_id: undefined,
      training_session_id: undefined,
      notes: "",
    },
  });

  const selectedMesocycle = useWatch({
    control: form.control,
    name: "mesocycle_id",
  });

  async function onSubmit(values: WorkoutLogFormValues) {
    logger.debug("Submitting workout log form", {
      userId,
      mesocycleId: values.mesocycle_id,
    });

    setIsSubmitting(true);

    try {
      const result = await createWorkoutLog({
        ...values,
        date: values.date || new Date().toISOString().split("T")[0],
      });

      const workoutLogId = result.data?.id || null;

      if (!workoutLogId) {
        logger.warn("Failed to create workout log");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start workout. Please try again.",
        });
        return;
      }

      logger.info("Workout log created successfully", { workoutLogId });
      toast({
        title: "Success",
        description: "Workout started successfully",
      });

      router.push(`/dashboard/workout-logs/${workoutLogId}`);
      router.refresh();
    } catch (error) {
      logger.error(
        "Exception in workout log submission",
        error instanceof Error ? error : new Error(String(error))
      );

      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mesocycle Selector */}
          <MesocycleSelector userId={userId} />

          {/* Session Selector (only shown if mesocycle is selected) */}
          {selectedMesocycle && selectedMesocycle !== "none" && (
            <SessionSelector mesocycleId={selectedMesocycle} />
          )}

          {/* Notes Section */}
          <NotesSection />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Starting..." : "Start Workout"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
