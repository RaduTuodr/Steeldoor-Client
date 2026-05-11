"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/services/api/companies-api";
import type { CompanyListParams } from "@/types/company";

export const companiesQueryKey = (params: CompanyListParams) =>
  ["companies", params] as const;

export function useCompaniesQuery(params: CompanyListParams) {
  return useQuery({
    queryKey: companiesQueryKey(params),
    queryFn: () => fetchCompanies(params),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
