"use client";

import { HomeOverview } from "@/components/home/home-overview";
import { CompaniesExplorer } from "@/components/companies/companies-explorer";

type HomeTab = "overview" | "companies";

export function HomeDashboard({ initialTab }: { initialTab: HomeTab }) {
  const tab = initialTab;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      {tab === "overview" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Workspace</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Overview</h2>
          <div className="mt-8">
            <HomeOverview />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Directory</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Companies</h2>
          <p className="max-w-2xl text-sm text-zinc-500">
            Discover what an employer is really like before you make your next move. <br/>
            Search <b>reviews</b> and <b>ratings</b>, and filter companies based on the qualities that matter most to your job search.{" "}
          </p>
          <div className="mt-8">
            <CompaniesExplorer />
          </div>
        </div>
      )}
    </div>
  );
}
