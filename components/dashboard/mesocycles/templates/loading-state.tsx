import React from "react";
import { TemplatePageHeader } from "./template-page-header";
import { CardGridSkeleton } from "@/components/ui/data-skeletons";

export function LoadingState() {
  return (
    <div className="container py-6 space-y-10">
      <TemplatePageHeader />
      <CardGridSkeleton />
    </div>
  );
}
