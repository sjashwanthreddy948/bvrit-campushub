"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Send,
  FileText,
  Menu,
  X,
  GraduationCap,
  Users,
  BarChart3,
  BookOpen,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/database";
import { Sidebar } from "./Sidebar";

export interface MobileNavigationProps {
  role?: UserRole;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
}

export function MobileNavigation({
  role = "student",
  isDrawerOpen,
  onCloseDrawer,
  onOpenDrawer,
}: MobileNavigationProps) {
  const pathname = usePathname();

  // Primary bottom navigation items (thumb-friendly, 4 to 5 icons)
  const getBottomNavItems = () => {
    switch (role) {
      case "coordinator":
        return [
          { label: "TPO", href: "/coordinator/dashboard", icon: LayoutDashboard },
          { label: "Drives", href: "/coordinator/opportunities", icon: Briefcase },
          { label: "Notices", href: "/faculty/circulars", icon: FileText },
        ];
      case "hod":
        return [
          { label: "Telemetry", href: "/hod/dashboard", icon: LayoutDashboard },
          { label: "Drives", href: "/coordinator/opportunities", icon: Briefcase },
          { label: "Notices", href: "/faculty/circulars", icon: FileText },
        ];
      case "faculty":
        return [
          { label: "Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
          { label: "Circulars", href: "/faculty/circulars", icon: FileText },
          { label: "Assignments", href: "/faculty/assignments", icon: BookOpen },
        ];
      case "admin":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Opportunities", href: "/admin/opportunities", icon: Briefcase },
          { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        ];
      case "student":
      default:
        return [
          { label: "Home", href: "/dashboard", icon: LayoutDashboard },
          { label: "Drives", href: "/opportunities", icon: Briefcase },
          { label: "AI", href: "/ai", icon: Sparkles, isCenterAi: true },
          { label: "Notices", href: "/circulars", icon: FileText },
          { label: "Profile", href: "/profile", icon: User },
        ];
    }
  };

  const bottomItems = getBottomNavItems();

  return (
    <>
      {/* 1. Mobile Bottom Navigation Bar (Fixed at bottom on screens < 768px) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 liquid-glass border-t border-white/10 dark:border-white/10 shadow-2xl safe-area-pb"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/faculty/dashboard" &&
                item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            if ((item as any).isCenterAi) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center min-h-[44px] py-1 select-none relative -top-3"
                >
                  <div className="h-12 w-12 rounded-full liquid-btn-amber flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-slate-900 transition-transform active:scale-95">
                    <Sparkles className="h-5 w-5 text-slate-950" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 mt-0.5">AI</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[44px] py-1 gap-1 text-[11px] font-medium transition-colors select-none",
                  isActive
                    ? "text-[#F59E0B] font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-amber-600"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "scale-110 text-[#F59E0B]" : ""
                  )}
                />
                <span className="truncate max-w-[56px] leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 2. Slide-out Navigation Drawer (Mobile Backdrop & Sidebar) */}
      {isDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseDrawer}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header with Close */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Campus<span className="text-blue-600 dark:text-blue-400">Hub</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseDrawer}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sidebar inside Drawer */}
            <Sidebar
              role={role}
              className="border-none w-full flex-1"
              onNavigate={onCloseDrawer}
            />
          </div>
        </div>
      )}
    </>
  );
}
