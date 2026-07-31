import React from "react";
import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateCard } from "./template-card";
import { TemplateEmptyState } from "./template-empty-state";
import { MesocycleTemplateWithRelations } from "@/lib/schemas/mesocycle-template";

interface TemplateTabsProps {
  userTemplates: MesocycleTemplateWithRelations[];
}

export function TemplateTabs({ userTemplates }: TemplateTabsProps) {
  return (
    <Tabs defaultValue="my-templates" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="my-templates">
          <User className="h-4 w-4 mr-2" />
          Mis Plantillas
        </TabsTrigger>
        {/* <TabsTrigger value="public-templates">
          <Users className="h-4 w-4 mr-2" />
          Plantillas Públicas
        </TabsTrigger> */}
      </TabsList>

      <TabsContent value="my-templates" className="mt-6">
        {userTemplates.length === 0 ? (
          <TemplateEmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isUserTemplate={true}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* <TabsContent value="public-templates" className="mt-6">
        {publicTemplates.length === 0 ? (
          <div className="text-center p-12 border rounded-lg">
            <h3 className="text-lg font-medium">
              No hay plantillas públicas disponibles
            </h3>
            <p className="text-muted-foreground">
              Cuando otros usuarios compartan plantillas, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isUserTemplate={false}
              />
            ))}
          </div>
        )}
      </TabsContent> */}
    </Tabs>
  );
}
