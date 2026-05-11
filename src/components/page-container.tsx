import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer - Consistent page layout wrapper
 * Provides centered layout with proper spacing for all pages
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-10",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.10),_transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(24,24,27,0.2),_rgba(9,9,11,0.94))]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
        {children}
      </div>
    </main>
  );
}

export default PageContainer;
