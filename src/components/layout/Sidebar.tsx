"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Send,
  FileText,
  BookOpen,
  Search,
  Bell,
  User,
  Users,
  GraduationCap,
  UserCheck,
  Building,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Code2,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/database";
import { logoutUser } from "@/lib/auth/actions";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function getNavItemsForRole(role: UserRole): NavItem[] {
  switch (role) {
    case "coordinator":
      return [
        { label: "TPO Dashboard", href: "/coordinator/dashboard", icon: LayoutDashboard },
        { label: "Placement Drives", href: "/coordinator/opportunities", icon: Briefcase },
        { label: "Campus AI", href: "/campus-ai", icon: Sparkles },
        { label: "Circulars", href: "/faculty/circulars", icon: FileText },
      ];
    case "hod":
      return [
        { label: "Department Telemetry", href: "/hod/dashboard", icon: LayoutDashboard },
        { label: "Placement Drives", href: "/coordinator/opportunities", icon: Briefcase },
        { label: "Campus AI", href: "/campus-ai", icon: Sparkles },
        { label: "Circulars", href: "/faculty/circulars", icon: FileText },
      ];
    case "faculty":
      return [
        { label: "Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
        { label: "Campus AI", href: "/campus-ai", icon: Sparkles },
        { label: "Circulars", href: "/faculty/circulars", icon: FileText },
        { label: "Assignments", href: "/faculty/assignments", icon: BookOpen },
      ];
    case "admin":
      return [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Campus AI", href: "/campus-ai", icon: Sparkles },
        { label: "All Users", href: "/admin/users", icon: Users },
        { label: "Students", href: "/admin/students", icon: GraduationCap },
        { label: "Faculty", href: "/admin/faculty", icon: UserCheck },
        { label: "Opportunities", href: "/admin/opportunities", icon: Briefcase },
        { label: "Circulars", href: "/admin/circulars", icon: FileText },
        { label: "Assignments", href: "/admin/assignments", icon: BookOpen },
        { label: "Departments", href: "/admin/departments", icon: Building },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ];
    case "student":
    default:
      return [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "CampusHub AI", href: "/ai", icon: Sparkles },
        { label: "Opportunities", href: "/opportunities", icon: Briefcase },
        { label: "Skills & Prep", href: "/skills", icon: Code2 },
        { label: "ATS Resume", href: "/resume-builder", icon: Award },
        { label: "Saved", href: "/saved", icon: Bookmark },
        { label: "Applications", href: "/applications", icon: Send },
        { label: "Circulars", href: "/circulars", icon: FileText },
        { label: "Assignments", href: "/assignments", icon: BookOpen },
        { label: "Search", href: "/search", icon: Search },
        { label: "Notifications", href: "/notifications", icon: Bell, badge: "2" },
        { label: "Profile", href: "/profile", icon: User },
      ];
  }
}

export interface SidebarProps {
  role?: UserRole;
  className?: string;
  onNavigate?: () => void;
  unreadNotifications?: number;
}

export function Sidebar({ role = "student", className, onNavigate, unreadNotifications }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const rawNavItems = getNavItemsForRole(role);
  const navItems = rawNavItems.map((item) => {
    if (item.href === "/notifications") {
      if (unreadNotifications !== undefined) {
        return {
          ...item,
          badge: unreadNotifications > 0 ? String(unreadNotifications) : undefined,
        };
      }
    }
    return item;
  });
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await logoutUser();
      router.push(res.redirectUrl || "/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-slate-200/80 dark:border-white/10 liquid-glass h-full select-none",
        className
      )}
    >
      {/* Brand: BVRIT & Vishnu Universal Learning */}
      <div className="flex items-center gap-3 px-4 h-20 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-transparent">
        <div className="bg-white dark:bg-white/95 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-white/20 shadow-xs flex items-center shrink-0">
          <img
            src="/images/bvrit-logo.png"
            alt="BVRIT Logo"
            className="h-8 w-auto object-contain shrink-0"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              BVRIT
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              CAMPUS
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
            Sri Vishnu Educational Society
          </span>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {role} Portal
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
              return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 min-h-[42px]",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800/60 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    isActive
                      ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Verified Institutional Portal Badge */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate capitalize">
              {role === "coordinator" ? "TPO Officer Portal" : role === "hod" ? "HOD Dept Portal" : `${role} Portal`}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              BVRIT Autonomous &bull; NAAC &apos;A+&apos;
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Real Logout Action */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          disabled={loggingOut}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors min-h-[44px]"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{loggingOut ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
