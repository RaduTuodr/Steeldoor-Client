"use client";

import { cn } from "@/lib/utils";

import { useDeferredValue, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FilePlus2, FileText, User, Star } from "lucide-react";
import {
  useCompanySubmissionsQuery,
  useCreateCompanySubmissionMutation,
} from "@/hooks/use-company-submissions-query";
import { defaultCompanySubmissionListParams } from "@/lib/default-company-submission-params";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanySubmissionsToolbar } from "@/components/companies/company-submissions-toolbar";
import { AddSubmissionDialog } from "@/components/companies/add-submission-dialog";
import type { CompanySubmissionFormValues } from "@/lib/validation/company-submission";

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
    () => ({ ...params, position: deferredSearch }),
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
        position: values.position.trim(),
        overallDifficulty: values.overallDifficulty,
        offerReceived: values.offerReceived,
        userId: values.userId, 
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Submission saved",
        description: "Your interview experience has been shared.",
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
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Interview Feed</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Community submissions regarding interview positions and outcomes for {companyName}.
            </p>
          </div>
          <Button type="button" size="sm" className="shrink-0 gap-2" onClick={() => setDialogOpen(true)}>
            <FilePlus2 className="h-4 w-4" />
            Add experience
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
            <p className="font-medium">Could not load feed</p>
            <p className="mt-1 text-red-300/80">{error.message}</p>
            <Button variant="outline" size="sm" className="mt-3 border-red-900/60 text-red-100" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : showSkeleton ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-300">No results found</p>
            <p className="mt-1 text-xs text-zinc-500">Try adjusting your filters or position search.</p>
          </div>
        ) : (
          <>
            <ul className="max-h-[min(450px,60vh)] space-y-2 overflow-y-auto pr-1">
              {submissions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-3 text-left transition-colors hover:border-zinc-700/90"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-100">{s.position}</p>
                      <div className="flex items-center gap-2">
                         <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "h-3 w-3", 
                                  i < s.overallDifficulty ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"
                                )} 
                              />
                            ))}
                         </div>
                         <span className="text-[10px] text-zinc-500 uppercase">Difficulty</span>
                      </div>
                    </div>
                    <Badge 
                      variant={s.offerReceived ? "default" : "secondary"} 
                      className="shrink-0 font-normal"
                    >
                      {s.offerReceived ? "Offer Received" : "No Offer"}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1.5 text-zinc-400">
                      <User className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate">{s.user?.username || "Anonymous"}</span>
                    </span>
                    <span className="text-zinc-600">·</span>
                    <time dateTime={s.createdAt}>
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium"
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/70 pt-3 text-xs text-zinc-500">
              <p>Page {page} — {submissions.length} results, {total} total</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={!canPrev}
                  onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={!canNext}
                  onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
