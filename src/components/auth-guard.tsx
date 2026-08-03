"use client";

export function AuthGuard({ children, requireRole }: { children: React.ReactNode, requireRole?: string[] }) {
  // Authentication is disabled, so we bypass all checks
  return <>{children}</>;
}

