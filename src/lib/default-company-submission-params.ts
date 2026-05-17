import type { CompanySubmissionListParams } from "@/types/company-submission";

export const defaultCompanySubmissionListParams: CompanySubmissionListParams = {
  query: null,
  position: null,
  offerReceived: null,
  sortBy: "createdAt",
  sortDir: "desc",
  page: 1,
  pageSize: 20,
};
