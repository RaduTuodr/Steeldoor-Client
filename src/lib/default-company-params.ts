import type { CompanyListParams } from "@/types/company";

export const defaultCompanyListParams: CompanyListParams = {
  search: "",
  industry: "all",
  location: "all",
  size: "all",
  sortBy: "name",
  sortDir: "asc",
};
