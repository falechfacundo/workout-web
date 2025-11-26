import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MuscleGroupSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-[100px]" />
      </CardContent>
    </Card>
  );
}
