import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MesocycleCardProps {
  mesocycle: {
    id: string;
    name: string;
    description?: string | null;
    start_date: string;
    end_date: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  };
}

export function MesocycleCard({ mesocycle }: MesocycleCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{mesocycle.name}</CardTitle>
            <CardDescription>{mesocycle.description || "No description"}</CardDescription>
          </div>
          <Badge
            variant={
              mesocycle.status === "in_progress" ? "default" : "outline"
            }
          >
            {mesocycle.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-sm font-medium">Start Date</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(mesocycle.start_date), "MMM d, yyyy", {
                  locale: es,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">End Date</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(mesocycle.end_date), "MMM d, yyyy", {
                  locale: es,
                })}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-sm text-muted-foreground">
                {mesocycle.status}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Description</div>
              <div className="text-sm text-muted-foreground">
                {mesocycle.description || "No description"}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/mesocycles/edit/${mesocycle.id}`}>
                Edit
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/dashboard/mesocycles/${mesocycle.id}`}>
                View
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
