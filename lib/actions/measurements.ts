"use server";

import { z } from "zod";
import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";
import {
  type Measurement,
  type MeasurementFormValues,
  measurementFormSchema,
} from "@/lib/schemas/measurement";

// Create a specific logger for this module
const logger = createLogger("measurements-actions");

// Get measurements for a profile
export const getMeasurements = safeAction(
  z.object({
    profileId: z.string().uuid(),
  }),
  async ({ profileId }) => {
    const supabase = await createClient();

    logger.debug("Fetching measurements", { profileId });

    const { data, error } = await supabase
      .from("profile_measurements")
      .select("*")
      .eq("profile_id", profileId)
      .order("date", { ascending: false });

    if (error) {
      logger.warn("Error fetching measurements", {
        error: error.message,
        profileId,
      });
      return { data: null, error: error.message };
    }

    logger.info("Measurements fetched successfully", {
      profileId,
      count: data.length,
    });
    return { data, error: null };
  }
);

// Schema for adding a new measurement
const addMeasurementSchema = measurementFormSchema.extend({
  profileId: z.string().uuid(),
});

// Add a new measurement
export const addMeasurement = safeAction(addMeasurementSchema, async (data) => {
  const supabase = await createClient();
  const { profileId, ...measurementData } = data;

  logger.debug("Adding new measurement", { profileId });

  const formattedData = {
    ...measurementData,
    profile_id: profileId,
    date: data.date.toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: newMeasurement, error } = await supabase
    .from("profile_measurements")
    .insert([formattedData])
    .select()
    .single();

  if (error) {
    logger.warn("Error adding measurement", {
      error: error.message,
      profileId,
    });
    return { data: null, error: error.message };
  }

  logger.info("Measurement added successfully", { id: newMeasurement.id });
  return { data: newMeasurement, error: null };
});

// Schema for updating a measurement
const updateMeasurementSchema = measurementFormSchema.extend({
  id: z.string().uuid(),
});

// Update a measurement
export const updateMeasurement = safeAction(
  updateMeasurementSchema,
  async (data) => {
    const supabase = await createClient();
    const { id, ...measurementData } = data;

    logger.debug("Updating measurement", { id });

    const formattedData = {
      ...measurementData,
      date: data.date.toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    };

    const { data: updatedMeasurement, error } = await supabase
      .from("profile_measurements")
      .update(formattedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.warn("Error updating measurement", { error: error.message, id });
      return { data: null, error: error.message };
    }

    logger.info("Measurement updated successfully", { id });
    return { data: updatedMeasurement, error: null };
  }
);

// Delete a measurement
export const deleteMeasurement = safeAction(
  z.object({
    id: z.string().uuid(),
  }),
  async ({ id }) => {
    const supabase = await createClient();

    logger.debug("Deleting measurement", { id });

    const { error } = await supabase
      .from("profile_measurements")
      .delete()
      .eq("id", id);

    if (error) {
      logger.warn("Error deleting measurement", { error: error.message, id });
      return { error: error.message };
    }

    logger.info("Measurement deleted successfully", { id });
    return { error: null };
  }
);
