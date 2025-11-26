import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplatePageHeaderProps {
  title?: string;
}

export function TemplatePageHeader({
  title = "Plantillas de Mesociclos",
}: TemplatePageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Button asChild>
        <Link href="/dashboard/mesocycles/templates/new">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Link>
      </Button>
    </div>
  );
}
