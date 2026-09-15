"use server";

import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { type Measurement } from "@/lib/schemas/measurement";
import { createLogger } from "@/lib/utils/logger";
import { safeAction } from "@/lib/utils/safe-action";

const logger = createLogger("measurements-actions");

export async function getMeasurements() {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const data = await db.profileMeasurement.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    return { data: data as any as Measurement[], error: null };
  });
}

export async function addMeasurement() {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const formattedData = {
      user_id: user.id,
      date: new Date(),
    };

    const newMeasurement = await db.profileMeasurement.create({
      data: formattedData,
    });

    return { data: newMeasurement as unknown as Measurement, error: null };
  });
}

export async function updateMeasurement() {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const formattedData = {};

    const updatedMeasurement = await db.profileMeasurement.updateMany({
      where: { user_id: user.id },
      data: formattedData,
    });

    return { data: updatedMeasurement, error: null };
  });
}

export async function deleteMeasurement() {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    await db.profileMeasurement.deleteMany({
      where: { user_id: user.id },
    });

    return { error: null };
  });
}