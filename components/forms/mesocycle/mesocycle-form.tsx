"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { type MesocycleFormData } from "@/lib/actions/mesocycles";
import { useMesocyclesStore } from "@/lib/stores/mesocycles-store";
import {
  mesocycleFormSchema,
  type MesocycleFormValues,
  type MesocycleGoal,
} from "@/lib/schemas/mesocycle";

import { BasicInfoSection } from "./basic-info-section";
import { MuscleGroupSection } from "./muscle-group-section";
import { GoalsSection } from "./goals-section";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("mesocycle-form");

interface MesocycleFormProps {
  initialData?: Omit<MesocycleFormData, "start_date" | "end_date"> & {
    start_date?: string;
    end_date?: string;
    goals?: MesocycleGoal[];
    focus_muscle_groups?: string[];
  };
  userId: string;
}

export function MesocycleForm({ initialData, userId }: MesocycleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMesocycle, updateMesocycle } = useMesocyclesStore();

  const form = useForm<MesocycleFormValues>({
    resolver: zodResolver(mesocycleFormSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      user_id: userId,
      name: initialData?.name || "",
      description: initialData?.description || "",
      start_date: initialData?.start_date
        ? new Date(initialData.start_date)
        : new Date(),
      end_date: initialData?.end_date
        ? new Date(initialData.end_date)
        : new Date(new Date().setDate(new Date().getDate() + 28)),
      status: "in_progress",
      goals: initialData?.goals || [],
      focus_muscle_groups: initialData?.focus_muscle_groups || [],
    },
  });

  async function onSubmit(values: MesocycleFormValues) {
    logger.debug("Submitting mesocycle form", {
      isEdit: !!initialData?.id,
      name: values.name,
    });
    setIsSubmitting(true);

    try {
      // Convert dates to ISO strings for the server action
      const formData: MesocycleFormData = {
        ...values,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        status: "in_progress",
        goals: values.goals || [],
        focus_muscle_groups: values.focus_muscle_groups || [],
      };

      const result = initialData?.id
        ? await updateMesocycle(formData)
        : await createMesocycle(formData);

      if (result?.error) {
        logger.warn("Error submitting mesocycle form", { error: result.error });
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        logger.info("Mesocycle form submitted successfully", {
          id: result?.data?.id,
          isEdit: !!initialData?.id,
        });
        toast({
          title: "Success",
          description: initialData?.id
            ? "Mesocycle updated successfully"
            : "Mesocycle created successfully",
        });

        router.push("/dashboard/mesocycles");
      }
    } catch (error) {
      logger.error(
        "Exception in mesocycle form submission",
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
          {/* Basic Information Section */}
          <BasicInfoSection />

          {/* Muscle Group Focus Section */}
          <MuscleGroupSection />

          {/* Goals Section */}
          <GoalsSection />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : initialData?.id
                ? "Update Mesocycle"
                : "Create Mesocycle"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
