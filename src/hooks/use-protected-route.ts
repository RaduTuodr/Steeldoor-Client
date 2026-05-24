"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/hooks/use-locale";
import { localizeHref } from "@/i18n/routing";

export function useProtectedRoute(): void {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      const query = searchParams.toString();
      const redirectPath = query ? `${pathname}?${query}` : pathname;
      const redirectUrl = encodeURIComponent(redirectPath);

      router.replace(`${localizeHref(locale, "/login")}?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, isBootstrapping, router, pathname, searchParams, locale]);
}

interface UseProtectedRouteOptions {
  redirectTo?: string;
  storeOriginalUrl?: boolean;
  onAccessDenied?: () => void;
}

export function useProtectedRouteWithOptions(options: UseProtectedRouteOptions = {}): void {
  const { redirectTo = "/login", storeOriginalUrl = true, onAccessDenied } = options;
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      const localizedRedirect = localizeHref(locale, redirectTo);

      if (storeOriginalUrl && pathname) {
        const query = searchParams.toString();
        const redirectPath = query ? `${pathname}?${query}` : pathname;
        const redirectUrl = encodeURIComponent(redirectPath);

        router.replace(`${localizedRedirect}?redirect=${redirectUrl}`);
      } else {
        router.replace(localizedRedirect);
      }

      onAccessDenied?.();
    }
  }, [isAuthenticated, isBootstrapping, router, pathname, searchParams, redirectTo, storeOriginalUrl, onAccessDenied, locale]);
}

export function useGuestRoute(defaultRedirect: string = "/"): void {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect");
      router.replace(redirect || localizeHref(locale, defaultRedirect));
    }
  }, [isAuthenticated, isBootstrapping, router, defaultRedirect, locale]);
}

export default useProtectedRoute;
