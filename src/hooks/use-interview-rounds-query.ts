"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInterviewRoundsBySubmissionId } from "@/services/api/interview-rounds-api";

export function useInterviewRoundsQuery(submissionId: string | null, open: boolean) {
  return useQuery({
    queryKey: ["interview-rounds", submissionId],
    queryFn: () => fetchInterviewRoundsBySubmissionId(submissionId!),
    enabled: open && submissionId !== null,
    staleTime: 30_000,
  });
}
