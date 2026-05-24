import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import { hasLocale, locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);

  return (
    <I18nProvider locale={lang} dictionary={dictionary}>
      {children}
    </I18nProvider>
  );
}
