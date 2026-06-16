"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Receipt,
  Stethoscope,
  Settings,
  Heart,
  X,
} from "lucide-react";
import type { Role } from "@prisma/client";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Calendar,
  Receipt,
  Stethoscope,
  Settings,
};

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  RECEPTIONIST: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Patients", href: "/patients", icon: "Users" },
    { label: "Appointments", href: "/appointments", icon: "Calendar" },
    { label: "Billing", href: "/billing", icon: "Receipt" },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Patients", href: "/patients", icon: "Users" },
    { label: "Appointments", href: "/appointments", icon: "Calendar" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Patients", href: "/patients", icon: "Users" },
    { label: "Appointments", href: "/appointments", icon: "Calendar" },
    { label: "Billing", href: "/billing", icon: "Receipt" },
    { label: "Settings", href: "/settings", icon: "Settings" },
  ],
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role as Role) || "RECEPTIONIST";
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.RECEPTIONIST;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 lg:z-30",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Patkar Clinic</h1>
              <p className="text-[10px] text-sidebar-muted">EMR System</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-muted">Logged in as</p>
            <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
            <p className="text-xs text-sidebar-muted capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
