import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";

export function stripLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (!hasLocale(maybeLocale)) {
    return pathname;
  }

  const stripped = `/${segments.slice(2).join("/")}`;
  return stripped === "/" ? "/" : stripped.replace(/\/+$/, "") || "/";
}

export function localizeHref(locale: string, href: string): string {
  if (!href.startsWith("/")) {
    return href;
  }

  if (hasLocale(locale)) {
    if (href === "/") {
      return `/${locale}`;
    }

    return `/${locale}${href}`;
  }

  return href === "/" ? `/${defaultLocale}` : `/${defaultLocale}${href}`;
}

export function swapLocale(pathname: string, locale: Locale): string {
  const strippedPath = stripLocaleFromPathname(pathname);
  return localizeHref(locale, strippedPath);
}
