"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { HomeOverview } from "@/components/home/home-overview";
import { CompaniesExplorer } from "@/components/companies/companies-explorer";

export function HomeDashboard() {
  const searchParams = useSearchParams();

  const tab = useMemo(() => {
    const raw = searchParams.get("tab");
    return raw === "overview" ? "overview" : "companies";
  }, [searchParams]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      {tab === "overview" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Workspace</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Overview</h2>
          <p className="max-w-2xl text-sm text-zinc-500">
            High-level signals for your workspace. Swap these cards for live metrics from your Spring Boot
            services when you are ready.
          </p>
          <div className="mt-8">
            <HomeOverview />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Directory</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Companies</h2>
          <p className="max-w-2xl text-sm text-zinc-500">
            Search, filter, and sort a mock directory. The data layer is isolated so you can point it at{" "}
            <code className="rounded bg-zinc-900 px-1 py-0.5 text-xs text-zinc-300">GET /api/companies</code>{" "}
            without restructuring the UI.
          </p>
          <div className="mt-8">
            <CompaniesExplorer />
          </div>
        </div>
      )}
    </div>
  );
}
