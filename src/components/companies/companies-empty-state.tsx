"use client";

import { Building2, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/i18n-provider";

interface CompaniesEmptyStateProps {
  variant: "no-results" | "empty";
  onReset?: () => void;
}

export function CompaniesEmptyState({ variant, onReset }: CompaniesEmptyStateProps) {
  const Icon = variant === "no-results" ? FilterX : Building2;
  const { dictionary } = useI18n();
  const title = variant === "no-results" ? dictionary.companies.noCompaniesMatch : dictionary.companies.noCompaniesYet;
  const description =
    variant === "no-results"
      ? dictionary.companies.adjustFilters
      : dictionary.companies.workspaceConnected;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-500">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-lg font-medium text-zinc-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">{description}</p>
      {variant === "no-results" && onReset ? (
        <Button variant="outline" className="mt-6" type="button" onClick={onReset}>
          {dictionary.companies.clearFilters}
        </Button>
      ) : null}
    </div>
  );
}
