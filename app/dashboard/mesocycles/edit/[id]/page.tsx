import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MesocycleForm } from "@/components/forms/mesocycle/mesocycle-form";
import { getMesocycle } from "@/lib/actions/mesocycles";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditMesocyclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMesocyclePage({
  params,
}: EditMesocyclePageProps) {
  const { id } = await params;
  const { data: mesocycle, error } = await getMesocycle(id);

  if (error || !mesocycle) {
    return notFound();
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/mesocycles">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Mesocycle
            </h1>
            <p className="text-muted-foreground">
              Update your training program.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <MesocycleForm
            initialData={{
              ...mesocycle,
              focus_muscle_groups: Array.isArray(mesocycle.focus_muscle_groups)
                ? mesocycle.focus_muscle_groups.map((f: any) =>
                    typeof f === "string" ? f : f.muscle_group_id
                  )
                : [],
            }}
            userId={mesocycle.user_id}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
