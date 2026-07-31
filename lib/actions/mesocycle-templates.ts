"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/utils/supabase/server";
import { safeAction } from "@/lib/utils/safe-action";
import { createLogger } from "@/lib/utils/logger";
import {
  mesocycleTemplateSchema,
  MesocycleTemplate,
  MesocycleTemplateWithRelations,
} from "@/lib/schemas/mesocycle-template";

// Create a specific logger for this module
const logger = createLogger("mesocycle-templates-actions");

// Type for the form data - exported for use in components
export type MesocycleTemplateFormData = MesocycleTemplate;

// Obtener todas las plantillas (públicas y privadas para el usuario)
export async function getMesocycleTemplates(userId: string) {
  return safeAction(async () => {
    logger.debug("Iniciando getMesocycleTemplates", { userId });
    const startTime = performance.now();

    const supabase = await createClient();

    try {
      // Obtener plantillas del usuario
      const { data: userTemplates, error: userTemplatesError } = await supabase
        .from("mesocycle_templates")
        .select(
          `
          *,
          mesocycle_template_goals (*),
          mesocycle_template_muscle_focus (*, muscle_groups (*)),
          training_session_templates (
            *,
            template_session_exercises (
              *,
              exercises (*)
            )
          )
        `
        )
        .eq("user_id", userId) // Solo las plantillas del usuario actual
        .order("name");
      logger.debug("Plantillas de usuario obtenidas", {
        count: userTemplates?.length || 0,
        hasError: !!userTemplatesError,
      });

      if (userTemplatesError) {
        logger.error(
          "Error al obtener plantillas de usuario",
          userTemplatesError,
          {
            userId,
            errorCode: userTemplatesError.code,
          }
        );
      }

      // Obtener plantillas por defecto (creadas en seed.sql con is_default = true)
      const { data: defaultTemplates, error: defaultTemplatesError } =
        await supabase
          .from("mesocycle_templates")
          .select(
            `
          *,
          mesocycle_template_goals (*),
          mesocycle_template_muscle_focus (*, muscle_groups (*)),
          training_session_templates (
            *,
            template_session_exercises (
              *,
              exercises (*)
            )
          )
          `
          )
          // .eq("is_default", true)
          .order("name");

      logger.debug("Plantillas por defecto obtenidas", {
        count: defaultTemplates?.length || 0,
        hasError: !!defaultTemplatesError,
      });

      if (defaultTemplatesError) {
        logger.error(
          "Error al obtener plantillas por defecto",
          defaultTemplatesError,
          {
            errorCode: defaultTemplatesError.code,
          }
        );
      }

      // Format data to match our schema
      const formattedUserTemplates =
        userTemplates?.map((template) => ({
          ...template,
          goals: template.mesocycle_template_goals || [],
          muscleFocus: template.mesocycle_template_muscle_focus || [],
          sessions: template.training_session_templates || [],
        })) || [];
      const formattedDefaultTemplates =
        defaultTemplates?.map((template) => ({
          ...template,
          goals: template.mesocycle_template_goals || [],
          muscleFocus: template.mesocycle_template_muscle_focus || [],
          sessions: template.training_session_templates || [],
          creator: template.profiles || null,
          is_default: true,
        })) || [];

      const duration = Math.round(performance.now() - startTime);
      logger.info("Plantillas de mesociclo obtenidas con éxito", {
        userTemplatesCount: formattedUserTemplates.length,
        defaultTemplatesCount: formattedDefaultTemplates.length,
        totalCount:
          formattedUserTemplates.length + formattedDefaultTemplates.length,
        duration,
      });

      return {
        data: {
          userTemplates: formattedUserTemplates,
          defaultTemplates: formattedDefaultTemplates,
          allTemplates: [
            ...formattedUserTemplates,
            ...formattedDefaultTemplates,
          ],
        },
        error: null,
      };
    } catch (error: any) {
      logger.error(
        "Error al obtener plantillas de mesociclo",
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );
      return {
        data: null,
        error: `Error al cargar plantillas: ${error.message}`,
      };
    }
  });
}

