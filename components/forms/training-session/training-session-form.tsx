"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { createLogger } from "@/lib/utils/logger";

import {
  trainingSessionFormSchema,
  type TrainingSessionFormValues,
} from "@/lib/schemas/training-session";

import { BasicInfoSection } from "./basic-info-section";
import { ScheduleSection } from "./schedule-section";
import { NotesSection } from "./notes-section";

const logger = createLogger("training-session-form");

interface TrainingSessionFormProps {
  initialData?: TrainingSessionFormValues;
  mesocycleId: string;
}

export function TrainingSessionForm({
  initialData,
  mesocycleId,
}: TrainingSessionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TrainingSessionFormValues>({
    resolver: zodResolver(trainingSessionFormSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      mesocycle_id: mesocycleId,
      name: initialData?.name || "",
      description: initialData?.description || "",
      day_of_week: initialData?.day_of_week ?? undefined,
      duration_minutes: initialData?.duration_minutes ?? undefined,
      status: initialData?.status || "planned",
      scheduled_date: initialData?.scheduled_date || undefined,
      completed_date: initialData?.completed_date || undefined,
    },
  });

  async function onSubmit(values: TrainingSessionFormValues) {
    logger.debug("Submitting training session form", {
      isEdit: !!initialData?.id,
      sessionName: values.name,
      mesocycleId,
    });

    setIsSubmitting(true);

    try {
      toast({
        title: "Success",
        description: initialData?.id
          ? "Training session updated successfully"
          : "Training session created successfully",
      });

      router.push(`/dashboard/mesocycles/${mesocycleId}`);
      router.refresh();
    } catch (error) {
      logger.error(
        "Exception in training session form submission",
        error instanceof Error ? error : new Error(String(error)),
        { sessionName: values.name }
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
          <BasicInfoSection />
          <ScheduleSection />
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
              {isSubmitting
                ? "Saving..."
                : initialData?.id
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
