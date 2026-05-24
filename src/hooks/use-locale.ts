"use client";

import { useParams } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";

export function useLocale(): Locale {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang;

  return lang && hasLocale(lang) ? lang : defaultLocale;
}
