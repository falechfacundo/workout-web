"use client";

import { useState, useEffect } from "react";
import { useMesocycleTemplatesStore } from "@/lib/stores/mesocycle-templates-store";
import { useRequireAuth } from "@/hooks/use-require-auth";

// Importamos los componentes desacoplados
import { TemplatePageHeader } from "@/components/dashboard/mesocycles/templates/template-page-header";
import { TemplateTabs } from "@/components/dashboard/mesocycles/templates/template-tabs";
import { DefaultTemplates } from "@/components/dashboard/mesocycles/templates/default-templates";
import { LoadingState } from "@/components/dashboard/mesocycles/templates/loading-state";

export default function MesocycleTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useRequireAuth();

  const {
    userTemplates,
    defaultTemplates,
    isLoading: templatesLoading,
    error: templatesError,
    fetchTemplates,
  } = useMesocycleTemplatesStore();

  // Cargar datos cuando el usuario está autenticado
  useEffect(() => {
    async function loadData() {
      if (authLoading || !user) return;

      setLoading(true);
      try {
        await fetchTemplates(user.id);
      } catch (err) {
        console.error("Error loading mesocycle templates:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, fetchTemplates]);

  if (authLoading || loading || templatesLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return null; // Will redirect in useRequireAuth
  }

  if (templatesError) {
    return (
      <div className="container py-6 space-y-6">
        <TemplatePageHeader />
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          Error al cargar las plantillas: {templatesError}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-10">
      <TemplatePageHeader />

      {/* Primero mostramos las plantillas del usuario y públicas usando las pestañas */}
      <TemplateTabs userTemplates={userTemplates} />

      {/* Luego mostramos las plantillas por defecto */}
      <DefaultTemplates defaultTemplates={defaultTemplates} />
    </div>
  );
}
