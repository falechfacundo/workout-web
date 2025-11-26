"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger("template-basic-info-section");

export function BasicInfoSection() {
  const form = useFormContext();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Plantilla</FormLabel>
              <FormControl>
                <Input placeholder="Mi Plantilla de Mesociclo" {...field} />
              </FormControl>
              <FormDescription>
                Un nombre descriptivo para esta plantilla
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration_weeks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración (semanas)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    logger.debug("Duration changed", { value });
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descripción detallada de esta plantilla de mesociclo..."
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_public"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Plantilla Pública</FormLabel>
              <FormDescription>
                Si está habilitado, otros usuarios podrán ver y usar esta
                plantilla
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  logger.debug("Public status changed", { isPublic: checked });
                  field.onChange(checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
