"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

// UI Components
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Types and schemas
import {
  sessionTemplateFormSchema,
  type SessionTemplateFormValues,
  type TrainingSessionTemplate,
} from "@/lib/schemas/session-template";

// Store
import { useSessionTemplatesStore } from "@/lib/stores/session-templates-store";
import { createLogger } from "@/lib/utils/logger";

// Form sections
import { BasicInfoSection } from "./basic-info-section";
import { ExerciseList } from "./exercise-list";

const logger = createLogger("session-template-form");

interface SessionTemplateFormProps {
  initialTemplate?: TrainingSessionTemplate;
  initialExercises?: any[];
  mesocycleTemplateId?: string;
  onSuccess?: (templateId: string) => void;
  onCancel?: () => void;
}

export function SessionTemplateForm({
  initialTemplate,
  initialExercises = [],
  mesocycleTemplateId,
  onSuccess,
  onCancel,
}: SessionTemplateFormProps) {
  const router = useRouter();
  const { isLoading, error, saveSessionTemplate } = useSessionTemplatesStore();

  // Set up default values
  const defaultValues: SessionTemplateFormValues = {
    name: initialTemplate?.name || "",
    description: initialTemplate?.description || "",
    duration_minutes: initialTemplate?.duration_minutes || 60,
    is_public: initialTemplate?.is_public || false,
    exercises:
      initialExercises.length > 0
        ? initialExercises.map((ex) => ({
            exercise_id: ex.exercise_id,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            rir: ex.rir || 2,
            rest_between_sets: ex.rest_between_sets || 90,
            rest_after_exercise: ex.rest_after_exercise || 120,
            notes: ex.notes || "",
          }))
        : [],
  };

  const form = useForm<SessionTemplateFormValues>({
    resolver: zodResolver(sessionTemplateFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Log errors from store
  useEffect(() => {
    if (error) {
      logger.warn("Error from store", { error });
    }
  }, [error]);

  async function onSubmit(values: SessionTemplateFormValues) {
    logger.debug("Submitting session template form", {
      isEdit: !!initialTemplate,
      name: values.name,
      exercisesCount: values.exercises?.length || 0,
    });

    const templateId = await saveSessionTemplate(
      values,
      mesocycleTemplateId,
      initialTemplate?.id
    );

    if (templateId) {
      logger.info("Session template saved successfully", { templateId });

      if (onSuccess) {
        onSuccess(templateId);
      } else {
        router.push("/dashboard/templates");
        router.refresh();
      }
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <BasicInfoSection />

          {/* Exercise List Section */}
          <ExerciseList />

          <div className="flex justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : initialTemplate
                ? "Actualizar Plantilla"
                : "Crear Plantilla"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
