"use client";

import { cn } from "@/lib/utils";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowBigUp, Star, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useToggleSubmissionVoteMutation } from "@/hooks/use-company-submissions-query";
import { fetchUserSubmissions } from "@/services/api/company-submissions-api";
import type { CompanySubmissionListResult } from "@/types/company-submission";

export function HomeOverview() {
  const { user } = useAuth();
  const voteMutation = useToggleSubmissionVoteMutation();

  const { data, isPending: isLoading } = useQuery<CompanySubmissionListResult>({
    queryKey: ["user-submissions", user?.id],
    queryFn: () => fetchUserSubmissions(user!.id),
    enabled: Boolean(user),
    staleTime: 60_000,
    placeholderData: { submissions: [], total: 0, page: 1, pageSize: 20 },
  });

  const reviews = useMemo(() => data?.submissions ?? [], [data]);
  const reviewCount = reviews.length;
  const showSkeleton = isLoading && reviewCount === 0;
  const recentReviews = reviews.slice(0, 3);

  const handleVote = async (submissionId: string) => {
    if (!user?.id) return;
    await voteMutation.mutateAsync({ userId: user.id, submissionId });
  };

  return (
    <div className="space-y-6">

      <Card className="border-zinc-800/80 bg-zinc-900/35">
        <CardHeader className="flex flex-wrap items-start justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base text-zinc-100">Your review activity</CardTitle>
            <p className="mt-1 text-sm text-zinc-400">A quick view of reviews you&apos;ve submitted across companies.</p>
          </div>
          <Badge variant="outline" className="font-normal text-zinc-300">
            {user ? `${reviewCount} submitted` : "Not signed in"}
          </Badge>
        </CardHeader>
        <CardContent>
          {user ? (
            showSkeleton && reviews.length === 0 ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 px-6 py-8 text-center text-sm text-zinc-400">
                <User className="mx-auto h-8 w-8 text-zinc-500" />
                <p className="mt-3 font-medium text-zinc-100">No reviews found</p>
                <p className="mt-1">Submit a review from a company page to see it here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentReviews.map((review) => (
                  <li key={review.id} className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{review.company.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">{review.position}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs uppercase tracking-[0.18em]">
                        {review.offerReceived ? "Offer" : "No offer"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
                        {review.user?.username || "You"}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-3 w-3", 
                                i < review.overallDifficulty ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Difficulty</span>
                      </div>
                      <time className="text-zinc-500" dateTime={review.createdAt}>
                        {new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </time>
                      <Button
                        type="button"
                        variant={review.hasUpvoted ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "ml-auto h-7 gap-1.5 px-2 text-[11px]",
                          review.hasUpvoted && "text-zinc-100"
                        )}
                        isLoading={voteMutation.isPending && voteMutation.variables?.submissionId === review.id}
                        onClick={() => handleVote(review.id)}
                      >
                        <ArrowBigUp
                          className={cn("h-3.5 w-3.5", review.hasUpvoted && "fill-current")}
                          aria-hidden
                        />
                        {review.totalVotes}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 px-6 py-8 text-center text-sm text-zinc-400">
              <User className="mx-auto h-8 w-8 text-zinc-500" />
              <p className="mt-3 font-medium text-zinc-100">Sign in to see your review history</p>
              <p className="mt-1">Your saved company review activity appears here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
