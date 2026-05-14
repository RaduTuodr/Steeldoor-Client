export const SUBMISSION_STATUSES = ["draft", "submitted", "under_review", "closed"] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/** Sort fields the backend should support (mirror Spring enum / query DTO). */
export type CompanySubmissionSortField = "createdAt" | "title" | "status" | "submittedBy";

/**
 * One row in the company-wide submissions feed (every user’s submissions for this company).
 * Backend naming hints: align DTO fields with JSON keys used here.
 */
export interface CompanySubmission {
  id: string;
  title: string;
  summary: string;
  status: SubmissionStatus;
  submittedByUserId: string;
  submittedByUsername: string;
  createdAt: string;
}

/** Client filter payload — mirrors `CompanyListParams` + companies POST `/api/company/filter`. */
export interface CompanySubmissionListParams {
  search: string;
  /** `"all"` or a concrete `SubmissionStatus` string sent as `null` when `"all"`. */
  status: string;
  sortBy: CompanySubmissionSortField;
  sortDir: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface CompanySubmissionListResult {
  submissions: CompanySubmission[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCompanySubmissionPayload {
  title: string;
  summary: string;
  status: SubmissionStatus;
}
