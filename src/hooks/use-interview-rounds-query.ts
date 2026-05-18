"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInterviewRoundsBySubmissionId, updateInterviewRoundOrderIndex } from "@/services/api/interview-rounds-api";
import type { InterviewRound } from "@/types/interview-round";

export function useInterviewRoundsQuery(submissionId: string | null, open: boolean) {
  return useQuery({
    queryKey: ["interview-rounds", submissionId],
    queryFn: () => fetchInterviewRoundsBySubmissionId(submissionId!),
    enabled: open && submissionId !== null,
    staleTime: 30_000,
  });
}

interface UpdateInterviewRoundsOrderPayload {
  submissionId: string;
  rounds: InterviewRound[];
}

export function useInterviewRoundsUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rounds }: UpdateInterviewRoundsOrderPayload) => {
      const updatedRounds = await Promise.all(
        rounds.map((round) => updateInterviewRoundOrderIndex(round.id, round.orderIndex))
      );

      return updatedRounds.filter((round): round is InterviewRound => round !== null);
    },
    onSuccess: (updatedRounds, variables) => {
      queryClient.setQueryData<InterviewRound[]>(
        ["interview-rounds", variables.submissionId],
        updatedRounds.sort((a, b) => a.orderIndex - b.orderIndex)
      );

      queryClient.invalidateQueries({ queryKey: ["interview-rounds", variables.submissionId] });
    },
  });
}
