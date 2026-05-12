"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCompanyBySlug } from "@/services/api/companies-api";

export function useCompanyQuery(slug: string) {
  return useQuery({
    queryKey: ["company", slug],
    queryFn: () => fetchCompanyBySlug(slug),
    enabled: slug.length > 0,
  });
}
