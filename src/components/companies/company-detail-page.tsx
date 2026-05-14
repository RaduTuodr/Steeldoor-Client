"use client";

import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Tags } from "lucide-react";
import { useCompanyQuery } from "@/hooks/use-company-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { companyInitials, formatCompanySize } from "@/lib/company-display";
import { CompanySubmissionsPanel } from "@/components/companies/company-submissions-panel";

function CompanyDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Skeleton className="h-9 w-36" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

function CompanyNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center sm:px-6">
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Directory</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">Company not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The company you were trying to open is missing or no longer available in the current dataset.
        </p>
        <Button asChild className="mt-6">
          <Link href="/?tab=companies">Back to companies</Link>
        </Button>
      </div>
    </div>
  );
}

export function CompanyDetailPage({ slug }: { slug: string }) {
  const { data: company, isPending, isError, error } = useCompanyQuery(slug);

  if (isPending) {
    return <CompanyDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 text-sm text-red-200">
          <p className="font-medium">Could not load company</p>
          <p className="mt-2 text-red-300/80">{error.message}</p>
          <Button asChild variant="outline" className="mt-4 border-red-900/60 text-red-100">
            <Link href="/?tab=companies">Back to companies</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!company) {
    return <CompanyNotFound />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Button asChild variant="ghost" className="gap-2 px-0 text-zinc-400 hover:bg-transparent hover:text-zinc-100">
        <Link href="/?tab=companies">
          <ArrowLeft className="h-4 w-4" />
          Back to companies
        </Link>
      </Button>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="gap-6 border-b border-zinc-800/70 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950/80 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-950 text-lg font-semibold text-zinc-100 shadow-inner shadow-black/20">
                {companyInitials(company.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">{company.industry}</p>
                <CardTitle className="mt-2 text-3xl tracking-tight text-zinc-50">{company.name}</CardTitle>
                <CardDescription className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  {company.description}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 font-normal text-zinc-300">
              {formatCompanySize(company.size)}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Overview</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {company.name} operates in {company.industry.toLowerCase()} and is currently based in{" "}
                {company.location}. This profile is ready to be expanded with live backend fields like contacts,
                status, revenue bands, or engagement history.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {company.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal text-zinc-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800/80 bg-zinc-900/35">
          <CardHeader>
            <CardTitle className="text-lg">Company details</CardTitle>
            <CardDescription>Current fields available in the client model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Company ID</p>
              <p className="mt-1 font-mono text-xs text-zinc-300">{company.id}</p>
            </div>
            <Separator className="bg-zinc-800/70" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Industry</p>
              <p className="mt-1 inline-flex items-center gap-2 text-zinc-200">
                <Building2 className="h-4 w-4 text-zinc-500" />
                {company.industry}
              </p>
            </div>
            <Separator className="bg-zinc-800/70" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Location</p>
              <p className="mt-1 inline-flex items-center gap-2 text-zinc-200">
                <MapPin className="h-4 w-4 text-zinc-500" />
                {company.location}
              </p>
            </div>
            <Separator className="bg-zinc-800/70" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Tags count</p>
              <p className="mt-1 inline-flex items-center gap-2 text-zinc-200">
                <Tags className="h-4 w-4 text-zinc-500" />
                {company.tags.length}
              </p>
            </div>
            <CompanySubmissionsPanel companySlug={slug} companyName={company.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
