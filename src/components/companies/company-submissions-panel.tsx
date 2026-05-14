"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FilePlus2, FileText, User } from "lucide-react";
import {
  useCompanySubmissionsQuery,
  useCreateCompanySubmissionMutation,
} from "@/hooks/use-company-submissions-query";
import { defaultCompanySubmissionListParams } from "@/lib/default-company-submission-params";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanySubmissionsToolbar } from "@/components/companies/company-submissions-toolbar";
import { AddSubmissionDialog } from "@/components/companies/add-submission-dialog";
import type { CompanySubmissionFormValues } from "@/lib/validation/company-submission";
import type { SubmissionStatus } from "@/types/company-submission";

const statusLabels: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  closed: "Closed",
};

const statusBadgeVariant: Record<SubmissionStatus, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  submitted: "default",
  under_review: "outline",
  closed: "outline",
};

export function CompanySubmissionsPanel({
  companySlug,
  companyName,
}: {
  companySlug: string;
  companyName: string;
}) {
  const [params, setParams] = useState(defaultCompanySubmissionListParams);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const queryParams = useMemo(
    () => ({ ...params, search: deferredSearch }),
    [params, deferredSearch]
  );

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useCompanySubmissionsQuery(
    companySlug,
    queryParams
  );
  const createMutation = useCreateCompanySubmissionMutation(companySlug);

  const [dialogOpen, setDialogOpen] = useState(false);

  const submissions = data?.submissions ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? params.page;
  const pageSize = data?.pageSize ?? params.pageSize;

  const canPrev = page > 1;
  const canNext = total > page * pageSize;

  const resetAll = () => {
    setParams(defaultCompanySubmissionListParams);
    setSearchInput("");
  };

  const handleAdd = async (values: CompanySubmissionFormValues) => {
    try {
      await createMutation.mutateAsync({
        title: values.title.trim(),
        summary: values.summary.trim(),
        status: values.status,
      });
      toast({
        title: "Submission saved",
        description: "It will appear in this company's feed for everyone.",
        variant: "success",
      });
      setDialogOpen(false);
    } catch (e) {
      toast({
        title: "Could not create submission",
        description: e instanceof Error ? e.message : "Check the network and try again.",
        variant: "destructive",
      });
    }
  };

  const showSkeleton = isPending && !isPlaceholderData;

  return (
    <>
      <Separator className="bg-zinc-800/70" />
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Company submissions</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Everyone’s submissions for this company — filter and sort server-side like the company directory.
            </p>
          </div>
          <Button type="button" size="sm" className="shrink-0 gap-2" onClick={() => setDialogOpen(true)}>
            <FilePlus2 className="h-4 w-4" />
            Add submission
          </Button>
        </div>

        <CompanySubmissionsToolbar
          searchInput={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            setParams((p) => ({ ...p, page: 1 }));
          }}
          params={params}
          onParamsChange={setParams}
          onResetFilters={resetAll}
        />

        {isError ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-4 text-sm text-red-200">
            <p className="font-medium">Could not load submissions</p>
            <p className="mt-1 text-red-300/80">{error.message}</p>
            <Button variant="outline" size="sm" className="mt-3 border-red-900/60 text-red-100" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : showSkeleton ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-zinc-600" aria-hidden />
              <p className="mt-3 text-sm font-medium text-zinc-300">No submissions on this page</p>
              <p className="mt-1 text-xs text-zinc-500">
                {total === 0 && !queryParams.search && params.status === "all"
                  ? "No one has submitted anything for this company yet."
                  : "Try different filters, search terms, or another page."}
              </p>
            </div>
            {(canPrev || canNext) && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/70 pt-3 text-xs text-zinc-500">
                <p>
                  Page {page} — {submissions.length} on this page, {total} total
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={!canPrev || createMutation.isPending}
                    onClick={() => setParams((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={!canNext || createMutation.isPending}
                    onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <ul className="max-h-[min(360px,50vh)] space-y-2 overflow-y-auto pr-1">
              {submissions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-2.5 text-left transition-colors hover:border-zinc-700/90"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 text-sm font-medium text-zinc-100">{s.title}</p>
                    <Badge variant={statusBadgeVariant[s.status]} className="shrink-0 font-normal">
                      {statusLabels[s.status]}
                    </Badge>
                  </div>
                  {s.summary ? <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">{s.summary}</p> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1.5 text-zinc-400">
                      <User className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden />
                      <span className="truncate">{s.submittedByUsername}</span>
                    </span>
                    <span className="text-zinc-600" aria-hidden>
                      ·
                    </span>
                    <time dateTime={s.createdAt}>
                      {new Date(s.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
            {(canPrev || canNext) && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/70 pt-3 text-xs text-zinc-500">
                <p>
                  Page {page} — showing {submissions.length} on this page, {total} total
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={!canPrev || createMutation.isPending}
                    onClick={() => setParams((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={!canNext || createMutation.isPending}
                    onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {!canPrev && !canNext && total > 0 ? (
              <p className="text-center text-[11px] text-zinc-600">
                {total} submission{total === 1 ? "" : "s"}
              </p>
            ) : null}
          </>
        )}
      </div>

      <AddSubmissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAdd}
        companyName={companyName}
        isSaving={createMutation.isPending}
      />
    </>
  );
}
