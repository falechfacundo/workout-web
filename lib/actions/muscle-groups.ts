"use server";

import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import { AppError } from "@/lib/error";
import {
  muscleGroupFormSchema,
  type MuscleGroupFormValues,
  type MuscleGroup,
} from "@/lib/schemas/muscle-group";

export type MuscleGroupFormData = MuscleGroupFormValues;

// Create a specific logger for this module
const logger = createLogger("muscle-groups-actions");

export async function getMuscleGroups() {
  return safeAction(async () => {
    logger.debug("Iniciando getMuscleGroups");
    const startTime = performance.now();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("muscle_groups")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error al obtener grupos musculares", error, {
        errorCode: error.code,
        errorMessage: error.message,
      });
      return {
        data: null,
        error: `Error fetching muscle groups: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Grupos musculares obtenidos con éxito", {
      count: data?.length || 0,
      duration,
    });

    if (!data || data.length === 0) {
      logger.debug("No se encontraron grupos musculares");
      return { data: [], error: null };
    }

    return { data, error: null };
  });
}

export async function getMuscleGroup(id: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo grupo muscular por ID", { muscleGroupId: id });
    const startTime = performance.now();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("muscle_groups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error al obtener grupo muscular", error, {
        muscleGroupId: id,
        errorCode: error.code,
      });
      return {
        data: null,
        error: `Error fetching muscle group: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info(`Grupo muscular ${id} obtenido con éxito`, {
      name: data.name,
      duration,
    });

    return {
      data,
      error: null,
    };
  });
}

export async function getExerciseCountByMuscleGroup(id: string) {
  return safeAction(async () => {
    logger.debug("Contando ejercicios por grupo muscular", {
      muscleGroupId: id,
    });

    const supabase = await createClient();
    const { count, error } = await supabase
      .from("exercise_muscle_groups")
      .select("*", { count: "exact" })
      .eq("muscle_group_id", id);

    if (error) {
      logger.error("Error al contar ejercicios para grupo muscular", error, {
        muscleGroupId: id,
        errorCode: error.code,
      });
      return {
        data: null,
        error: `Error counting exercises: ${error.message}`,
      };
    }

    logger.info("Conteo de ejercicios completado", {
      muscleGroupId: id,
      exerciseCount: count || 0,
    });

    return {
      data: count || 0,
      error: null,
    };
  });
}

export const createMuscleGroup = safeAction(
  muscleGroupFormSchema,
  async (data) => {
    logger.debug("Creando nuevo grupo muscular", { name: data.name });
    const startTime = performance.now();

    const supabase = await createClient();

    // Get current user
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      logger.warn("Intento de crear grupo muscular sin autenticar");
      return {
        data: null,
        error: "You must be logged in to create muscle groups",
      };
    }

    const muscleGroupData = {
      ...data,
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
      logger.error("Error al crear grupo muscular", error, {
        name: data.name,
        errorCode: error.code,
      });
      return {
        data: null,
        error: `Error creating muscle group: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Grupo muscular creado con éxito", {
      id: newMuscleGroup.id,
      name: newMuscleGroup.name,
      duration,
    });

    return {
      data: newMuscleGroup as MuscleGroup,
      error: null,
    };
  }
);

export const updateMuscleGroup = safeAction(
  muscleGroupFormSchema.extend({
    id: muscleGroupFormSchema.shape.id.refine((id) => !!id, {
      message: "ID is required for updates",
    }),
  }),
  async (data) => {
    logger.debug("Actualizando grupo muscular", {
      id: data.id,
      name: data.name,
    });
    const startTime = performance.now();

    const supabase = await createClient();

    // Verificar que el grupo muscular exista
    const { data: existingGroup, error: fetchError } = await supabase
      .from("muscle_groups")
      .select("*")
      .eq("id", data.id)
      .single();

    if (fetchError) {
      logger.error("Error al verificar grupo muscular existente", fetchError, {
        id: data.id,
        errorCode: fetchError.code,
      });
      return {
        data: null,
        error: `Muscle group not found: ${fetchError.message}`,
      };
    }

    // Verificar si es un grupo muscular por defecto
    if (existingGroup.is_default) {
      logger.warn("Intento de modificar grupo muscular por defecto", {
        id: data.id,
        name: existingGroup.name,
      });
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
      logger.error("Error al actualizar grupo muscular", error, {
        id: data.id,
        name: data.name,
        errorCode: error.code,
      });
      return {
        data: null,
        error: `Error updating muscle group: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Grupo muscular actualizado con éxito", {
      id: updatedMuscleGroup.id,
      name: updatedMuscleGroup.name,
      duration,
    });

    return {
      data: updatedMuscleGroup as MuscleGroup,
      error: null,
    };
  }
);

export const deleteMuscleGroup = safeAction(
  muscleGroupFormSchema.pick({ id: true }),
  async ({ id }) => {
    if (!id) {
      return {
        data: null,
        error: "Muscle group ID is required",
      };
    }

    logger.debug("Eliminando grupo muscular", { muscleGroupId: id });
    const startTime = performance.now();

    const supabase = await createClient();

    // Verificar que el grupo muscular exista
    const { data: existingGroup, error: fetchError } = await supabase
      .from("muscle_groups")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      logger.error("Error al verificar grupo muscular existente", fetchError, {
        id,
        errorCode: fetchError.code,
      });
      return {
        data: null,
        error: `Muscle group not found: ${fetchError.message}`,
      };
    }

    // Verificar si es un grupo muscular por defecto
    if (existingGroup.is_default) {
      logger.warn("Intento de eliminar grupo muscular por defecto", {
        id,
        name: existingGroup.name,
      });
      return {
        data: null,
        error: "Default muscle groups cannot be deleted",
      };
    }

    // Verificar si está en uso por algún ejercicio
    const { count, error: countError } = await supabase
      .from("exercise_muscle_groups")
      .select("*", { count: "exact" })
      .eq("muscle_group_id", id);

    if (countError) {
      logger.error("Error al verificar uso del grupo muscular", countError, {
        id,
        errorCode: countError.code,
      });
      return {
        data: null,
        error: `Error checking muscle group usage: ${countError.message}`,
      };
    }

    if (count && count > 0) {
      logger.warn("Intento de eliminar grupo muscular en uso", {
        id,
        name: existingGroup.name,
        usageCount: count,
      });
      return {
        data: null,
        error: `Cannot delete muscle group: it is used by ${count} exercises`,
      };
    }

    // Proceder con la eliminación
    const { error: deleteError } = await supabase
      .from("muscle_groups")
      .delete()
      .eq("id", id);

    if (deleteError) {
      logger.error("Error al eliminar grupo muscular", deleteError, {
        id,
        name: existingGroup.name,
        errorCode: deleteError.code,
      });
      return {
        data: null,
        error: `Error deleting muscle group: ${deleteError.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Grupo muscular eliminado con éxito", {
      id,
      name: existingGroup.name,
      duration,
    });

    return {
      data: { id },
      error: null,
    };
  }
);