// Obtener una plantilla específica
export async function getMesocycleTemplate(templateId: string) {
  return safeAction(async () => {
    logger.debug("Obteniendo plantilla de mesociclo por ID", { templateId });

    const supabase = await createClient();

    try {
      const { data: template, error } = await supabase
        .from("mesocycle_templates")
        .select(
          `
          *,
          mesocycle_template_goals (*),
          mesocycle_template_muscle_focus (*, muscle_groups (*)),
          training_session_templates (
            *,
            template_session_exercises (
              *,
              exercises (*)
            )
          ),
          profiles!mesocycle_templates_created_by_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("id", templateId)
        .single();

      if (error) throw error;

      // Format the template to match our schema
      const formattedTemplate = {
        ...template,
        goals: template.mesocycle_template_goals || [],
        muscleFocus: template.mesocycle_template_muscle_focus || [],
        sessions: template.training_session_templates || [],
        creator: template.profiles || null,
      };

      return {
        data: formattedTemplate as MesocycleTemplateWithRelations,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: `Error al cargar plantilla: ${error.message}`,
      };
    }
  });
}

// Crear una nueva plantilla de mesociclo
export async function createMesocycleTemplate(
  formData: MesocycleTemplateFormData
) {
  return safeAction(async () => {
    const supabase = await createClient();

    try {
      // Validamos los datos del formulario
      const validatedFields = mesocycleTemplateSchema.parse(formData);
      const timestamp = new Date().toISOString();

      // Insertamos la plantilla principal
      const { data, error } = await supabase
        .from("mesocycle_templates")
        .insert({
          name: validatedFields.name,
          description: validatedFields.description,
          duration_weeks: validatedFields.duration_weeks,
          is_public: validatedFields.is_public,
          created_by: validatedFields.created_by,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .select()
        .single();

      if (error) throw error;

      const templateId = data.id;

      // Insertamos los objetivos
      if (validatedFields.goals && validatedFields.goals.length > 0) {
        const goals = validatedFields.goals.map((goal, index) => ({
          mesocycle_template_id: templateId,
          goal_type: goal.goal_type,
          priority: goal.priority || index + 1,
          created_at: timestamp,
          updated_at: timestamp,
        }));

        const { error: goalsError } = await supabase
          .from("mesocycle_template_goals")
          .insert(goals);

        if (goalsError) {
          console.error("Error al insertar objetivos:", goalsError);
        }
      }

      // Insertamos el enfoque muscular
      if (
        validatedFields.muscleFocus &&
        validatedFields.muscleFocus.length > 0
      ) {
        const muscleFocus = validatedFields.muscleFocus.map((focus) => ({
          mesocycle_template_id: templateId,
          muscle_group_id: focus.muscle_group_id,
          focus_level: focus.focus_level,
          created_at: timestamp,
          updated_at: timestamp,
        }));

        const { error: focusError } = await supabase
          .from("mesocycle_template_muscle_focus")
          .insert(muscleFocus);

        if (focusError) {
          console.error("Error al insertar enfoque muscular:", focusError);
        }
      }

      // Revalidamos la ruta para actualizar los datos
      revalidatePath("/dashboard/mesocycles/templates");

      return {
        data: templateId,
        error: null,
      };
    } catch (error: any) {
      console.error("Error in createMesocycleTemplate:", error);
      return {
        data: null,
        error: `Error al crear plantilla: ${error.message}`,
      };
    }
  });
}

// Actualizar una plantilla existente
export async function updateMesocycleTemplate(
  formData: MesocycleTemplateFormData
) {
  return safeAction(async () => {
    const supabase = await createClient();

    try {
      // Validamos los datos del formulario
      const validatedFields = mesocycleTemplateSchema.parse(formData);
      const timestamp = new Date().toISOString();

      if (!validatedFields.id) {
        throw new Error("ID de plantilla requerido para actualizar");
      }

      // Actualizamos la plantilla principal
      const { error } = await supabase
        .from("mesocycle_templates")
        .update({
          name: validatedFields.name,
          description: validatedFields.description,
          duration_weeks: validatedFields.duration_weeks,
          is_public: validatedFields.is_public,
          updated_at: timestamp,
        })
        .eq("id", validatedFields.id)
        .select()
        .single();

      if (error) throw error;

      // Eliminamos los objetivos anteriores
      const { error: deleteGoalsError } = await supabase
        .from("mesocycle_template_goals")
        .delete()
        .eq("mesocycle_template_id", validatedFields.id);

      if (deleteGoalsError) {
        console.error(
          "Error al eliminar objetivos existentes:",
          deleteGoalsError
        );
      }

      // Insertamos los nuevos objetivos
      if (validatedFields.goals && validatedFields.goals.length > 0) {
        const goals = validatedFields.goals.map((goal, index) => ({
          mesocycle_template_id: validatedFields.id!,
          goal_type: goal.goal_type,
          priority: goal.priority || index + 1,
          created_at: timestamp,
          updated_at: timestamp,
        }));

        const { error: goalsError } = await supabase
          .from("mesocycle_template_goals")
          .insert(goals);

        if (goalsError) {
          console.error(
            "Error al insertar objetivos actualizados:",
            goalsError
          );
        }
      }

      // Eliminamos el enfoque muscular anterior
      const { error: deleteFocusError } = await supabase
        .from("mesocycle_template_muscle_focus")
        .delete()
        .eq("mesocycle_template_id", validatedFields.id);

      if (deleteFocusError) {
        console.error(
          "Error al eliminar enfoque muscular existente:",
          deleteFocusError
        );
      }

      // Insertamos el nuevo enfoque muscular
      if (
        validatedFields.muscleFocus &&
        validatedFields.muscleFocus.length > 0
      ) {
        const muscleFocus = validatedFields.muscleFocus.map((focus) => ({
          mesocycle_template_id: validatedFields.id!,
          muscle_group_id: focus.muscle_group_id,
          focus_level: focus.focus_level,
          created_at: timestamp,
          updated_at: timestamp,
        }));

        const { error: focusError } = await supabase
          .from("mesocycle_template_muscle_focus")
          .insert(muscleFocus);

        if (focusError) {
          console.error(
            "Error al insertar enfoque muscular actualizado:",
            focusError
          );
        }
      }

      // Revalidamos la ruta para actualizar los datos
      revalidatePath("/dashboard/mesocycles/templates");
      revalidatePath(`/dashboard/mesocycles/templates/${validatedFields.id}`);

      return {
        data: true,
        error: null,
      };
    } catch (error: any) {
      console.error("Error in updateMesocycleTemplate:", error);
      return {
        data: null,
        error: `Error al actualizar plantilla: ${error.message}`,
      };
    }
  });
}

// Eliminar una plantilla
export async function deleteMesocycleTemplate(templateId: string) {
  return safeAction(async () => {
    const supabase = await createClient();

    try {
      // Primero eliminamos todas las relaciones para mantener la consistencia

      // 1. Eliminar sesiones de entrenamiento relacionadas
      const { data: sessions } = await supabase
        .from("training_session_templates")
        .select("id")
        .eq("mesocycle_template_id", templateId);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map((s) => s.id);

        // Eliminar ejercicios de las sesiones
        await supabase
          .from("template_session_exercises")
          .delete()
          .in("training_session_template_id", sessionIds);

        // Eliminar las sesiones
        await supabase
          .from("training_session_templates")
          .delete()
          .eq("mesocycle_template_id", templateId);
      }

      // 2. Eliminar objetivos y enfoques musculares
      await supabase
        .from("mesocycle_template_goals")
        .delete()
        .eq("mesocycle_template_id", templateId);

      await supabase
        .from("mesocycle_template_muscle_focus")
        .delete()
        .eq("mesocycle_template_id", templateId);

      // 3. Finalmente eliminamos la plantilla
      const { error } = await supabase
        .from("mesocycle_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      // Revalidamos la ruta para actualizar los datos
      revalidatePath("/dashboard/mesocycles/templates");

      return {
        data: true,
        error: null,
      };
    } catch (error: any) {
      console.error("Error in deleteMesocycleTemplate:", error);
      return {
        data: null,
        error: `Error al eliminar plantilla: ${error.message}`,
      };
    }
  });
}
