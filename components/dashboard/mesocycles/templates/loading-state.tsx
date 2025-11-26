import React from "react";
import { TemplatePageHeader } from "./template-page-header";

export function LoadingState() {
  return (
    <div className="container py-6 space-y-6">
      <TemplatePageHeader />
      <div className="flex justify-center p-8">
        Cargando plantillas de mesociclos...
      </div>
    </div>
  );
}
