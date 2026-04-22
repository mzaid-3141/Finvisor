"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  TrendingUp,
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  BarChart3,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const customerNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/customer",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "My Portfolios",
    href: "/dashboard/customer/portfolios",
    icon: <Briefcase size={18} />,
  },
  {
    label: "Create Portfolio",
    href: "/dashboard/customer/portfolios/create",
    icon: <PlusCircle size={18} />,
  },
];

const adminNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Assets",
    href: "/dashboard/admin/assets",
    icon: <BarChart3 size={18} />,
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[#64748b] text-sm">Loading Finvisor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = isAdmin ? adminNav : customerNav;

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d1526] border-r border-[#1e2d47] flex flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#1e2d47]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all duration-200">
              <TrendingUp size={20} className="text-amber-400" />
            </div>
            <span className="text-xl font-bold text-[#f1f5f9] tracking-tight">
              Finvisor
            </span>
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-[#1e2d47]">
          <span
            className={clsx(
              "text-xs font-medium px-2.5 py-1 rounded-full border",
              isAdmin
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}
          >
            {isAdmin ? "Admin Portal" : "Customer Portal"}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <p className="px-2 mb-2 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/customer" &&
                item.href !== "/dashboard/admin" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#1e2d47] border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      "transition-colors duration-200",
                      isActive
                        ? "text-blue-400"
                        : "text-[#64748b] group-hover:text-[#f1f5f9]"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </div>
                {isActive && (
                  <ChevronRight size={14} className="text-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t border-[#1e2d47]">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f1f5f9] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#64748b] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#64748b] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
