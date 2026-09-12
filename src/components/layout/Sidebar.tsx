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
import { logoutUser, switchRole } from "@/lib/auth/actions";

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

  const [switching, setSwitching] = React.useState<string | null>(null);

  const handleRoleSwitch = async (targetRole: UserRole) => {
    try {
      setSwitching(targetRole);
      if (onNavigate) onNavigate();
      const res = await switchRole(targetRole);
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      console.error("Role switch error:", err);
      if (targetRole === "faculty") window.location.href = "/faculty/dashboard";
      else if (targetRole === "coordinator") window.location.href = "/coordinator/dashboard";
      else if (targetRole === "hod") window.location.href = "/hod/dashboard";
      else if (targetRole === "admin") window.location.href = "/admin/dashboard";
      else window.location.href = "/dashboard";
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
      <div className="flex items-center gap-3 px-4 h-20 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
          <img
            src="/images/bvrit-logo.png"
            alt="BVRIT & Vishnu Universal Learning Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              BVRIT
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#F59E0B] text-slate-950">
              CAMPUS
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
            Vishnu Universal Learning
          </span>
          <span className="text-[9px] font-bold text-[#0D9488] dark:text-[#2DD4BF] uppercase tracking-wider">
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

      {/* Role Switcher Preview Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Institutional Role Switcher</span>
        </div>
        <div className="grid grid-cols-5 gap-1 text-center">
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleRoleSwitch("student")}
            className={cn(
              "py-1.5 text-[10px] rounded-md font-bold transition-colors min-h-[32px] flex items-center justify-center cursor-pointer",
              role === "student"
                ? "bg-blue-600 text-white shadow-xs font-black"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            )}
          >
            Student
          </button>
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleRoleSwitch("faculty")}
            className={cn(
              "py-1.5 text-[10px] rounded-md font-bold transition-colors min-h-[32px] flex items-center justify-center cursor-pointer",
              role === "faculty"
                ? "bg-blue-600 text-white shadow-xs font-black"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            )}
          >
            Faculty
          </button>
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleRoleSwitch("coordinator")}
            className={cn(
              "py-1.5 text-[10px] rounded-md font-bold transition-colors min-h-[32px] flex items-center justify-center cursor-pointer",
              role === "coordinator"
                ? "bg-blue-600 text-white shadow-xs font-black"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            )}
          >
            TPO
          </button>
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleRoleSwitch("hod")}
            className={cn(
              "py-1.5 text-[10px] rounded-md font-bold transition-colors min-h-[32px] flex items-center justify-center cursor-pointer",
              role === "hod"
                ? "bg-blue-600 text-white shadow-xs font-black"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            )}
          >
            HOD
          </button>
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleRoleSwitch("admin")}
            className={cn(
              "py-1.5 text-[10px] rounded-md font-bold transition-colors min-h-[32px] flex items-center justify-center cursor-pointer",
              role === "admin"
                ? "bg-blue-600 text-white shadow-xs font-black"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            )}
          >
            Admin
          </button>
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
