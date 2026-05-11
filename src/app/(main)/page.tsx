"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, isAuthenticated, logout, isBootstrapping } = useAuth();

  console.log(user);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-[-12rem] h-80 bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_60%)] blur-3xl" />
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-16">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-zinc-400">
                Modern auth starter
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                  A minimal shell for your authenticated product.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-zinc-400">
                  Clean by default, ready for Spring Boot integration, and structured
                  to grow into OAuth, protected pages, and real account workflows.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                    Signed in as <span className="font-medium text-zinc-100">{user?.email}</span>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={() => void logout()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="rounded-xl">
                    <Link href="/register">Create account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-medium text-zinc-200">Structured</p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                App Router routes, reusable auth components, and an interceptor-ready API layer.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-medium text-zinc-200">Prepared</p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                JWT is stored locally for now, while the service layer stays flexible for backend changes.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-medium text-zinc-200">Focused</p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                A quiet default homepage leaves room for the real product experience you build next.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-8 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">Session state</p>
                <p className="text-sm text-zinc-500">
                  {isBootstrapping
                    ? "Restoring your session..."
                    : isAuthenticated
                      ? `Your local session is active for ${user?.username}.`
                      : "No active session yet. Use the auth routes to begin."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                Routes ready: <span className="text-zinc-100">/login</span> and{" "}
                <span className="text-zinc-100">/register</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
