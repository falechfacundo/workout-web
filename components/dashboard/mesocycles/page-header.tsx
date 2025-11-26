import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export function PageHeader() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mesocycles</h1>
        <p className="text-muted-foreground">
          Plan and manage your training programs over time.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard/mesocycles/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Mesocycle
        </Link>
      </Button>
    </div>
  );
}
