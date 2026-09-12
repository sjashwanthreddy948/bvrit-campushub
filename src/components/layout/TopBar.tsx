"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, Search, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserRole } from "@/types/database";

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
  userName = "Student",
}: TopBarProps) {
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
          <img
            src="/images/bvrit-logo.png"
            alt="BVRIT Logo"
            className="h-8 sm:h-9 w-auto object-contain shrink-0"
          />
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

        {/* User avatar / profile button */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-1 sm:pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-800">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200 hidden lg:inline-block max-w-[120px] truncate">
            {userName}
          </span>
        </Link>
      </div>
    </header>
  );
}
