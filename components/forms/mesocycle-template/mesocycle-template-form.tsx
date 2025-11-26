"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { createClientComponentClient } from "@supabase/auth-client-js";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useMesocycleTemplatesStore } from "@/lib/stores/mesocycle-templates-store";
import { MesocycleTemplateFormData } from "@/lib/actions/mesocycle-templates";
import { createLogger } from "@/lib/utils/logger";

import {
  mesocycleTemplateFormSchema,
  type MesocycleTemplateFormValues,
  type MesocycleTemplate,
} from "@/lib/schemas/mesocycle-template";

import { BasicInfoSection } from "./basic-info-section";
import { GoalsSection } from "./goals-section";
import { MuscleFocusSection } from "./muscle-focus-section";

const logger = createLogger("mesocycle-template-form");

interface MesocycleTemplateFormProps {
  initialTemplate?: MesocycleTemplate;
  initialGoals?: any[];
  initialMuscleFocus?: any[];
  onSuccess?: (templateId: string) => void;
  onCancel?: () => void;
}

export function MesocycleTemplateForm({
  initialTemplate,
  initialGoals = [],
  initialMuscleFocus = [],
  onSuccess,
  onCancel,
}: MesocycleTemplateFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  // Get actions from store
  const { createTemplate, updateTemplate, isLoading, error } =
    useMesocycleTemplatesStore();

  // Set up default values
  const defaultValues: MesocycleTemplateFormValues = {
    name: initialTemplate?.name || "",
    description: initialTemplate?.description || "",
    duration_weeks: initialTemplate?.duration_weeks || 4,
    is_public: initialTemplate?.is_public || false,
    goals:
      initialGoals.map((goal) => ({
        goal_type: goal.goal_type,
        priority: goal.priority,
      })) || [],
    muscleFocus:
      initialMuscleFocus.map((focus) => ({
        muscle_group_id: focus.muscle_group_id,
        focus_level: focus.focus_level || 5,
      })) || [],
  };

  const form = useForm<MesocycleTemplateFormValues>({
    resolver: zodResolver(mesocycleTemplateFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Show error messages from store
  useState(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  });

  async function onSubmit(values: MesocycleTemplateFormValues) {
    logger.debug("Submitting mesocycle template form", {
      isEdit: !!initialTemplate,
      templateName: values.name,
    });

    try {
      // Get authenticated user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        logger.warn("Authentication error - missing user ID");
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "No se pudo obtener tu información de usuario",
        });
        return;
      }

      // Prepare data for server action
      const formData: MesocycleTemplateFormData = {
        ...values,
        created_by: userId,
      };

      // Update or create based on whether we have an initial template
      if (initialTemplate?.id) {
        formData.id = initialTemplate.id;
        logger.info("Updating mesocycle template", {
          templateId: initialTemplate.id,
          templateName: values.name,
        });

        const success = await updateTemplate(formData);

        if (success) {
          toast({
            title: "Plantilla actualizada",
            description: "La plantilla se ha actualizado correctamente",
          });

          if (onSuccess) {
            onSuccess(initialTemplate.id);
          } else {
            router.push("/dashboard/mesocycles/templates");
            router.refresh();
          }
        }
      } else {
        // New template
        logger.info("Creating new mesocycle template", {
          templateName: values.name,
        });
        const templateId = await createTemplate(formData);

        if (templateId) {
          toast({
            title: "Plantilla creada",
            description: "La plantilla se ha creado correctamente",
          });

          if (onSuccess) {
            onSuccess(templateId);
          } else {
            router.push("/dashboard/mesocycles/templates");
            router.refresh();
          }
        }
      }
    } catch (error) {
      logger.error(
        "Error in mesocycle template form submission",
        error instanceof Error ? error : new Error(String(error))
      );

      toast({
        variant: "destructive",
        title: "Error",
        description:
          typeof error === "string"
            ? error
            : "Ha ocurrido un error al guardar la plantilla",
      });
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <BasicInfoSection />

          {/* Goals Section */}
          <GoalsSection />

          {/* Muscle Focus Section */}
          <MuscleFocusSection />

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
