import { CompanyDetailPage } from "@/components/companies/company-detail-page";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CompanyDetailPage slug={slug} />;
}
