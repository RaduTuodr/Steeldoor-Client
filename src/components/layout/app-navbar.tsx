"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, LogOut, User, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/components/i18n/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { companyInitials } from "@/lib/company-display";
import { useLocale } from "@/hooks/use-locale";
import { localizeHref, swapLocale } from "@/i18n/routing";

const subscribe = () => () => {};

function NavTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200",
        active
          ? "text-zinc-50"
          : "text-zinc-500 hover:text-zinc-200"
      )}
    >
      {active && (
        <span
          className="absolute inset-x-1 -bottom-1 h-px bg-gradient-to-r from-transparent via-zinc-200/80 to-transparent"
          aria-hidden
        />
      )}
      {children}
    </Link>
  );
}

export function AppNavbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isBootstrapping, logout } = useAuth();
  const { dictionary } = useI18n();
  const locale = useLocale();
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);

  const onHome = pathname === `/${locale}`;
  const tab = isMounted ? searchParams.get("tab") : null;
  const overviewActive = isMounted && onHome && tab === "overview";
  const companiesActive =
    isMounted && onHome && (tab === "companies" || tab === null || tab === "");
  const localeSearch = searchParams.toString();
  const currentPathWithSearch = localeSearch ? `${pathname}?${localeSearch}` : pathname;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto grid h-14 w-full max-w-[1400px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 justify-start">
            <Link
              href={localizeHref(locale, "/")}
              className="group flex shrink-0 items-center gap-2 font-semibold tracking-tight text-zinc-100 transition-opacity hover:opacity-90"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-100 shadow-inner shadow-black/20 transition-transform duration-200 group-hover:scale-[1.02]">
                SD
              </span>
              <span className="hidden truncate sm:inline">{dictionary.navbar.brand}</span>
            </Link>
          </div>

          <nav className="flex items-center justify-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-0.5" aria-label="Primary">
            <NavTab href={localizeHref(locale, "/?tab=overview")} active={overviewActive}>
              {dictionary.navbar.overview}
            </NavTab>
            <NavTab href={localizeHref(locale, "/?tab=companies")} active={companiesActive}>
              {dictionary.navbar.companies}
            </NavTab>
          </nav>

          <div className="flex min-w-0 justify-end gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-0.5 sm:flex">
            <Button
              asChild
              variant={locale === "en" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2"
            >
              <Link href={swapLocale(currentPathWithSearch, "en")}>
                {dictionary.navbar.english}
              </Link>
            </Button>
            <Button
              asChild
              variant={locale === "ro" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2"
            >
              <Link href={swapLocale(currentPathWithSearch, "ro")}>
                {dictionary.navbar.romanian}
              </Link>
            </Button>
          </div>
          {!isMounted || isBootstrapping ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-800/60" aria-hidden />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-2 pr-3 text-zinc-200 hover:bg-zinc-800/80"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs text-zinc-100">
                      {companyInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
                    {user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium text-zinc-100">{user.username}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={localizeHref(locale, "/profile")} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" />
                    {dictionary.navbar.profile}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={localizeHref(locale, "/reset-password")} className="cursor-pointer gap-2">
                    <KeyRound className="h-4 w-4" />
                    {dictionary.navbar.resetPassword}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-400 focus:text-red-300"
                  onSelect={() => void logout()}
                >
                  <LogOut className="h-4 w-4" />
                  {dictionary.navbar.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-zinc-300" asChild>
                <Link href={localizeHref(locale, "/login")}>{dictionary.navbar.signIn}</Link>
              </Button>
              <Button size="sm" className="rounded-lg" asChild>
                <Link href={localizeHref(locale, "/register")}>{dictionary.navbar.register}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
