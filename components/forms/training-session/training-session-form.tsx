"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useTrainingSessionsStore } from "@/lib/stores/training-sessions-store";
import { createLogger } from "@/lib/utils/logger";

import {
  trainingSessionFormSchema,
  type TrainingSessionFormValues,
  type TrainingSessionFormData,
} from "@/lib/schemas/training-session";

import { BasicInfoSection } from "./basic-info-section";
import { ScheduleSection } from "./schedule-section";
import { NotesSection } from "./notes-section";

const logger = createLogger("training-session-form");

interface TrainingSessionFormProps {
  initialData?: TrainingSessionFormData;
  mesocycleId: string;
  totalWeeks: number;
}

export function TrainingSessionForm({
  initialData,
  mesocycleId,
  totalWeeks,
}: TrainingSessionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSession, updateSession } = useTrainingSessionsStore();

  const form = useForm<TrainingSessionFormValues>({
    resolver: zodResolver(trainingSessionFormSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      mesocycle_id: mesocycleId,
      name: initialData?.name || "",
      day_of_week: initialData?.day_of_week || undefined,
      week_number: initialData?.week_number || 1,
      notes: initialData?.notes || "",
    },
  });

  async function onSubmit(values: TrainingSessionFormValues) {
    logger.debug("Submitting training session form", {
      isEdit: !!initialData?.id,
      sessionName: values.name,
      mesocycleId: mesocycleId,
    });

    setIsSubmitting(true);

    try {
      let success: boolean | string | null;

      if (initialData?.id) {
        success = await updateSession(values as TrainingSessionFormData);
      } else {
        success = await createSession(values as TrainingSessionFormData);
      }

      if (!success) {
        logger.warn("Training session form submission failed", {
          isEdit: !!initialData?.id,
          sessionName: values.name,
        });

        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save training session. Please try again.",
        });
      } else {
        logger.info("Training session form submitted successfully", {
          isEdit: !!initialData?.id,
          sessionName: values.name,
          sessionId: initialData?.id || success,
        });

        toast({
          title: "Success",
          description: initialData?.id
            ? "Training session updated successfully"
            : "Training session created successfully",
        });

        router.push(`/dashboard/mesocycles/${mesocycleId}`);
        router.refresh();
      }
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
          {/* Basic Information Section */}
          <BasicInfoSection />

          {/* Schedule Section */}
          <ScheduleSection totalWeeks={totalWeeks} />

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
