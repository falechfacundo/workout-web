"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { instantiateMesocycleFromTemplate } from "@/lib/actions/mesocycles";

interface InstantiateTemplateDialogProps {
  templateId: string;
  templateName: string;
  durationWeeks?: number;
}

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
}

export function InstantiateTemplateDialog({
  templateId,
  templateName,
  durationWeeks,
}: InstantiateTemplateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(todayISO());
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const { data, error } = await instantiateMesocycleFromTemplate(
        templateId,
        startDate,
        name || undefined
      );

      if (error || !data) {
        toast.error(error || "No se pudo crear el mesociclo");
        return;
      }

      toast.success("Mesociclo creado desde la plantilla");
      setOpen(false);
      router.push(`/dashboard/mesocycles/${data.id}`);
    } catch (err) {
      console.error("Error instantiating template:", err);
      toast.error("Error inesperado al crear el mesociclo");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Usar Plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear mesociclo desde plantilla</DialogTitle>
          <DialogDescription>
            Se generará un mesociclo de {durationWeeks ?? "—"} semana
            {(durationWeeks ?? 0) === 1 ? "" : "s"} con sus sesiones y ejercicios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="start-date">Fecha de inicio</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mesocycle-name">
              Nombre <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="mesocycle-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={templateName}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={creating}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating || !startDate}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Mesociclo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
