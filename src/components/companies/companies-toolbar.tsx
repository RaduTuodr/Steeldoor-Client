"use client";

import { useMemo } from "react";
import { LayoutGrid, Search, Table2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanyListParams, CompanySortField } from "@/types/company";
import { formatCompanySize } from "@/lib/company-display";
import type { CompanySize } from "@/types/company";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/i18n-provider";

const SIZES: CompanySize[] = ["STARTUP", "SMB", "MID_MARKET", "ENTERPRISE"];

export type CompaniesViewMode = "grid" | "table";

interface CompaniesToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  params: CompanyListParams;
  onParamsChange: (next: CompanyListParams) => void;
  viewMode: CompaniesViewMode;
  onViewModeChange: (mode: CompaniesViewMode) => void;
  onResetFilters: () => void;
  industries: string[];
  locations: string[];
  className?: string;
}

export function CompaniesToolbar({
  searchInput,
  onSearchChange,
  params,
  onParamsChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  industries,
  locations,
  className,
}: CompaniesToolbarProps) {
  const uniqueIndustries = useMemo(() => Array.from(new Set(industries)), [industries]);
  const uniqueLocations = useMemo(() => Array.from(new Set(locations)), [locations]);
  const { dictionary } = useI18n();

  const sortOptions: { value: CompanySortField; label: string }[] = [
    { value: "name", label: dictionary.companies.sortName },
    { value: "industry", label: dictionary.companies.sortIndustry },
    { value: "location", label: dictionary.companies.sortLocation },
    { value: "size", label: dictionary.companies.sortSize },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={dictionary.companies.searchPlaceholder}
            className="rounded-lg border-zinc-800 bg-zinc-950/60 pl-9 ring-offset-zinc-950"
            aria-label={dictionary.companies.searchAria}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              className="h-8 gap-1.5 px-2.5"
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              {dictionary.companies.grid}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              className="h-8 gap-1.5 px-2.5"
              onClick={() => onViewModeChange("table")}
            >
              <Table2 className="h-4 w-4" />
              {dictionary.companies.table}
            </Button>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8" onClick={onResetFilters}>
            {dictionary.companies.reset}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">{dictionary.companies.industry}</label>
          <Select
            value={params.industry}
            onValueChange={(industry) => onParamsChange({ ...params, industry })}
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder={dictionary.companies.industry} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dictionary.companies.allIndustries}</SelectItem>
              {uniqueIndustries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">{dictionary.companies.location}</label>
          <Select
            value={params.location}
            onValueChange={(location) => onParamsChange({ ...params, location })}
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder={dictionary.companies.location} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dictionary.companies.allLocations}</SelectItem>
              {uniqueLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">{dictionary.companies.size}</label>
          <Select value={params.size} onValueChange={(size) => onParamsChange({ ...params, size })}>
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder={dictionary.companies.size} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{dictionary.companies.allSizes}</SelectItem>
              {SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {formatCompanySize(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">{dictionary.companies.sortBy}</label>
          <Select
            value={params.sortBy}
            onValueChange={(sortBy) => onParamsChange({ ...params, sortBy: sortBy as CompanySortField })}
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder={dictionary.companies.sortBy} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">{dictionary.companies.direction}</label>
          <Select
            value={params.sortDir}
            onValueChange={(sortDir) => onParamsChange({ ...params, sortDir: sortDir as "asc" | "desc" })}
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder={dictionary.companies.direction} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{dictionary.companies.ascending}</SelectItem>
              <SelectItem value="desc">{dictionary.companies.descending}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
