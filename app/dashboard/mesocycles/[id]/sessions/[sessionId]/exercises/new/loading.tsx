import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "@/components/ui/data-skeletons";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <div className="mx-auto w-full max-w-2xl">
          <ChartSkeleton height={480} />
        </div>
      </div>
    </DashboardLayout>
  );
}