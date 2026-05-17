import { apiClient } from "@/services/api/client";
import type { InterviewRound } from "@/types/interview-round";

function isRecord(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}

function normalizeInterviewRound(payload: unknown): InterviewRound | null {
  if (!isRecord(payload)) return null;

  const id = Number(payload.id);
  const submissionId = Number(payload.submissionId);
  const orderIndex = Number(payload.orderIndex);

  if (!Number.isFinite(id) || !Number.isFinite(submissionId) || !Number.isFinite(orderIndex)) {
    return null;
  }

  return {
    id,
    submissionId,
    roundType: typeof payload.roundType === "string" ? payload.roundType : "Unknown",
    title: typeof payload.title === "string" && payload.title.trim().length > 0 ? payload.title : "Untitled round",
    description: typeof payload.description === "string" && payload.description.trim().length > 0 ? payload.description : null,
    difficulty: Number.isFinite(Number(payload.difficulty)) ? Number(payload.difficulty) : null,
    durationMinutes: Number.isFinite(Number(payload.durationMinutes)) ? Number(payload.durationMinutes) : null,
    orderIndex,
  };
}

export async function fetchInterviewRoundsBySubmissionId(submissionId: string | number): Promise<InterviewRound[]> {
  const { data } = await apiClient.get("/api/round", {
    params: {
      submissionId: Number(submissionId),
    },
  });

  const payload = isRecord(data) && data.success ? data.data : data;
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(normalizeInterviewRound)
    .filter((round): round is InterviewRound => round !== null)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}
