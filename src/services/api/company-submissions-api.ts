/**
 * Company submissions API — contract for Spring Boot (or similar) backend.
 *
 * ## List / filter (all users’ submissions for one company)
 * `POST /api/company/{slug}/submissions/filter`
 *
 * Request body (JSON):
 * ```json
 * {
 *   "query": "string | null",
 *   "status": "draft" | "submitted" | "under_review" | "closed" | null,
 *   "sortBy": "createdAt" | "title" | "status" | "submittedBy",
 *   "sortDir": "asc" | "desc",
 *   "page": 1,
 *   "pageSize": 20
 * }
 * ```
 * - `query`: free-text search across title, summary, submitter username (backend defines scope).
 * - `status`: omit or `null` when filtering by “all”.
 *
 * Response (choose one shape; client unwraps all):
 * - `CompanySubmission[]` — flat list (no pagination metadata; client uses length as `total`).
 * - `{ "data": CompanySubmission[], "total": number, "page": number, "pageSize": number }`
 * - `{ "success": true, "data": ... }` wrapping either of the above.
 *
 * ## Create (authenticated user creates a submission for this company)
 * `POST /api/company/{slug}/submissions`
 *
 * Body: `{ "title": string, "summary": string, "status": SubmissionStatus }`
 *
 * Response: created `CompanySubmission` or `{ "success": true, "data": CompanySubmission }`.
 */
import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CompanySubmission,
  CompanySubmissionListParams,
  CompanySubmissionListResult,
  CreateCompanySubmissionPayload,
  SubmissionStatus,
} from "@/types/company-submission";
import { SUBMISSION_STATUSES } from "@/types/company-submission";

function normalizeSubmissionStatus(value: unknown): SubmissionStatus {
  if (typeof value === "string" && (SUBMISSION_STATUSES as readonly string[]).includes(value)) {
    return value as SubmissionStatus;
  }
  return "draft";
}

function normalizeSubmission(payload: unknown, index = 0): CompanySubmission | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const row = payload as Record<string, unknown>;
  const title = typeof row.title === "string" && row.title.trim() ? row.title.trim() : null;
  if (!title) {
    return null;
  }

  let submittedByUsername = "Unknown";
  let submittedByUserId = "";

  if (typeof row.submittedByUsername === "string" && row.submittedByUsername.trim()) {
    submittedByUsername = row.submittedByUsername.trim();
  } else if (row.submittedBy && typeof row.submittedBy === "object") {
    const u = row.submittedBy as Record<string, unknown>;
    if (typeof u.username === "string" && u.username.trim()) {
      submittedByUsername = u.username.trim();
    }
    if (typeof u.id === "string" || typeof u.id === "number") {
      submittedByUserId = String(u.id);
    }
  }

  if (typeof row.submittedByUserId === "string" || typeof row.submittedByUserId === "number") {
    submittedByUserId = String(row.submittedByUserId);
  }

  const summary =
    typeof row.summary === "string" && row.summary.trim() ? row.summary.trim() : "";

  const createdRaw = row.createdAt ?? row.created_at;
  const createdAt =
    typeof createdRaw === "string" && createdRaw.trim()
      ? createdRaw.trim()
      : new Date().toISOString();

  return {
    id:
      typeof row.id === "string" || typeof row.id === "number"
        ? String(row.id)
        : `submission-${index}-${title.slice(0, 24).toLowerCase().replace(/\s+/g, "-")}`,
    title,
    summary,
    status: normalizeSubmissionStatus(row.status),
    submittedByUserId,
    submittedByUsername,
    createdAt,
  };
}

function mapSubmissionList(items: unknown[]): CompanySubmission[] {
  return items
    .map((item, index) => normalizeSubmission(item, index))
    .filter((s): s is CompanySubmission => s !== null);
}

function isPaginatedShape(
  value: unknown
): value is PaginatedResponse<unknown> | { data: unknown[]; total: number; page: number; pageSize: number } {
  if (!value || typeof value !== "object") {
    return false;
  }
  const o = value as Record<string, unknown>;
  return Array.isArray(o.data) && typeof o.total === "number";
}

function unwrapListPayload(payload: unknown): CompanySubmissionListResult {
  if (Array.isArray(payload)) {
    const submissions = mapSubmissionList(payload);
    return {
      submissions,
      total: submissions.length,
      page: 1,
      pageSize: submissions.length || 1,
    };
  }

  if (!payload || typeof payload !== "object") {
    return { submissions: [], total: 0, page: 1, pageSize: defaultPageSize() };
  }

  const root = payload as Record<string, unknown>;

  if ("success" in root && root.data !== undefined) {
    return unwrapListPayload(root.data);
  }

  if (isPaginatedShape(payload)) {
    const p = payload as PaginatedResponse<unknown>;
    const submissions = mapSubmissionList(p.data);
    return {
      submissions,
      total: p.total,
      page: p.page,
      pageSize: p.pageSize,
    };
  }

  if (Array.isArray(root.data)) {
    const submissions = mapSubmissionList(root.data);
    return {
      submissions,
      total: typeof root.total === "number" ? root.total : submissions.length,
      page: typeof root.page === "number" ? root.page : 1,
      pageSize: typeof root.pageSize === "number" ? root.pageSize : submissions.length || defaultPageSize(),
    };
  }

  return { submissions: [], total: 0, page: 1, pageSize: defaultPageSize() };
}

function defaultPageSize() {
  return 20;
}

function unwrapSingleSubmission(payload: unknown): CompanySubmission | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const root = payload as Record<string, unknown>;
  if ("success" in root && root.data !== undefined) {
    return normalizeSubmission(root.data);
  }
  return normalizeSubmission(payload);
}

export async function fetchCompanySubmissionsFilter(
  companySlug: string,
  params: CompanySubmissionListParams
): Promise<CompanySubmissionListResult> {
  const { data } = await apiClient.post<
    | CompanySubmission[]
    | ApiResponse<CompanySubmission[]>
    | PaginatedResponse<CompanySubmission>
    | ApiResponse<PaginatedResponse<CompanySubmission>>
  >(`/api/company/${encodeURIComponent(companySlug)}/submissions/filter`, {
    query: params.search.trim() || null,
    status: params.status === "all" ? null : params.status,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    page: params.page,
    pageSize: params.pageSize,
  });
  return unwrapListPayload(data);
}

export async function createCompanySubmission(
  companySlug: string,
  payload: CreateCompanySubmissionPayload
): Promise<CompanySubmission> {
  const { data } = await apiClient.post<CompanySubmission | ApiResponse<CompanySubmission>>(
    `/api/company/${encodeURIComponent(companySlug)}/submissions`,
    {
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      status: payload.status,
    }
  );
  const created = unwrapSingleSubmission(data);
  if (!created) {
    throw new Error("Server returned an empty submission payload.");
  }
  return created;
}
