import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  hasLocale,
  localeCookieName,
  locales,
  type Locale,
} from "@/i18n/config";

function getPreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  if (cookieLocale && hasLocale(cookieLocale)) {
    return cookieLocale;
  }

  const accepted = request.headers.get("accept-language");
  if (!accepted) {
    return defaultLocale;
  }

  const languages = accepted
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const language of languages) {
    const exactMatch = locales.find((locale) => locale.toLowerCase() === language);
    if (exactMatch) {
      return exactMatch;
    }

    const baseLanguage = language.split("-")[0];
    const baseMatch = locales.find((locale) => locale === baseLanguage);
    if (baseMatch) {
      return baseMatch;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    const locale = pathname.split("/")[1];
    const response = NextResponse.next();
    response.cookies.set(localeCookieName, locale, { path: "/" });
    return response;
  }

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, locale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
