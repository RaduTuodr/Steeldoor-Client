"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/types/company";
import { companyInitials, formatCompanySize } from "@/lib/company-display";
import { companySlug } from "@/lib/company-slug";
import { cn } from "@/lib/utils";

interface CompaniesTableProps {
  companies: Company[];
  className?: string;
}

export function CompaniesTable({ companies, className }: CompaniesTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/30 shadow-inner shadow-black/10",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-800/60 transition-colors duration-150 last:border-0 hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/company/${companySlug(row.name)}`}
                    className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300">
                      {companyInitials(row.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-100 hover:text-zinc-50">{row.name}</p>
                      <p className="line-clamp-1 text-xs text-zinc-500">{row.description}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-300">{row.industry}</td>
                <td className="px-4 py-3 text-zinc-400">{row.location}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-normal text-zinc-400">
                    {formatCompanySize(row.size)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px] font-normal text-zinc-500">
                        {t}
                      </Badge>
                    ))}
                    {row.tags.length > 3 ? (
                      <span className="text-xs text-zinc-600">+{row.tags.length - 3}</span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
