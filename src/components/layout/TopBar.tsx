"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, GraduationCap, User, LogOut, ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserRole } from "@/types/database";
import { cn } from "@/lib/utils";
import { logoutUser, switchRole } from "@/lib/auth/actions";

export interface TopBarProps {
  role?: UserRole;
  unreadNotifications?: number;
  onOpenMobileMenu?: () => void;
  userEmail?: string;
  userName?: string;
}

export function TopBar({
  role = "student",
  unreadNotifications = 0,
  onOpenMobileMenu,
  userEmail,
  userName = "Student",
}: TopBarProps) {
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [switching, setSwitching] = React.useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      window.location.href = res.redirectUrl || "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const handleRoleSwitch = async (targetRole: UserRole) => {
    try {
      setSwitching(targetRole);
      setProfileMenuOpen(false);
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

  const getHomeRoute = () => {
    switch (role) {
      case "coordinator":
        return "/coordinator/dashboard";
      case "hod":
        return "/hod/dashboard";
      case "faculty":
        return "/faculty/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md px-3 sm:px-6">
      {/* Left: Mobile menu toggle & brand */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href={getHomeRoute()}
          className="flex items-center gap-3 font-bold text-slate-900 dark:text-white group"
        >
          <div className="bg-white dark:bg-white/95 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-white/20 shadow-xs flex items-center shrink-0">
            <img
              src="/images/bvrit-logo.png"
              alt="BVRIT Logo"
              className="h-7 sm:h-8 w-auto object-contain shrink-0"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">
                BVRIT <span className="text-blue-600 dark:text-blue-400">CampusHub</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70">
                Autonomous
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden md:inline-block mt-0.5">
              Sri Vishnu Educational Society &bull; Narsapur
            </span>
          </div>

          {role !== "student" && (
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
              {role === "coordinator" ? "TPO" : role}
            </span>
          )}
        </Link>
      </div>

      {/* Right: Search, Notifications, Theme toggle, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Search quick link */}
        <Link
          href="/search"
          className="flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Search"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 sm:pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 transition-colors cursor-pointer"
            aria-expanded={profileMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 hidden lg:inline-block max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Popover */}
          {profileMenuOpen && (
            <>
              {/* Invisible overlay for dismiss on click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileMenuOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Header Info */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {userEmail || `${role}@bvrit.ac.in`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      {role === "coordinator" ? "TPO Placement Officer" : role === "hod" ? "Head of Dept (HOD)" : `${role} Portal`}
                    </span>
                  </div>
                </div>

                {/* Primary Portal Navigation */}
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile &amp; Settings</span>
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 text-slate-400" />
                      <span>Notifications</span>
                    </span>
                    {unreadNotifications > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Developer / Demo Persona Switching (Discrete Accordion) */}
                <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span>Switch Portal (Demo)</span>
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  </div>
                  <div className="grid grid-cols-5 gap-1 mt-1 px-1">
                    {(["student", "faculty", "coordinator", "hod", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSwitch(r)}
                        className={cn(
                          "py-1 text-[10px] font-bold rounded-md transition-colors capitalize",
                          role === r
                            ? "bg-blue-600 text-white shadow-2xs font-black"
                            : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/60"
                        )}
                      >
                        {r === "coordinator" ? "TPO" : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="px-2 pt-1.5 pb-0.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
