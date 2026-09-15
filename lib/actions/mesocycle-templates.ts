"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
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

    try {
      // Obtener plantillas del usuario
      const userTemplates = await db.mesocycleTemplate.findMany({
        where: { user_id: userId },
        include: {
          goals: true,
          muscle_focus: { include: { muscle_group: true } },
          sessions: {
            include: {
              template_session_exercises: {
                include: { exercise: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });
      logger.debug("Plantillas de usuario obtenidas", {
        count: userTemplates?.length || 0,
      });

      // Obtener plantillas por defecto (creadas en seed con is_default = true)
      const defaultTemplates = await db.mesocycleTemplate.findMany({
        where: { is_default: true },
        include: {
          goals: true,
          muscle_focus: { include: { muscle_group: true } },
          sessions: {
            include: {
              template_session_exercises: {
                include: { exercise: true },
              },
            },
          },
          created_by_profile: true,
        },
        orderBy: { name: "asc" },
      });

      logger.debug("Plantillas por defecto obtenidas", {
        count: defaultTemplates?.length || 0,
      });

      const formatTemplate = (template: any, isDefault = false) => ({
        ...template,
        goals: template.goals || [],
        muscleFocus: (template.muscle_focus || []).map((focus: any) => ({
          ...focus,
          muscle_groups: focus.muscle_group || null,
        })),
        sessions: (template.sessions || []).map((session: any) => ({
          ...session,
          template_session_exercises: (session.template_session_exercises || []).map(
            (tse: any) => ({
              ...tse,
              exercises: tse.exercise || null,
            })
          ),
        })),
        creator: template.created_by_profile || null,
        is_default: isDefault || template.is_default,
      });

      const formattedUserTemplates = userTemplates.map((t) =>
        formatTemplate(t)
      );
      const formattedDefaultTemplates = defaultTemplates.map((t) =>
        formatTemplate(t, true)
      );

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

    try {
      const template = await db.mesocycleTemplate.findUnique({
        where: { id: templateId },
        include: {
          goals: true,
          muscle_focus: { include: { muscle_group: true } },
          sessions: {
            include: {
              template_session_exercises: {
                include: { exercise: true },
              },
            },
          },
          created_by_profile: true,
        },
      });

      if (!template) throw new Error("Plantilla no encontrada");

      // Format the template to match our schema
      const formattedTemplate = {
        ...template,
        goals: template.goals || [],
        muscleFocus: (template.muscle_focus || []).map((focus) => ({
          ...focus,
          muscle_groups: focus.muscle_group || null,
        })),
        sessions: (template.sessions || []).map((session) => ({
          ...session,
          template_session_exercises: (session.template_session_exercises || []).map(
            (tse) => ({
              ...tse,
              exercises: tse.exercise || null,
            })
          ),
        })),
        creator: template.created_by_profile || null,
      };

      return {
        data: formattedTemplate as unknown as MesocycleTemplateWithRelations,
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
    try {
      // Validamos los datos del formulario
      const validatedFields = mesocycleTemplateSchema.parse(formData);

      const user = await getServerUser();
      if (!user?.id) {
        return {
          data: null,
          error: "Debes iniciar sesión para crear plantillas.",
        };
      }

      const profile = await db.profile.findUnique({
        where: { user_id: user.id },
        select: { id: true },
      });

      // Insertamos la plantilla principal con sus relaciones
      const template = await db.mesocycleTemplate.create({
        data: {
          user_id: user.id,
          name: validatedFields.name,
          description: validatedFields.description,
          duration_weeks: validatedFields.duration_weeks,
          is_public: validatedFields.is_public,
          created_by: profile?.id ?? null,
          goals: {
            create:
              validatedFields.goals?.map((goal, index) => ({
                goal_type: goal.goal_type,
                priority: goal.priority || index + 1,
              })) || [],
          },
          muscle_focus: {
            create:
              validatedFields.muscleFocus?.map((focus) => ({
                muscle_group_id: focus.muscle_group_id,
                focus_level: focus.focus_level,
              })) || [],
          },
        },
        select: { id: true },
      });

      const templateId = template.id;

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
    try {
      // Validamos los datos del formulario
      const validatedFields = mesocycleTemplateSchema.parse(formData);

      if (!validatedFields.id) {
        throw new Error("ID de plantilla requerido para actualizar");
      }

      const user = await getServerUser();
      if (!user?.id) {
        return {
          data: null,
          error: "Debes iniciar sesión para actualizar plantillas.",
        };
      }

      // Actualizamos la plantilla principal
      await db.mesocycleTemplate.update({
        where: { id: validatedFields.id },
        data: {
          name: validatedFields.name,
          description: validatedFields.description,
          duration_weeks: validatedFields.duration_weeks,
          is_public: validatedFields.is_public,
        },
      });

      // Eliminamos los objetivos anteriores e insertamos los nuevos
      await db.mesocycleTemplateGoal.deleteMany({
        where: { mesocycle_template_id: validatedFields.id },
      });

      if (validatedFields.goals && validatedFields.goals.length > 0) {
        await db.mesocycleTemplateGoal.createMany({
          data: validatedFields.goals.map((goal, index) => ({
            mesocycle_template_id: validatedFields.id!,
            goal_type: goal.goal_type,
            priority: goal.priority || index + 1,
          })),
        });
      }

      // Eliminamos el enfoque muscular anterior e insertamos el nuevo
      await db.mesocycleTemplateMuscleFocus.deleteMany({
        where: { mesocycle_template_id: validatedFields.id },
      });

      if (
        validatedFields.muscleFocus &&
        validatedFields.muscleFocus.length > 0
      ) {
        await db.mesocycleTemplateMuscleFocus.createMany({
          data: validatedFields.muscleFocus.map((focus) => ({
            mesocycle_template_id: validatedFields.id!,
            muscle_group_id: focus.muscle_group_id,
            focus_level: focus.focus_level,
          })),
        });
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
    try {
      // Las relaciones se eliminan en cascada desde el esquema de Prisma
      await db.mesocycleTemplate.delete({
        where: { id: templateId },
      });

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