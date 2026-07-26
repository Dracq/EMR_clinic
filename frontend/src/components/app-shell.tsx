"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Activity, 
  FileText, 
  Pill, 
  Microscope,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "./ui/button";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Queue", href: "/queue", icon: Activity },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Consultations", href: "/consultations", icon: FileText },
    { name: "Medicines", href: "/medicines", icon: Pill },
    { name: "Investigations", href: "/investigations", icon: Microscope },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ];

  const adminNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const navItems = user?.role === "ADMIN" || user?.role === "DOCTOR" 
    ? [...navigation, ...adminNavigation] 
    : navigation;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PC</span>
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Patkar Clinic</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-700" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
              {user?.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PC</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Patkar Clinic</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-64 bg-white h-full shadow-xl flex flex-col">
             <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
               <span className="font-bold text-lg">Menu</span>
               <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                 <X className="w-5 h-5" />
               </Button>
             </div>
             
             <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-indigo-700" : "text-gray-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
