"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMeasurementsStore } from "@/lib/stores/measurements-store";
import { createLogger } from "@/lib/utils/logger";

import {
  measurementFormSchema,
  type MeasurementFormValues,
  type Measurement,
} from "@/lib/schemas/measurement";
import { type Profile } from "@/lib/schemas/profile";

import { DateSection } from "./date-section";
import { BodyMeasurementsSection } from "./body-measurements-section";
import { LimbMeasurementsSection } from "./limb-measurements-section";
import { NotesSection } from "./notes-section";

const logger = createLogger("measurement-form");

interface MeasurementFormProps {
  measurement?: Measurement | null;
  profile: Profile;
  onSuccess?: () => void;
}

export function MeasurementForm({
  measurement,
  profile,
  onSuccess,
}: MeasurementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addMeasurement, updateMeasurement } = useMeasurementsStore();

  // Default values for the form
  const defaultValues: Partial<MeasurementFormValues> = {
    date: measurement?.date ? new Date(measurement.date) : new Date(),
    weight_kg: measurement?.weight_kg || profile?.weight_kg || null,
    body_fat_percentage: measurement?.body_fat_percentage || null,
    chest_cm: measurement?.chest_cm || null,
    waist_cm: measurement?.waist_cm || null,
    hips_cm: measurement?.hips_cm || null,
    arm_left_cm: measurement?.arm_left_cm || null,
    arm_right_cm: measurement?.arm_right_cm || null,
    thigh_left_cm: measurement?.thigh_left_cm || null,
    thigh_right_cm: measurement?.thigh_right_cm || null,
    notes: measurement?.notes || "",
  };

  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues,
  });

  async function onSubmit(data: MeasurementFormValues) {
    logger.debug("Submitting measurement form", {
      isUpdate: !!measurement,
      date: data.date,
    });

    setIsLoading(true);

    try {
      // Format date as ISO string
      const formattedData = {
        ...data,
        date: data.date.toISOString().split("T")[0],
      };

      if (measurement?.id) {
        logger.info("Updating measurement", { measurementId: measurement.id });
        await updateMeasurement(measurement.id, formattedData);
      } else {
        logger.info("Adding new measurement", { profileId: profile.id });
        await addMeasurement(profile.id, formattedData);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      logger.error(
        "Error saving measurement",
        error instanceof Error ? error : new Error(String(error)),
        { profileId: profile.id }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Date Section */}
          <DateSection />

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Body Measurements</h3>
            <BodyMeasurementsSection />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Limb Measurements</h3>
            <LimbMeasurementsSection />
          </div>

          {/* Notes Section */}
          <NotesSection />

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : measurement
              ? "Update Measurements"
              : "Add Measurements"}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
