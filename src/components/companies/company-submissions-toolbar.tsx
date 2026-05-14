"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanySubmissionListParams, CompanySubmissionSortField } from "@/types/company-submission";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/types/company-submission";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: CompanySubmissionSortField; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
  { value: "submittedBy", label: "Submitted by" },
];

const statusLabels: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  closed: "Closed",
};

const PAGE_SIZES = [10, 20, 50] as const;

interface CompanySubmissionsToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  params: CompanySubmissionListParams;
  onParamsChange: (next: CompanySubmissionListParams) => void;
  onResetFilters: () => void;
  className?: string;
}

export function CompanySubmissionsToolbar({
  searchInput,
  onSearchChange,
  params,
  onParamsChange,
  onResetFilters,
  className,
}: CompanySubmissionsToolbarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, summaries, submitters…"
            className="rounded-lg border-zinc-800 bg-zinc-950/60 pl-9 ring-offset-zinc-950"
            aria-label="Search company submissions"
          />
        </div>
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 sm:self-auto" onClick={onResetFilters}>
          Reset filters
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Status</label>
          <Select value={params.status} onValueChange={(status) => onParamsChange({ ...params, status, page: 1 })}>
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {SUBMISSION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabels[s]}
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
              onParamsChange({ ...params, sortBy: sortBy as CompanySubmissionSortField, page: 1 })
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
            onValueChange={(sortDir) => onParamsChange({ ...params, sortDir: sortDir as "asc" | "desc", page: 1 })}
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
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500">Page size</label>
          <Select
            value={String(params.pageSize)}
            onValueChange={(v) =>
              onParamsChange({ ...params, pageSize: Number(v), page: 1 })
            }
          >
            <SelectTrigger className="rounded-lg border-zinc-800 bg-zinc-950/60">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
