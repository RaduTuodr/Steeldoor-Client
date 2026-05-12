import { HomeDashboard } from "@/components/home/home-dashboard";

function resolveHomeTab(tab: string | string[] | undefined): "overview" | "companies" {
  const value = Array.isArray(tab) ? tab[0] : tab;
  return value === "overview" ? "overview" : "companies";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tab } = await searchParams;

  return <HomeDashboard initialTab={resolveHomeTab(tab)} />;
}
