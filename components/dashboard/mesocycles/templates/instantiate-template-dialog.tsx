"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("mesocycleTemplates");
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
        toast.error(error || t("errorCreate"));
        return;
      }

      toast.success(t("successCreate"));
      setOpen(false);
      router.push(`/dashboard/mesocycles/${data.id}`);
    } catch (err) {
      console.error("Error instantiating template:", err);
      toast.error(t("errorUnexpected"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarPlus className="mr-2 h-4 w-4" />
          {t("useTemplate")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createFromTemplateTitle")}</DialogTitle>
          <DialogDescription>
            {durationWeeks != null
              ? t("createFromTemplateDesc", { weeks: durationWeeks })
              : t("createFromTemplateDescUnknown")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="start-date">{t("startDate")}</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mesocycle-name">
              {t("nameLabel")} <span className="text-muted-foreground">{t("optional")}</span>
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
            {t("cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={creating || !startDate}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("createMesocycleButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
