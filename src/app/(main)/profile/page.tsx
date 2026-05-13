"use client";

import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, isBootstrapping, isAuthenticated } = useAuth();
  useProtectedRoute();

  if (isBootstrapping) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const date = new Date(user.createdAt);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  const suffix = (day : number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const formattedDate = `${month} ${day}${suffix(day)}, ${year}`;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Profile</h1>
      <p className="mt-2 text-sm text-zinc-500">Account details from your registration.</p>

      <Card className="mt-8 border-zinc-800/80 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Username</p>
            <p className="mt-1 text-zinc-100">{user.username}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</p>
            <p className="mt-1 text-zinc-100">{user.email}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Member since</p>
            <p className="mt-1 text-zinc-100">{formattedDate}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
