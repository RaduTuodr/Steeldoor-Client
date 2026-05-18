"use client";

import { cn } from "@/lib/utils";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowBigUp, ChevronLeft, ChevronRight, FilePlus2, FileText, User, Star } from "lucide-react";
import {
  useCompanySubmissionsQuery,
  useCreateCompanySubmissionMutation,
  useToggleSubmissionVoteMutation,
} from "@/hooks/use-company-submissions-query";
import { useCreateInterviewRoundsMutation } from "@/hooks/use-interview-rounds-query";
import { defaultCompanySubmissionListParams } from "@/lib/default-company-submission-params";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanySubmissionsToolbar } from "@/components/companies/company-submissions-toolbar";
import { AddSubmissionDialog } from "@/components/companies/add-submission-dialog";
import { SubmissionRoundsDialog } from "@/components/companies/submission-rounds-dialog";
import { useAuth } from "@/contexts/auth-context";
import type { CompanySubmissionFormValues } from "@/lib/validation/company-submission";
import type { CompanySubmission } from "@/types/company-submission";

export function CompanySubmissionsPanel({
  companySlug,
  companyName,
}: {
  companySlug: string;
  companyName: string;
}) {
  const { user } = useAuth();
  const [params, setParams] = useState(defaultCompanySubmissionListParams);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);

  const queryParams = useMemo(
    () => ({ ...params, position: deferredSearch, userId: user?.id ?? null }),
    [params, deferredSearch, user?.id]
  );

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useCompanySubmissionsQuery(
    companySlug,
    queryParams
  );
  const createMutation = useCreateCompanySubmissionMutation(companySlug);
  const createRoundsMutation = useCreateInterviewRoundsMutation();
  const voteMutation = useToggleSubmissionVoteMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CompanySubmission | null>(null);

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
      const createdSubmission = await createMutation.mutateAsync({
        position: values.position.trim(),
        rating: values.rating,
        offerReceived: values.offerReceived,
        userId: values.userId ?? user?.id ?? "",
        createdAt: new Date().toISOString(),
      });

      const rounds = values.rounds
        .map((round, index) => ({
          submissionId: Number(createdSubmission.id),
          orderIndex: index + 1,
          roundType: round.roundType.trim(),
          title: round.title.trim(),
          description: round.description?.trim() || null,
          difficulty: round.difficulty ?? null,
          durationMinutes: round.durationMinutes ?? null,
        }))
        .filter((round) => round.roundType.length > 0 && round.title.length > 0);

      if (rounds.length > 0) {
        await createRoundsMutation.mutateAsync(rounds);
      }

      toast({
        title: rounds.length > 0 ? "Submission and rounds saved" : "Submission saved",
        description:
          rounds.length > 0
            ? `Your interview experience and ${rounds.length} round${rounds.length === 1 ? "" : "s"} have been shared.`
            : "Your interview experience has been shared.",
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

  const handleVote = async (submissionId: string) => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "You need to be signed in to vote on a submission.",
        variant: "destructive",
      });
      return;
    }

    try {
      await voteMutation.mutateAsync({ userId: user.id, submissionId });
    } catch (e) {
      toast({
        title: "Could not update vote",
        description: e instanceof Error ? e.message : "Check the network and try again.",
        variant: "destructive",
      });
    }
  };

  const showSkeleton = isPending && !isPlaceholderData;

  const handleOpenSubmission = (submission: CompanySubmission) => {
    setSelectedSubmission(submission);
  };

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
                  className="cursor-pointer rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-3 text-left transition-colors hover:border-zinc-700/90 hover:bg-zinc-950/70"
                  onClick={() => handleOpenSubmission(s)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleOpenSubmission(s);
                    }
                  }}
                  role="button"
                  tabIndex={0}
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
                                  i < s.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"
                                )} 
                              />
                            ))}
                         </div>
                         <span className="text-[10px] text-zinc-500 uppercase">Rating</span>
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
                    <Button
                      type="button"
                      variant={s.hasUpvoted ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("ml-auto h-7 gap-1.5 px-2 text-[11px]", s.hasUpvoted && "text-zinc-100")}
                      isLoading={voteMutation.isPending && voteMutation.variables?.submissionId === s.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleVote(s.id);
                      }}
                    >
                      <ArrowBigUp
                        className={cn("h-3.5 w-3.5", s.hasUpvoted && "fill-current")}
                        aria-hidden
                      />
                      {s.totalVotes}
                    </Button>
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
        isSaving={createMutation.isPending || createRoundsMutation.isPending}
      />
      <SubmissionRoundsDialog
        open={selectedSubmission !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubmission(null);
          }
        }}
        submission={selectedSubmission}
      />
    </>
  );
}
