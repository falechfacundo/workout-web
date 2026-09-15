"use server";

import { db } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
import { safeAction } from "@/lib/utils/safe-action";
import {
  type MuscleGroup,
} from "@/lib/schemas/muscle-group";

export type MuscleGroupFormData = {
  name: string;
  description?: string | null;
};

export async function getMuscleGroups() {
  return safeAction(async () => {
    const user = await getServerUser();

    const data = await db.muscleGroup.findMany({
      where: user
        ? { OR: [{ user_id: user.id }, { is_default: true }] }
        : { is_default: true },
      orderBy: { name: "asc" },
    });

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    return { data: data as any as MuscleGroup[], error: null };
  });
}

export async function getMuscleGroup(id: string) {
  return safeAction(async () => {
    const data = await db.muscleGroup.findUnique({
      where: { id },
    });

    if (!data) {
      return {
        data: null,
        error: "Muscle group not found",
      };
    }

    return {
      data: data as any as MuscleGroup,
      error: null,
    };
  });
}

export async function getExerciseCountByMuscleGroup(id: string) {
  return safeAction(async () => {
    const count = await db.exerciseMuscleGroup.count({
      where: { muscle_group_id: id },
    });

    return {
      data: count,
      error: null,
    };
  });
}

export async function createMuscleGroup(data: MuscleGroupFormData) {
  return safeAction(async () => {
    const user = await getServerUser();
    if (!user) {
      return {
        data: null,
        error: "You must be logged in to create muscle groups",
      };
    }

    const newMuscleGroup = await db.muscleGroup.create({
      data: {
        name: data.name,
        user_id: user.id,
        is_default: false,
      },
    });

    return {
      data: newMuscleGroup as any as MuscleGroup,
      error: null,
    };
  });
}

export async function updateMuscleGroup(data: { id: string; name: string }) {
  return safeAction(async () => {
    const existingGroup = await db.muscleGroup.findUnique({
      where: { id: data.id },
    });

    if (!existingGroup) {
      return {
        data: null,
        error: "Muscle group not found",
      };
    }

    if (existingGroup.is_default) {
      return {
        data: null,
        error: "Default muscle groups cannot be modified",
      };
    }

    const updatedMuscleGroup = await db.muscleGroup.update({
      where: { id: data.id },
      data: { name: data.name },
    });

    return {
      data: updatedMuscleGroup as any as MuscleGroup,
      error: null,
    };
  });
}

export async function deleteMuscleGroup(id: string) {
  return safeAction(async () => {
    if (!id) {
      return {
        data: null,
        error: "Muscle group ID is required",
      };
    }

    const existingGroup = await db.muscleGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return {
        data: null,
        error: "Muscle group not found",
      };
    }

    if (existingGroup.is_default) {
      return {
        data: null,
        error: "Default muscle groups cannot be deleted",
      };
    }

    const count = await db.exerciseMuscleGroup.count({
      where: { muscle_group_id: id },
    });

    if (count > 0) {
      return {
        data: null,
        error: `Cannot delete muscle group: it is used by ${count} exercises`,
      };
    }

    await db.muscleGroup.delete({
      where: { id },
    });

    return {
      data: { id },
      error: null,
    };
  });
}
