"use client";

import { AppNavbar } from "@/components/layout/app-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <AppNavbar />
      <div className="pt-14">{children}</div>
    </div>
  );
}
