import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

/**
 * AuthCard - A consistent card wrapper for authentication pages
 * Uses shadcn/ui Card components with proper styling
 */
export function AuthCard({ children, title, description, className }: AuthCardProps) {
  return (
    <Card
      className={cn(
        "border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/30 backdrop-blur-xl",
        className
      )}
    >
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-50 text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-zinc-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}

export default AuthCard;
