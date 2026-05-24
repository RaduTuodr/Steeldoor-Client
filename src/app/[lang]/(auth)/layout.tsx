import { PageContainer } from "@/components/page-container";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className="lg:items-center">
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </div>
    </PageContainer>
  );
}
