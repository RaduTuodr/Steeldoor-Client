"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompanySubmission,
  fetchCompanySubmissionsFilter,
  toggleSubmissionVote,
} from "@/services/api/company-submissions-api";
import type {
  CompanySubmission,
  CompanySubmissionListResult,
  CompanySubmissionListParams,
  CreateCompanySubmissionPayload,
  SubmissionVotePayload,
  SubmissionVoteResult,
} from "@/types/company-submission";

export const companySubmissionsQueryKey = (slug: string, params: CompanySubmissionListParams) =>
  ["company-submissions", slug, params] as const;

export function useCompanySubmissionsQuery(companySlug: string, params: CompanySubmissionListParams) {
  return useQuery({
    queryKey: companySubmissionsQueryKey(companySlug, params),
    queryFn: () => fetchCompanySubmissionsFilter(companySlug, params),
    enabled: companySlug.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateCompanySubmissionMutation(companySlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompanySubmissionPayload) => createCompanySubmission(companySlug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-submissions", companySlug] });
    },
  });
}

function updateSubmissionVoteInList(
  result: CompanySubmissionListResult | undefined,
  submissionId: string,
  vote: SubmissionVoteResult
) {
  if (!result) return result;

  let changed = false;
  const submissions = result.submissions.map((submission: CompanySubmission) => {
    if (submission.id !== submissionId) {
      return submission;
    }

    changed = true;
    return {
      ...submission,
      totalVotes: vote.totalVotes,
      hasUpvoted: vote.hasUpvoted,
    };
  });

  return changed ? { ...result, submissions } : result;
}

export function useToggleSubmissionVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmissionVotePayload) => toggleSubmissionVote(payload),
    onSuccess: (vote, variables) => {
      queryClient.setQueriesData<CompanySubmissionListResult>(
        { queryKey: ["company-submissions"] },
        (current) => updateSubmissionVoteInList(current, variables.submissionId, vote)
      );

      queryClient.setQueriesData<CompanySubmissionListResult>(
        { queryKey: ["user-submissions"] },
        (current) => updateSubmissionVoteInList(current, variables.submissionId, vote)
      );
    },
  });
}
