"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompanySubmission,
  fetchCompanySubmissionsFilter,
} from "@/services/api/company-submissions-api";
import type {
  CompanySubmissionListParams,
  CreateCompanySubmissionPayload,
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
