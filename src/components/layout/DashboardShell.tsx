"use client";

import * as React from "react";
import { UserRole } from "@/types/database";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNavigation } from "./MobileNavigation";
import { CampusAiFloatingWidget } from "@/components/campus-ai/CampusAiFloatingWidget";

export interface DashboardShellProps {
  children: React.ReactNode;
  role?: UserRole;
  userName?: string;
  userEmail?: string;
  unreadNotifications?: number;
}

export function DashboardShell({
  children,
  role = "student",
  userName = "Student",
  userEmail,
  unreadNotifications,
}: DashboardShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* 1. Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar role={role} unreadNotifications={unreadNotifications} />
      </div>

      {/* 2. Main Content Column */}
      <div className="flex flex-col flex-1 min-w-0 w-full h-full overflow-hidden">
        {/* Top Header */}
        <TopBar
          role={role}
          userName={userName}
          userEmail={userEmail}
          unreadNotifications={unreadNotifications}
          onOpenMobileMenu={() => setIsDrawerOpen(true)}
        />

        {/* Scrollable Page Content Area */}
        {/* pb-24 ensures the mobile bottom nav never obstructs bottom content or action buttons */}
        <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 overscroll-y-contain">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation: Fixed Bottom Bar & Slide-out Drawer */}
      <MobileNavigation
        role={role}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={() => setIsDrawerOpen(false)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* 4. Global CampusHub AI Floating Widget (Available across all faculty & student pages) */}
      <CampusAiFloatingWidget />
    </div>
  );
}
