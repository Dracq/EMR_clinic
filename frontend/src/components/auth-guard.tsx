"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({ children, requireRole }: { children: React.ReactNode, requireRole?: string[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (requireRole && !requireRole.includes(user.role)) {
        router.push("/dashboard"); // Or unauthorized page
      }
    }
  }, [user, isLoading, router, requireRole]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (requireRole && !requireRole.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
