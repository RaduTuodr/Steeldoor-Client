import type { CompanySubmissionListParams } from "@/types/company-submission";

export const defaultCompanySubmissionListParams: CompanySubmissionListParams = {
  search: "",
  status: "all",
  sortBy: "createdAt",
  sortDir: "desc",
  page: 1,
  pageSize: 20,
};
