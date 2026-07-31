"use server";

import { createClient } from "@/lib/utils/supabase/server";
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("muscle_groups")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return {
        data: null,
        error: `Error fetching muscle groups: ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    return { data: data as MuscleGroup[], error: null };
  });
}

export async function getMuscleGroup(id: string) {
  return safeAction(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("muscle_groups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        data: null,
        error: `Error fetching muscle group: ${error.message}`,
      };
    }

    return {
      data: data as MuscleGroup,
      error: null,
    };
  });
}

export async function getExerciseCountByMuscleGroup(id: string) {
  return safeAction(async () => {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("exercise_muscle_groups")
      .select("*", { count: "exact" })
      .eq("muscle_group_id", id);

    if (error) {
      return {
        data: null,
        error: `Error counting exercises: ${error.message}`,
      };
    }

    return {
      data: count || 0,
      error: null,
    };
  });
}

export async function createMuscleGroup(data: MuscleGroupFormData) {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return {
        data: null,
        error: "You must be logged in to create muscle groups",
      };
    }

    const muscleGroupData = {
      name: data.name,
      user_id: authData.user.id,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newMuscleGroup, error } = await supabase
      .from("muscle_groups")
      .insert([muscleGroupData])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Error creating muscle group: ${error.message}`,
      };
    }

    return {
      data: newMuscleGroup as MuscleGroup,
      error: null,
    };
  });
}

export async function updateMuscleGroup(data: { id: string; name: string }) {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data: existingGroup, error: fetchError } = await supabase
      .from("muscle_groups")
      .select("*")
      .eq("id", data.id)
      .single();

    if (fetchError) {
      return {
        data: null,
        error: `Muscle group not found: ${fetchError.message}`,
      };
    }

    if ((existingGroup as any).is_default) {
      return {
        data: null,
        error: "Default muscle groups cannot be modified",
      };
    }

    const { data: updatedMuscleGroup, error } = await supabase
      .from("muscle_groups")
      .update({
        name: data.name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Error updating muscle group: ${error.message}`,
      };
    }

    return {
      data: updatedMuscleGroup as MuscleGroup,
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

    const supabase = await createClient();

    const { data: existingGroup, error: fetchError } = await supabase
      .from("muscle_groups")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return {
        data: null,
        error: `Muscle group not found: ${fetchError.message}`,
      };
    }

    if ((existingGroup as any).is_default) {
      return {
        data: null,
        error: "Default muscle groups cannot be deleted",
      };
    }

    const { count, error: countError } = await supabase
      .from("exercise_muscle_groups")
      .select("*", { count: "exact" })
      .eq("muscle_group_id", id);

    if (countError) {
      return {
        data: null,
        error: `Error checking muscle group usage: ${countError.message}`,
      };
    }

    if (count && count > 0) {
      return {
        data: null,
        error: `Cannot delete muscle group: it is used by ${count} exercises`,
      };
    }

    const { error: deleteError } = await supabase
      .from("muscle_groups")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return {
        data: null,
        error: `Error deleting muscle group: ${deleteError.message}`,
      };
    }

    return {
      data: { id },
      error: null,
    };
  });
}
