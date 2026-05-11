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
import { MOCK_COMPANIES } from "@/data/mock-companies";
import type { CompanyListParams, CompanySortField } from "@/types/company";
import { formatCompanySize } from "@/lib/company-display";
import type { CompanySize } from "@/types/company";
import { cn } from "@/lib/utils";

const SIZES: CompanySize[] = ["STARTUP", "SMB", "MID_MARKET", "ENTERPRISE"];

const SORT_OPTIONS: { value: CompanySortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "industry", label: "Industry" },
  { value: "location", label: "Location" },
  { value: "size", label: "Company size" },
];

function distinctSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

export type CompaniesViewMode = "grid" | "table";

interface CompaniesToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  params: CompanyListParams;
  onParamsChange: (next: CompanyListParams) => void;
  viewMode: CompaniesViewMode;
  onViewModeChange: (mode: CompaniesViewMode) => void;
  onResetFilters: () => void;
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
  className,
}: CompaniesToolbarProps) {
  const industries = useMemo(() => distinctSorted(MOCK_COMPANIES.map((c) => c.industry)), []);
  const locations = useMemo(() => distinctSorted(MOCK_COMPANIES.map((c) => c.location)), []);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search companies, industries, tags…"
            className="rounded-lg border-zinc-800 bg-zinc-950/60 pl-9 ring-offset-zinc-950"
            aria-label="Search companies"
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
              Grid
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              className="h-8 gap-1.5 px-2.5"
              onClick={() => onViewModeChange("table")}
            >
              <Table2 className="h-4 w-4" />
              Table
            </Button>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8" onClick={onResetFilters}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Industry</label>
          <Select
            value={params.industry}
            onValueChange={(industry) => onParamsChange({ ...params, industry })}
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Location</label>
          <Select
            value={params.location}
            onValueChange={(location) => onParamsChange({ ...params, location })}
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Size</label>
          <Select value={params.size} onValueChange={(size) => onParamsChange({ ...params, size })}>
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sizes</SelectItem>
              {SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatCompanySize(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Sort by</label>
          <Select
            value={params.sortBy}
            onValueChange={(sortBy) =>
              onParamsChange({ ...params, sortBy: sortBy as CompanySortField })
            }
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Direction</label>
          <Select
            value={params.sortDir}
            onValueChange={(sortDir) => onParamsChange({ ...params, sortDir: sortDir as "asc" | "desc" })}
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
