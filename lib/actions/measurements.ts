"use server";

import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { type Measurement } from "@/lib/schemas/measurement";

const logger = createLogger("measurements-actions");

export async function getMeasurements() {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return { data: null, error: "You must be logged in" };
    }

    const { data, error } = await supabase
      .from("profile_measurements" as any)
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.warn("Error fetching measurements", { error: error.message });
      return { data: null, error: error.message };
    }

    return { data: data as Measurement[], error: null };
  });
}

export async function addMeasurement() {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return { data: null, error: "You must be logged in" };
    }

    const formattedData = {
      user_id: authData.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newMeasurement, error } = await supabase
      .from("profile_measurements" as any)
      .insert([formattedData])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: newMeasurement, error: null };
  });
}

export async function updateMeasurement() {
  return safeAction(async () => {
    const supabase = await createClient();

    const formattedData = {
      updated_at: new Date().toISOString(),
    };

    const { data: updatedMeasurement, error } = await supabase
      .from("profile_measurements" as any)
      .update(formattedData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: updatedMeasurement, error: null };
  });
}

export async function deleteMeasurement() {
  return safeAction(async () => {
    const supabase = await createClient();

    const { error } = await supabase
      .from("profile_measurements" as any)
      .delete();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  });
}
