import "server-only";

import type en from "@/i18n/dictionaries/en.json";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/i18n/dictionaries/en.json").then((module) => module.default),
  ro: () => import("@/i18n/dictionaries/ro.json").then((module) => module.default),
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  const resolvedLocale = hasLocale(locale) ? locale : defaultLocale;
  return dictionaries[resolvedLocale]();
}
