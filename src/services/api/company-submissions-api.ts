import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/auth";
import type { Company } from "@/types/company";
import type {
  CompanySubmission,
  CompanySubmissionListParams,
  CompanySubmissionListResult,
  CreateCompanySubmissionPayload,
  SubmissionVotePayload,
  SubmissionVoteResult,
} from "@/types/company-submission";

const SUBMISSION_API_BASE = "/api/submission";
const COMPANY_API_BASE = "/api/company";
const VOTE_API_BASE = "/api/vote";

function isRecord(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}

function readVoteCount(payload: Record<string, unknown>): number {
  return Number(
    payload.numberOfVotes ??
    payload.totalVotes ??
      payload.voteCount ??
      payload.votesCount ??
      payload.upvoteCount ??
      payload.upvotes ??
      payload.votes ??
      0
  );
}

function unwrapSubmissionPayload(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  return isRecord(payload.submission) ? payload.submission : payload;
}

function normalizeSubmission(payload: unknown): CompanySubmission | null {
  const submission = unwrapSubmissionPayload(payload);
  if (!submission) return null;
  const voteSource = isRecord(payload) ? payload : submission;
  const position =
    typeof submission.position === "string" && submission.position.trim().length > 0
      ? submission.position
      : "Unknown Position";

  return {
    id: String(submission.id),
    company: submission.company as Company,
    user: submission.user as User,
    position,
    searchVector: typeof submission.searchVector === "string" ? submission.searchVector : undefined,
    offerReceived: Boolean(submission.offerReceived),
    rating: Number(submission.rating ?? submission.overallDifficulty ?? 0),
    totalVotes: readVoteCount(voteSource),
    hasUpvoted: Boolean(voteSource.hasUpvoted),
    createdAt: String(submission.createdAt ?? new Date().toISOString()),
  };
}

function unwrapListPayload(payload: unknown): CompanySubmissionListResult {
  if (!payload) {
    return { submissions: [], total: 0, page: 1, pageSize: 20 };
  }

  if (isRecord(payload) && payload.success && payload.data) {
    return unwrapListPayload(payload.data);
  }

  const content = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.content)
      ? payload.content
      : [];
  const pageInfo = isRecord(payload) && isRecord(payload.page) ? payload.page : payload;
  const total = isRecord(pageInfo) ? Number(pageInfo.totalElements ?? content.length) : content.length;
  const page = isRecord(pageInfo) ? Number(pageInfo.number ?? 0) + 1 : 1;
  const pageSize = isRecord(pageInfo) ? Number(pageInfo.size ?? 20) : 20;

  return {
    submissions: content
      .map(normalizeSubmission)
      .filter((submission): submission is CompanySubmission => submission !== null),
    total,
    page,
    pageSize,
  };
}

function unwrapSingleSubmission(payload: unknown): CompanySubmission | null {
  if (!payload) return null;
  const data = isRecord(payload) && payload.success ? payload.data : payload;
  return normalizeSubmission(data);
}

function matchesCreatedSubmission(
  submission: CompanySubmission,
  payload: CreateCompanySubmissionPayload
): boolean {
  const normalizedPosition = payload.position.trim().toLowerCase();
  const createdAtMs = new Date(payload.createdAt).getTime();
  const submissionCreatedAtMs = new Date(submission.createdAt).getTime();

  return (
    submission.user?.id === payload.userId &&
    submission.position.trim().toLowerCase() === normalizedPosition &&
    submission.offerReceived === payload.offerReceived &&
    submission.rating === payload.rating &&
    Number.isFinite(createdAtMs) &&
    Number.isFinite(submissionCreatedAtMs) &&
    Math.abs(submissionCreatedAtMs - createdAtMs) < 60_000
  );
}

export async function fetchCompanySubmissionsFilter(
  companySlug: string,
  params: CompanySubmissionListParams
): Promise<CompanySubmissionListResult> {
  const { data } = await apiClient.post(
    `${COMPANY_API_BASE}/${encodeURIComponent(companySlug)}/submissions/filter`,
    {
      query: params.query?.trim() || null,
      position: params.position?.trim() || null,
      offerReceived: params.offerReceived,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      page: Math.max(0, params.page - 1),
      pageSize: params.pageSize,
      userId: params.userId ? Number(params.userId) : null,
    }
  );
  return unwrapListPayload(data);
}

export async function fetchUserSubmissions(userId: string): Promise<CompanySubmissionListResult> {
  const { data } = await apiClient.get(`${SUBMISSION_API_BASE}/${encodeURIComponent(userId)}`);
  return unwrapListPayload(data);
}

export async function createCompanySubmission(
  companySlug: string,
  payload: CreateCompanySubmissionPayload
): Promise<CompanySubmission> {
  const payloadData = {
    userId: payload.userId,
    position: payload.position.trim(),
    rating: payload.rating,
    offerReceived: payload.offerReceived,
    createdAt: payload.createdAt,
  };

  try {
    const { data } = await apiClient.post<CompanySubmission | ApiResponse<CompanySubmission>>(
      `${COMPANY_API_BASE}/${encodeURIComponent(companySlug)}/submissions`,
      payloadData
    );

    const created = unwrapSingleSubmission(data);
    if (!created) {
      throw new Error("Server returned an empty submission payload.");
    }

    return created;
  } catch (error) {
    const fallback = await fetchUserSubmissions(payload.userId);
    const created = fallback.submissions.find((submission) =>
      matchesCreatedSubmission(submission, payload)
    );

    if (created) {
      return created;
    }

    throw error;
  }
}

function unwrapVotePayload(payload: unknown): SubmissionVoteResult {
  const data = isRecord(payload) && payload.success ? payload.data : payload;

  if (!isRecord(data)) {
    return {
      totalVotes: 0,
      hasUpvoted: false,
    };
  }

  return {
    totalVotes: readVoteCount(data),
    hasUpvoted: Boolean(data.hasUpvoted),
  };
}

export async function toggleSubmissionVote(
  payload: SubmissionVotePayload
): Promise<SubmissionVoteResult> {
  const { data } = await apiClient.post(
    `${VOTE_API_BASE}/${encodeURIComponent(payload.userId)}/${encodeURIComponent(payload.submissionId)}`
  );

  return unwrapVotePayload(data);
}
