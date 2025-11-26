"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useExercisesStore } from "@/lib/stores/exercises-store";
import { useMuscleGroupsStore } from "@/lib/stores/muscle-groups-store";
import { createLogger } from "@/lib/utils/logger";

import {
  exerciseFormSchema,
  type ExerciseFormValues,
  type ExerciseFormData,
} from "@/lib/schemas/exercise";

import { BasicInfoSection } from "./basic-info-section";
import { MuscleGroupsSection } from "./muscle-groups-section";

const logger = createLogger("exercise-form");

interface ExerciseFormProps {
  initialData?: ExerciseFormData;
}

export function ExerciseForm({ initialData }: ExerciseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading } = useMuscleGroupsStore();
  const { createExercise, updateExercise } = useExercisesStore();

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      name: initialData?.name || "",
      description: initialData?.description || "",
      video_url: initialData?.video_url || "",
      primary_muscle_group_id: initialData?.primary_muscle_group_id || "",
      secondary_muscle_groups: initialData?.secondary_muscle_groups || [],
    },
  });

  async function onSubmit(values: ExerciseFormValues) {
    logger.debug("Submitting exercise form", {
      isEdit: !!initialData?.id,
      exerciseName: values.name,
    });
    setIsSubmitting(true);

    try {
      const result = initialData?.id
        ? await updateExercise(values as ExerciseFormData)
        : await createExercise(values as ExerciseFormData);

      if (result?.error) {
        logger.warn("Error submitting exercise form", {
          error: result.error,
          exerciseName: values.name,
        });
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        logger.info("Exercise form submitted successfully", {
          id: result?.data?.id,
          isEdit: !!initialData?.id,
          exerciseName: values.name,
        });
        toast({
          title: "Success",
          description: initialData?.id
            ? "Exercise updated successfully"
            : "Exercise created successfully",
        });
        router.push("/dashboard/exercises");
        router.refresh();
      }
    } catch (error) {
      logger.error(
        "Exception in exercise form submission",
        error instanceof Error ? error : new Error(String(error)),
        { exerciseName: values.name }
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading form data...</div>;
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <BasicInfoSection />

          {/* Muscle Groups Section */}
          <MuscleGroupsSection />

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
