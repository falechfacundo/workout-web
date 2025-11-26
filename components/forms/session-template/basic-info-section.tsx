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

const logger = createLogger("session-template-basic-info");

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
              <FormLabel>Nombre de la Sesión</FormLabel>
              <FormControl>
                <Input placeholder="Día de Pecho" {...field} />
              </FormControl>
              <FormDescription>
                Un nombre descriptivo para esta sesión
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración (minutos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={10}
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
                placeholder="Descripción detallada de esta plantilla de sesión..."
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
                Si está habilitado, otros usuarios podrán ver y usar esta sesión
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
