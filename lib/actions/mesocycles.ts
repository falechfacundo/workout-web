"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import {
  mesocycleSchema,
  type Mesocycle,
  type MesocycleWithRelations,
} from "@/lib/schemas/mesocycle";

// Crear logger específico para mesociclos
const logger = createLogger("mesocycles-actions");

export async function getMesocycles(userId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclos para usuario", { userId });
    const startTime = performance.now();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mesocycles")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (error) {
      logger.error("Error al obtener mesociclos", error, {
        userId,
        errorCode: error.code,
      });

      return {
        data: null,
        error: `Error fetching mesocycles: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Mesociclos obtenidos exitosamente", {
      userId,
      count: data.length,
      duration,
    });

    return {
      data,
      error: null,
    };
  });
}

export async function getActiveMesocycles(userId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclos activos para usuario", { userId });
    const startTime = performance.now();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mesocycles")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("start_date");

    if (error) {
      logger.error("Error al obtener mesociclos activos", error, {
        userId,
        errorCode: error.code,
      });

      return {
        data: null,
        error: `Error fetching active mesocycles: ${error.message}`,
      };
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Mesociclos activos obtenidos exitosamente", {
      userId,
      count: data.length,
      duration,
    });

    return {
      data,
      error: null,
    };
  });
}

export async function getMesocycle(id: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo mesociclo por ID", { mesocycleId: id });
    const startTime = performance.now();

    const supabase = await createClient();
    // Fetch the main mesocycle data
    const { data: mesocycleData, error: mesocycleError } = await supabase
      .from("mesocycles")
      .select("*")
      .eq("id", id)
      .single();

    if (mesocycleError) {
      logger.error("Error al obtener mesociclo", mesocycleError, {
        mesocycleId: id,
        errorCode: mesocycleError.code,
      });

      return {
        data: null,
        error: `Error fetching mesocycle: ${mesocycleError.message}`,
      };
    }

    // Fetch goals for this mesocycle
    const { data: goalsData, error: goalsError } = await supabase
      .from("mesocycle_goals")
      .select("*")
      .eq("mesocycle_id", id);

    // Fetch muscle group focus for this mesocycle
    const { data: focusData, error: focusError } = await supabase
      .from("mesocycle_muscle_group_focus")
      .select("muscle_group_id")
      .eq("mesocycle_id", id);

    if (goalsError) {
      logger.warn("Error al obtener objetivos del mesociclo", {
        mesocycleId: id,
        errorCode: goalsError.code,
      }, goalsError);
    }

    if (focusError) {
      logger.warn("Error al obtener grupos musculares enfocados", {
        mesocycleId: id,
        errorCode: focusError.code,
      }, focusError);
    }

    // Format the data for the frontend
    const fullMesocycleData = {
      ...mesocycleData,
      goals: goalsData || [],
      focus_muscle_groups: focusData
        ? focusData.map((item) => item.muscle_group_id)
        : [],
    };

    const duration = Math.round(performance.now() - startTime);
    logger.info("Mesociclo obtenido exitosamente", {
      mesocycleId: id,
      mesocycleName: mesocycleData.name,
      goalsCount: (goalsData || []).length,
      focusCount: (focusData || []).length,
      duration,
    });

    return {
      data: fullMesocycleData as MesocycleWithRelations,
      error: null,
    };
  });
}

export async function createMesocycle(formData: Mesocycle) {
  return safeAction(async () => {
    logger.debug("Iniciando creación de mesociclo", {
      userId: formData.user_id,
      mesocycleName: formData.name,
    });
    const startTime = performance.now();

    // Validate form data
    const validatedFields = mesocycleSchema.safeParse(formData);

    if (!validatedFields.success) {
      const formattedErrors = validatedFields.error.format();
      logger.warn("Validación fallida en formulario de mesociclo", {
        errors: formattedErrors,
        userId: formData.user_id,
      });

      return {
        data: null,
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      user_id,
      name,
      start_date,
      end_date,
      description,
      status,
      goals,
      focus_muscle_groups,
    } = validatedFields.data;

    // Start a supabase transaction
    logger.info("Creando nuevo mesociclo", {
      userId: user_id,
      name,
      status,
      startDate: start_date,
      endDate: end_date,
      goalsCount: goals?.length || 0,
      focusMuscleGroupsCount: focus_muscle_groups?.length || 0,
    });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mesocycles")
      .insert([
        {
          user_id,
          name,
          start_date,
          end_date,
          description: description || null,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Error al crear mesociclo en la base de datos", error, {
        userId: user_id,
        name,
        errorCode: error.code,
      });

      return {
        data: null,
        error: `Error creating mesocycle: ${error.message}`,
      };
    }

    const mesocycleId = data.id;

    // Insert goals if provided
    if (goals && goals.length > 0) {
      logger.debug("Añadiendo objetivos al mesociclo", {
        mesocycleId,
        goalsCount: goals.length,
      });

      const goalsToInsert = goals.map((goal) => ({
        mesocycle_id: mesocycleId,
        goal_type: goal.goal_type,
        target_value: goal.target_value || null,
        unit: goal.unit || null,
        notes: goal.notes || null,
      }));

      const { error: goalsError } = await supabase
        .from("mesocycle_goals")
        .insert(goalsToInsert);

      if (goalsError) {
        logger.warn("Error al añadir objetivos al mesociclo", {
          mesocycleId,
          userId: user_id,
          goalsCount: goals.length,
          errorCode: goalsError.code,
        }, goalsError);
      }
    }

    // Insert muscle group focus if provided
    if (focus_muscle_groups && focus_muscle_groups.length > 0) {
      logger.debug("Añadiendo grupos musculares enfocados", {
        mesocycleId,
        focusCount: focus_muscle_groups.length,
        muscleGroups: focus_muscle_groups,
      });

      const focusToInsert = focus_muscle_groups.map((muscleGroupId) => ({
        mesocycle_id: mesocycleId,
        muscle_group_id: muscleGroupId,
      }));

      const { error: focusError } = await supabase
        .from("mesocycle_muscle_group_focus")
        .insert(focusToInsert);

      if (focusError) {
        logger.warn("Error al añadir grupos musculares enfocados", {
          mesocycleId,
          userId: user_id,
          focusCount: focus_muscle_groups.length,
          errorCode: focusError.code,
        }, focusError);
      }
    }

    const duration = Math.round(performance.now() - startTime);
    logger.info("Mesociclo creado exitosamente", {
      mesocycleId,
      name,
      userId: user_id,
      duration,
      status,
    });

    revalidatePath("/dashboard/mesocycles");
    redirect("/dashboard/mesocycles");

    return {
      data,
      error: null,
    };
  });
}

export async function updateMesocycle(formData: Mesocycle) {
  return safeAction(async () => {
    // Validate form data
    const validatedFields = mesocycleSchema.safeParse(formData);

    if (!validatedFields.success) {
      return {
        data: null,
        error: "Invalid form data. Please check the fields and try again.",
      };
    }

    const {
      id,
      user_id,
      name,
      start_date,
      end_date,
      description,
      status,
      goals,
      focus_muscle_groups,
    } = validatedFields.data;

    if (!id) {
      return {
        data: null,
        error: "Mesocycle ID is required for updates",
      };
    }

    // Update the main mesocycle data
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mesocycles")
      .update({
        user_id,
        name,
        start_date,
        end_date,
        description: description || null,
        status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Error updating mesocycle: ${error.message}`,
      };
    }

    // Delete existing goals and insert new ones
    const { error: deleteGoalsError } = await supabase
      .from("mesocycle_goals")
      .delete()
      .eq("mesocycle_id", id);

    if (deleteGoalsError) {
      console.error("Error deleting existing goals:", deleteGoalsError);
    }

    // Insert updated goals if provided
    if (goals && goals.length > 0) {
      const goalsToInsert = goals.map((goal) => ({
        mesocycle_id: id,
        goal_type: goal.goal_type,
        target_value: goal.target_value || null,
        unit: goal.unit || null,
        notes: goal.notes || null,
      }));

      const { error: goalsError } = await supabase
        .from("mesocycle_goals")
        .insert(goalsToInsert);

      if (goalsError) {
        console.error("Error updating mesocycle goals:", goalsError);
      }
    }

    // Delete existing muscle group focus and insert new ones
    const { error: deleteFocusError } = await supabase
      .from("mesocycle_muscle_group_focus")
      .delete()
      .eq("mesocycle_id", id);

    if (deleteFocusError) {
      console.error(
        "Error deleting existing muscle group focus:",
        deleteFocusError
      );
    }

    // Insert updated muscle group focus if provided
    if (focus_muscle_groups && focus_muscle_groups.length > 0) {
      const focusToInsert = focus_muscle_groups.map((muscleGroupId) => ({
        mesocycle_id: id,
        muscle_group_id: muscleGroupId,
      }));

      const { error: focusError } = await supabase
        .from("mesocycle_muscle_group_focus")
        .insert(focusToInsert);

      if (focusError) {
        console.error("Error updating muscle group focus:", focusError);
      }
    }

    revalidatePath("/dashboard/mesocycles");
    redirect("/dashboard/mesocycles");

    return {
      data,
      error: null,
    };
  });
}

