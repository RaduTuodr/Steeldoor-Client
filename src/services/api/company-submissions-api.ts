import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CompanySubmission,
  CompanySubmissionListParams,
  CompanySubmissionListResult,
  CreateCompanySubmissionPayload,
} from "@/types/company-submission";

function normalizeSubmission(payload: any): CompanySubmission | null {
  if (!payload || typeof payload !== "object") return null;

  return {
    id: String(payload.id),
    company: payload.company,
    user: payload.user,
    position: payload.position || "Unknown Position",
    offerReceived: Boolean(payload.offerReceived),
    overallDifficulty: Number(payload.overallDifficulty || 0),
    createdAt: payload.createdAt || new Date().toISOString(),
  };
}

function unwrapListPayload(payload: any): CompanySubmissionListResult {
  if (!payload) {
    return { submissions: [], total: 0, page: 1, pageSize: 20 };
  }

  if (payload.success && payload.data) {
    return unwrapListPayload(payload.data);
  }

  const content = payload.content || (Array.isArray(payload) ? payload : []);
  const total = payload.totalElements ?? content.length;
  const page = (payload.number ?? 0) + 1;
  const pageSize = payload.size ?? 20;

  return {
    submissions: content.map(normalizeSubmission).filter(Boolean),
    total,
    page,
    pageSize,
  };
}

function unwrapSingleSubmission(payload: any): CompanySubmission | null {
  if (!payload) return null;
  const data = payload.success ? payload.data : payload;
  return normalizeSubmission(data);
}

export async function fetchCompanySubmissionsFilter(
  companySlug: string,
  params: CompanySubmissionListParams
): Promise<CompanySubmissionListResult> {
  const { data } = await apiClient.post(
    `/api/company/${encodeURIComponent(companySlug)}/submissions/filter`,
    {
      position: params.position?.trim() || null,
      offerReceived: params.offerReceived,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      page: Math.max(0, params.page - 1),
      pageSize: params.pageSize,
    }
  );
  return unwrapListPayload(data);
}

export async function createCompanySubmission(
  companySlug: string,
  payload: CreateCompanySubmissionPayload
): Promise<CompanySubmission> {
  const { data } = await apiClient.post<CompanySubmission | ApiResponse<CompanySubmission>>(
    `/api/company/${encodeURIComponent(companySlug)}/submissions`,
    {
      userId: payload.userId,
      position: payload.position.trim(),
      overallDifficulty: payload.overallDifficulty,
      offerReceived: payload.offerReceived,
      createdAt: payload.createdAt,
    }
  );

  const created = unwrapSingleSubmission(data);
  if (!created) {
    throw new Error("Server returned an empty submission payload.");
  }
  return created;
}