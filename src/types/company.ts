/**
 * Company domain types — align with future Spring Boot DTOs (e.g. CompanyResponse).
 */
export type CompanySize = "STARTUP" | "SMB" | "MID_MARKET" | "ENTERPRISE";

export interface Company {
  id: string;
  name: string;
  /** Public URL to logo; placeholder used when missing */
  logoUrl?: string | null;
  website?: string | null;
  description: string;
  industry: string;
  location: string;
  size: CompanySize;
  tags: string[];
}

export interface CreateCompanyPayload {
  name: string;
  website: string;
  logoUrl?: string | null;
  description: string;
  industry: string;
  location: string;
  companySize: CompanySize;
}

export type CompanySortField = "name" | "industry" | "size" | "location";

export interface CompanyListParams {
  search: string;
  industry: string;
  location: string;
  size: string;
  sortBy: CompanySortField;
  sortDir: "asc" | "desc";
}
