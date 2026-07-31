"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { type SessionExerciseFormData } from "@/lib/actions/training-sessions";
import { useExercisesStore } from "@/lib/stores/exercises-store";
import { useTrainingSessionsStore } from "@/lib/stores/training-sessions-store";
import { createLogger } from "@/lib/utils/logger";

import {
  sessionExerciseFormSchema,
  type SessionExerciseFormValues,
} from "@/lib/schemas/session-exercise";

import { ExerciseSelector } from "./exercise-selector";
import { SetsRepsSection } from "./sets-reps-section";
import { TrainingParametersSection } from "./training-parameters-section";
import { NotesSection } from "./notes-section";

const logger = createLogger("session-exercise-form");

interface SessionExerciseFormProps {
  initialData?: SessionExerciseFormData;
  sessionId: string;
  mesocycleId: string;
}

export function SessionExerciseForm({
  initialData,
  sessionId,
  mesocycleId,
}: SessionExerciseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading } = useExercisesStore();
  const { addExerciseToSession, updateSessionExercise } =
    useTrainingSessionsStore();

  const form = useForm<SessionExerciseFormValues>({
    resolver: zodResolver(sessionExerciseFormSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      training_session_id: sessionId,
      exercise_id: initialData?.exercise_id || "",
      sets: initialData?.sets || 3,
      reps: initialData?.reps || 8,
      rir: initialData?.rir || 2,
      rest_between_sets: initialData?.rest_between_sets || 90,
      notes: initialData?.notes || "",
    },
  });

  async function onSubmit(values: SessionExerciseFormValues) {
    logger.debug("Submitting session exercise form", {
      isEdit: !!initialData?.id,
      sessionId,
      exerciseId: values.exercise_id,
    });

    setIsSubmitting(true);

    try {
      const result = initialData?.id
        ? await updateSessionExercise(values as SessionExerciseFormData)
        : await addExerciseToSession(values as SessionExerciseFormData);

      if (result?.error) {
        logger.warn("Error in session exercise submission", {
          error: result.error,
          isEdit: !!initialData?.id,
        });

        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        logger.info("Session exercise submitted successfully", {
          isEdit: !!initialData?.id,
          sessionId,
          exerciseId: values.exercise_id,
        });

        toast({
          title: "Success",
          description: initialData?.id
            ? "Exercise updated successfully"
            : "Exercise added successfully",
        });

        router.push(
          `/dashboard/mesocycles/${mesocycleId}/sessions/${sessionId}`
        );
        router.refresh();
      }
    } catch (error) {
      logger.error(
        "Exception in session exercise form submission",
        error instanceof Error ? error : new Error(String(error)),
        { sessionId, exerciseId: values.exercise_id }
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
          {/* Exercise Selector */}
          <ExerciseSelector />

          {/* Sets and Reps Section */}
          <SetsRepsSection />

          {/* Training Parameters */}
          <TrainingParametersSection />

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
              {isSubmitting ? "Saving..." : initialData?.id ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
