"use server";

import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  type Measurement,
  type MeasurementInput,
  measurementInputSchema,
} from "@/lib/schemas/measurement";
import { safeAction } from "@/lib/utils/safe-action";

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

export async function addMeasurement(input: MeasurementInput) {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const validated = measurementInputSchema.parse(input);

    const newMeasurement = await db.profileMeasurement.create({
      data: {
        ...validated,
        date: new Date(validated.date),
        user_id: user.id,
      },
    });

    return { data: newMeasurement as unknown as Measurement, error: null };
  });
}

export async function updateMeasurement(
  id: string,
  input: Partial<MeasurementInput>
) {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { data: null, error: "You must be logged in" };
    }

    const validated = measurementInputSchema.partial().parse(input);
    const { date, ...rest } = validated;

    const { count } = await db.profileMeasurement.updateMany({
      where: { id, user_id: user.id },
      data: {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    if (count === 0) {
      return { data: null, error: "Measurement not found" };
    }

    const updatedMeasurement = await db.profileMeasurement.findFirst({
      where: { id, user_id: user.id },
    });

    return { data: updatedMeasurement as unknown as Measurement, error: null };
  });
}

export async function deleteMeasurement(id: string) {
  return safeAction(async () => {
    const user = await getServerUser();

    if (!user?.id) {
      return { error: "You must be logged in" };
    }

    const { count } = await db.profileMeasurement.deleteMany({
      where: { id, user_id: user.id },
    });

    if (count === 0) {
      return { error: "Measurement not found" };
    }

    return { error: null };
  });
}
