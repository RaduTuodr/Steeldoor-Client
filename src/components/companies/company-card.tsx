"use client";

import { MapPin, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/types/company";
import { cn } from "@/lib/utils";
import { companyInitials, formatCompanySize } from "@/lib/company-display";

interface CompanyCardProps {
  company: Company;
  className?: string;
}

export function CompanyCard({ company, className }: CompanyCardProps) {
  return (
    <Card
      className={cn(
        "group border-zinc-800/80 bg-zinc-900/40 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <div
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-950 text-sm font-semibold text-zinc-200 transition-transform duration-200 group-hover:scale-[1.03]"
          aria-hidden
        >
          <span>{companyInitials(company.name)}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-zinc-50">{company.name}</h3>
            <Badge variant="outline" className="font-normal text-zinc-400">
              {formatCompanySize(company.size)}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">{company.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
            {company.industry}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
            {company.location}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {company.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-zinc-400">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
