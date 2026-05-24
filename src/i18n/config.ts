export const locales = ["en", "ro"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "NEXT_LOCALE";

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getValidLocale(value: string | undefined | null): Locale {
  return value && hasLocale(value) ? value : defaultLocale;
}
