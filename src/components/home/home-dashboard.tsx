"use client";

import { HomeOverview } from "@/components/home/home-overview";
import { CompaniesExplorer } from "@/components/companies/companies-explorer";
import { useI18n } from "@/components/i18n/i18n-provider";

type HomeTab = "overview" | "companies";

export function HomeDashboard({ initialTab }: { initialTab: HomeTab }) {
  const tab = initialTab;
  const { dictionary } = useI18n();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      {tab === "overview" ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">{dictionary.home.workspace}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">{dictionary.home.overviewTitle}</h2>
          <div className="mt-8">
            <HomeOverview />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">{dictionary.home.directory}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">{dictionary.home.companiesTitle}</h2>
          <p className="max-w-2xl text-sm text-zinc-500">{dictionary.home.companiesDescription}</p>
          <div className="mt-8">
            <CompaniesExplorer />
          </div>
        </div>
      )}
    </div>
  );
}