export async function deleteMesocycle(id: string) {
  return safeAction(async () => {
    const supabase = await createClient();
    // Delete goals associated with this mesocycle
    const { error: goalsError } = await supabase
      .from("mesocycle_goals")
      .delete()
      .eq("mesocycle_id", id);

    if (goalsError) {
      console.error("Error deleting mesocycle goals:", goalsError);
    }

    // Delete muscle group focus associated with this mesocycle
    const { error: focusError } = await supabase
      .from("mesocycle_muscle_group_focus")
      .delete()
      .eq("mesocycle_id", id);

    if (focusError) {
      console.error("Error deleting muscle group focus:", focusError);
    }

    // First delete all training sessions associated with this mesocycle
    const { error: sessionsError } = await supabase
      .from("training_sessions")
      .delete()
      .eq("mesocycle_id", id);

    if (sessionsError) {
      return {
        data: null,
        error: `Error deleting training sessions: ${sessionsError.message}`,
      };
    }

    // Then delete the mesocycle
    const { error } = await supabase.from("mesocycles").delete().eq("id", id);

    if (error) {
      return {
        data: null,
        error: `Error deleting mesocycle: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/mesocycles");

    return {
      data: { success: true },
      error: null,
    };
  });
}

export async function getSessionCountByMesocycle(id: string) {
  return safeAction(async () => {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("training_sessions")
      .select("*", { count: "exact" })
      .eq("mesocycle_id", id);

    if (error) {
      return {
        data: null,
        error: `Error counting sessions: ${error.message}`,
      };
    }

    return {
      data: count || 0,
      error: null,
    };
  });
}

export async function updateMesocycleStatus(id: string, status: string) {
  return safeAction(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mesocycles")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Error updating mesocycle status: ${error.message}`,
      };
    }

    revalidatePath("/dashboard/mesocycles");
    revalidatePath(`/dashboard/mesocycles/${id}`);

    return {
      data,
      error: null,
    };
  });
}

// Type for the form data - exported for use in components
export type MesocycleFormData = Mesocycle;
