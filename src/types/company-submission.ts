import { User } from "./auth";
import { Company } from "./company";

export type CompanySubmissionSortField = "createdAt" | "votes";

/**
 * One row in the company-wide submissions feed (every user’s submissions for this company).
 * Backend naming hints: align DTO fields with JSON keys used here.
 */
export interface CompanySubmission {
  id: string;
  company: Company;
  user: User;
  position: string;
  offerReceived: boolean;
  overallDifficulty: number;
  createdAt: string;
}

/** Client filter payload — mirrors `CompanyListParams` + companies POST `/api/company/filter`. */
export interface CompanySubmissionListParams {
  query: string | null;
  position: string | null;
  offerReceived: boolean | null;
  sortBy: "createdAt" | "votes";
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
  userId: string;
  position: string;
  overallDifficulty: number;
  offerReceived: boolean;
  createdAt: string;
}