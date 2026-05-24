import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api";
import type { Company, CompanyListParams, CreateCompanyPayload } from "@/types/company";

function normalizeCompanySize(value: unknown): Company["size"] {
  if (value === "STARTUP" || value === "SMB" || value === "MID_MARKET" || value === "ENTERPRISE") {
    return value;
  }

  return "SMB";
}

function normalizeCompany(payload: unknown, index = 0): Company | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const name = typeof candidate.name === "string" && candidate.name.trim() ? candidate.name.trim() : null;

  if (!name) {
    return null;
  }

  const tags = Array.isArray(candidate.tags)
    ? candidate.tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter((tag): tag is string => Boolean(tag))
    : [];

  return {
    id:
      typeof candidate.id === "string" || typeof candidate.id === "number"
        ? String(candidate.id)
        : `${name.toLowerCase().replace(/\s+/g, "-")}-${index}`,
    name,
    logoUrl: typeof candidate.logoUrl === "string" ? candidate.logoUrl : null,
    website: typeof candidate.website === "string" ? candidate.website : null,
    description:
      typeof candidate.description === "string" && candidate.description.trim()
        ? candidate.description.trim()
        : "No description available.",
    industry:
      typeof candidate.industry === "string" && candidate.industry.trim()
        ? candidate.industry.trim()
        : "Unknown",
    location:
      typeof candidate.location === "string" && candidate.location.trim()
        ? candidate.location.trim()
        : "Unknown",
    size: normalizeCompanySize(candidate.size),
    tags,
  };
}

function unwrapCompanyListResponse(
  payload: Company[] | ApiResponse<Company[]> | null | undefined
): Company[] {
  if (Array.isArray(payload)) {
    return payload
      .map((company, index) => normalizeCompany(company, index))
      .filter((company): company is Company => company !== null);
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data
      .map((company, index) => normalizeCompany(company, index))
      .filter((company): company is Company => company !== null);
  }

  return [];
}

function unwrapCompanyResponse(
  payload: Company | ApiResponse<Company> | null | undefined
): Company | null {
  if (!payload) {
    return null;
  }
  if ("data" in payload) {
    return normalizeCompany(payload.data);
  }

  return normalizeCompany(payload);
}

function createUploadClient() {
  return apiClient;
}

function extractUploadUrl(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const candidate = payload as Record<string, unknown>;

  if (typeof candidate.data === "string") {
    return candidate.data;
  }

  if (typeof candidate.url === "string") {
    return candidate.url;
  }

  if (typeof candidate.secure_url === "string") {
    return candidate.secure_url;
  }

  return "";
}

export async function fetchCompanies(params: CompanyListParams): Promise<Company[]> {
  const { data } = await apiClient.post<Company[] | ApiResponse<Company[]>>("/api/company/filter", {
    query: params.search.trim() || null,
    industry: params.industry === "all" ? null : params.industry,
    location: params.location === "all" ? null : params.location,
    size: params.size === "all" ? null : params.size,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  });
  return unwrapCompanyListResponse(data);
}

export async function fetchCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    const { data } = await apiClient.get<Company | ApiResponse<Company>>(`/api/company/${slug}`);
    return unwrapCompanyResponse(data);
  } catch (error) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { status?: number } }).response;
      if (response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
}

export async function uploadCompanyPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await createUploadClient().post("/photo/upload", formData);

  return extractUploadUrl(data);
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company | null> {
  const body = {
    ...payload,
    website: payload.website.trim(),
    logoUrl: payload.logoUrl?.trim() || null,
    name: payload.name.trim(),
    description: payload.description.trim(),
    industry: payload.industry.trim(),
    location: payload.location.trim(),
  };

  const { data } = await apiClient.post<Company | ApiResponse<Company>>("/api/company", body);
  return unwrapCompanyResponse(data);
}

export function getDistinctIndustries(companies: Company[]) {
  return Array.from(
    new Set(
      companies
        .map((company) => company.industry?.trim())
        .filter((industry): industry is string => Boolean(industry))
    )
  ).sort();
}

export function getDistinctLocations(companies: Company[]) {
  return Array.from(
    new Set(
      companies
        .map((company) => company.location?.trim())
        .filter((location): location is string => Boolean(location))
    )
  ).sort();
}
