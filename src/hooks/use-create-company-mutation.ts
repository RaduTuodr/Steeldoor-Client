"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompany, uploadCompanyPhoto } from "@/services/api/companies-api";
import type { CreateCompanyFormValues } from "@/lib/validation/company";

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateCompanyFormValues) => {
      const logoUrl = values.logo ? await uploadCompanyPhoto(values.logo) : null;

      return createCompany({
        name: values.name,
        website: values.website || "",
        logoUrl,
        description: values.description,
        industry: values.industry,
        location: values.location,
        companySize: values.companySize,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
