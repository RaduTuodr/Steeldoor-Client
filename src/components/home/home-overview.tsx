"use client";

import { Activity, Briefcase, LineChart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATS = [
  {
    title: "Pipeline coverage",
    value: "68%",
    hint: "Mock metric — wire to Spring analytics later.",
    icon: LineChart,
  },
  {
    title: "Active workspaces",
    value: "12",
    hint: "Replace with tenant counts from your API.",
    icon: Briefcase,
  },
  {
    title: "Weekly activity",
    value: "+24%",
    hint: "Ideal for trend widgets fed by time-series endpoints.",
    icon: Activity,
  },
  {
    title: "Quality score",
    value: "94",
    hint: "Surface composite scores from backend aggregations.",
    icon: Sparkles,
  },
];

export function HomeOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((s) => (
        <Card
          key={s.title}
          className="border-zinc-800/80 bg-zinc-900/35 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/55 hover:shadow-lg hover:shadow-black/15"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">{s.title}</CardTitle>
            <s.icon className="h-4 w-4 text-zinc-500" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-zinc-50">{s.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">{s.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
