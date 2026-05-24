"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useCompaniesQuery } from "@/hooks/use-companies-query";
import { defaultCompanyListParams } from "@/lib/default-company-params";
import type { CompanyListParams } from "@/types/company";
import { getDistinctIndustries, getDistinctLocations } from "@/services/api/companies-api";
import { CompaniesToolbar, type CompaniesViewMode } from "@/components/companies/companies-toolbar";
import { CompanyCard } from "@/components/companies/company-card";
import { CompaniesTable } from "@/components/companies/companies-table";
import { CompaniesEmptyState } from "@/components/companies/companies-empty-state";
import { CompaniesSkeletonGrid } from "@/components/companies/companies-skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/components/i18n/i18n-provider";

export function CompaniesExplorer() {
  const { dictionary } = useI18n();
  const [params, setParams] = useState<CompanyListParams>(defaultCompanyListParams);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const queryParams = useMemo(
    () => ({ ...params, search: deferredSearch }),
    [params, deferredSearch]
  );

  const [viewMode, setViewMode] = useState<CompaniesViewMode>("grid");
  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useCompaniesQuery(queryParams);
  const { data: allCompanies } = useCompaniesQuery(defaultCompanyListParams);

  const list = Array.isArray(data) ? data.filter(Boolean) : [];
  const industries = useMemo(() => getDistinctIndustries(allCompanies ?? []), [allCompanies]);
  const locations = useMemo(() => getDistinctLocations(allCompanies ?? []), [allCompanies]);
  const showSkeleton = isPending && !isPlaceholderData;
  const isStaleSearch = deferredSearch !== searchInput;

  useEffect(() => {
    if (data) {
      console.log("Filtered Companies Result:", data);
    }
  }, [data]);

  const resetAll = () => {
    setParams(defaultCompanyListParams);
    setSearchInput("");
  };

  return (
    <div className="space-y-6">
      <CompaniesToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        params={params}
        onParamsChange={setParams}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={resetAll}
        industries={industries}
        locations={locations}
      />

      <Separator className="bg-zinc-800/80" />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
        <p>
          {showSkeleton ? (
            dictionary.companies.loadingDirectory
          ) : (
            <>
              <span className="font-medium text-zinc-300">{list.length}</span>{" "}
              {list.length === 1 ? dictionary.companies.companySingular : dictionary.companies.companyPlural}
              {isFetching ? <span className="ml-2 text-zinc-600">{dictionary.companies.updating}</span> : null}
              {isStaleSearch ? <span className="ml-2 text-zinc-600">{dictionary.companies.matching}</span> : null}
            </>
          )}
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-6 text-sm text-red-200">
          <p className="font-medium">{dictionary.companies.couldNotLoadCompanies}</p>
          <p className="mt-1 text-red-300/80">{error.message}</p>
          <Button variant="outline" className="mt-4 border-red-900/60 text-red-100" onClick={() => refetch()}>
            {dictionary.companies.retry}
          </Button>
        </div>
      ) : showSkeleton ? (
        <CompaniesSkeletonGrid />
      ) : list.length === 0 ? (
        <CompaniesEmptyState
          variant={
            queryParams.search ||
            params.industry !== "all" ||
            params.location !== "all" ||
            params.size !== "all"
              ? "no-results"
              : "empty"
          }
          onReset={resetAll}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((company) => (company?.id ? <CompanyCard key={company.id} company={company} /> : null))}
        </div>
      ) : (
        <CompaniesTable companies={list} />
      )}
    </div>
  );
}
