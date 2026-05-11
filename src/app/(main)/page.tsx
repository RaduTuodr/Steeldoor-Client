import { Suspense } from "react";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

function HomeDashboardFallback() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeDashboardFallback />}>
      <HomeDashboard />
    </Suspense>
  );
}
