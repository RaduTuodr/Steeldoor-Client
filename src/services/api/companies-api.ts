import { apiClient } from "@/services/api/client";
import { MOCK_COMPANIES } from "@/data/mock-companies";
import type { Company, CompanyListParams, CompanySize } from "@/types/company";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_COMPANIES !== "false";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SIZE_ORDER: Record<CompanySize, number> = {
  STARTUP: 0,
  SMB: 1,
  MID_MARKET: 2,
  ENTERPRISE: 3,
};

function matchesSearch(company: Company, q: string) {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const hay = [
    company.name,
    company.description,
    company.industry,
    company.location,
    ...company.tags,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function compare(
  a: Company,
  b: Company,
  sortBy: CompanyListParams["sortBy"],
  dir: CompanyListParams["sortDir"]
) {
  const sign = dir === "asc" ? 1 : -1;
  if (sortBy === "size") {
    return (SIZE_ORDER[a.size] - SIZE_ORDER[b.size]) * sign;
  }
  const av = a[sortBy].toLowerCase();
  const bv = b[sortBy].toLowerCase();
  if (av < bv) return -1 * sign;
  if (av > bv) return 1 * sign;
  return 0;
}

function filterAndSort(source: Company[], params: CompanyListParams): Company[] {
  let list = source.filter((c) => matchesSearch(c, params.search));
  if (params.industry !== "all") {
    list = list.filter((c) => c.industry === params.industry);
  }
  if (params.location !== "all") {
    list = list.filter((c) => c.location === params.location);
  }
  if (params.size !== "all") {
    list = list.filter((c) => c.size === params.size);
  }
  return [...list].sort((a, b) => compare(a, b, params.sortBy, params.sortDir));
}

/**
 * Fetches companies. Mock path simulates latency and client-side filtering.
 * Spring Boot: replace body with `apiClient.get<Company[]>("/api/companies", { params })` and map DTOs.
 */
export async function fetchCompanies(params: CompanyListParams): Promise<Company[]> {
  if (USE_MOCK) {
    await delay(320);
    return filterAndSort(MOCK_COMPANIES, params);
  }

  const { data } = await apiClient.get<Company[]>("/api/companies", {
    params: {
      q: params.search || undefined,
      industry: params.industry === "all" ? undefined : params.industry,
      location: params.location === "all" ? undefined : params.location,
      size: params.size === "all" ? undefined : params.size,
      sort: `${params.sortBy},${params.sortDir}`,
    },
  });
  return data;
}

export function getDistinctIndustries(companies: Company[]) {
  return Array.from(new Set(companies.map((c) => c.industry))).sort();
}

export function getDistinctLocations(companies: Company[]) {
  return Array.from(new Set(companies.map((c) => c.location))).sort();
}
