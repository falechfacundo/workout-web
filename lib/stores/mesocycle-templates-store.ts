import { create } from "zustand";
import {
  getMesocycleTemplates,
  getMesocycleTemplate,
  createMesocycleTemplate,
  updateMesocycleTemplate,
  deleteMesocycleTemplate,
  MesocycleTemplateFormData,
} from "@/lib/actions/mesocycle-templates";
import { createLogger } from "@/lib/utils/logger";

import {
  MesocycleTemplateWithRelations,
} from "@/lib/schemas/mesocycle-template";

// Create a logger for this store
const logger = createLogger("mesocycle-templates-store");

// Interface for the store state
interface MesocycleTemplatesState {
  templates: MesocycleTemplateWithRelations[];
  userTemplates: MesocycleTemplateWithRelations[];
  defaultTemplates: MesocycleTemplateWithRelations[];
  publicTemplates: MesocycleTemplateWithRelations[];
  currentTemplate: MesocycleTemplateWithRelations | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTemplates: (userId: string) => Promise<void>;
  fetchTemplate: (id: string) => Promise<MesocycleTemplateWithRelations | null>;
  createTemplate: (
    template: MesocycleTemplateFormData
  ) => Promise<string | null>;
  updateTemplate: (template: MesocycleTemplateFormData) => Promise<boolean>;
  deleteTemplate: (id: string, userId: string) => Promise<boolean>;
  reset: () => void;
}

export const useMesocycleTemplatesStore = create<MesocycleTemplatesState>(
  (set, get) => ({
    templates: [],
    userTemplates: [],
    defaultTemplates: [],
    publicTemplates: [],
    currentTemplate: null,
    isLoading: false,
    error: null,
    fetchTemplates: async (userId: string) => {
      try {
        logger.debug("Fetching mesocycle templates", { userId });
        set({ isLoading: true, error: null });

        // Usamos la server action directamente
        const { data, error } = await getMesocycleTemplates(userId);

        if (error || !data) {
          logger.warn("Error fetching mesocycle templates", {
            userId,
            error: error || "No data returned",
          });
          throw new Error(error || "Error al cargar las plantillas");
        }

        logger.info("Mesocycle templates fetched successfully", {
          userId,
          userTemplatesCount: data.userTemplates?.length || 0,
          defaultTemplatesCount: data.defaultTemplates?.length || 0,
          totalCount: data.allTemplates?.length || 0,
        });

        set({
          templates: data.allTemplates,
          userTemplates: data.userTemplates,
          defaultTemplates: data.defaultTemplates,
          isLoading: false,
        });
      } catch (error: any) {
        logger.error(
          "Exception in fetchTemplates",
          error instanceof Error ? error : new Error(String(error)),
          { userId }
        );

        set({
          error:
            typeof error === "string"
              ? error
              : "Error al cargar las plantillas",
          isLoading: false,
        });
      }
    },

    fetchTemplate: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        // Usamos la server action directamente
        const { data, error } = await getMesocycleTemplate(id);

        if (error || !data) {
          throw new Error(error || "Error al cargar la plantilla");
        }

        set({
          currentTemplate: data,
          isLoading: false,
        });
        return data;
      } catch (error: any) {
        set({
          error:
            typeof error === "string" ? error : "Error al cargar la plantilla",
          isLoading: false,
        });
        return null;
      }
    },

    createTemplate: async (template: MesocycleTemplateFormData) => {
      try {
        set({ isLoading: true, error: null });

        // Usamos la server action directamente
        const { data, error } = await createMesocycleTemplate(template);

        if (error || !data) {
          throw new Error(error || "Error al crear la plantilla");
        }

        // Refrescamos las plantillas después de crear una nueva
        const userId = template.created_by;
        get().fetchTemplates(userId);

        return data;
      } catch (error: any) {
        set({
          error:
            typeof error === "string" ? error : "Error al crear la plantilla",
          isLoading: false,
        });
        return null;
      }
    },

    updateTemplate: async (template: MesocycleTemplateFormData) => {
      try {
        set({ isLoading: true, error: null });

        // Usamos la server action directamente
        const { error } = await updateMesocycleTemplate(template);

        if (error) {
          throw new Error(error);
        }

        // Refrescamos las plantillas después de actualizar
        const userId = template.created_by;
        get().fetchTemplates(userId);

        // Si la plantilla actual es la que se actualizó, actualizamos también el estado currentTemplate
        if (template.id && get().currentTemplate?.id === template.id) {
          get().fetchTemplate(template.id);
        }

        return true;
      } catch (error: any) {
        set({
          error:
            typeof error === "string"
              ? error
              : "Error al actualizar la plantilla",
          isLoading: false,
        });
        return false;
      }
    },

    deleteTemplate: async (id: string, userId: string) => {
      try {
        set({ isLoading: true, error: null });

        // Usamos la server action directamente
        const { error } = await deleteMesocycleTemplate(id);

        if (error) {
          throw new Error(error);
        }

        // Refrescamos las plantillas después de eliminar
        get().fetchTemplates(userId);

        // Si la plantilla actual es la que se eliminó, la reseteamos
        if (get().currentTemplate?.id === id) {
          get().reset();
        }

        return true;
      } catch (error: any) {
        set({
          error:
            typeof error === "string"
              ? error
              : "Error al eliminar la plantilla",
          isLoading: false,
        });
        return false;
      }
    },

    reset: () => {
      set({
        currentTemplate: null,
        error: null,
      });
    },
  })
);
