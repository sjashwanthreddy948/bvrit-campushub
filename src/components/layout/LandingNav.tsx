"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Institutional Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-white dark:bg-white/95 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-white/20 shadow-xs flex items-center shrink-0">
            <img
              src="/images/bvrit-logo.png"
              alt="BVRIT Logo"
              className="h-8 w-auto object-contain shrink-0"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#E23636] text-white font-black text-xs px-1.5 py-0.5 uppercase tracking-wider rounded-xs">
                BVRIT
              </span>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                CampusHub
              </span>
              <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-50 text-[#E23636] dark:bg-red-950/60 dark:text-red-300 border border-red-200/60 dark:border-red-800/60">
                Autonomous
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Sri Vishnu Educational Society
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/opportunities" className="hover:text-[#E23636] transition-colors">
            Placement Drives
          </Link>
          <Link href="/coordinator/dashboard" className="hover:text-[#E23636] transition-colors">
            TPO Console
          </Link>
          <Link href="/ai" className="hover:text-[#E23636] transition-colors">
            Campus AI
          </Link>
          <Link href="/circulars" className="hover:text-[#E23636] transition-colors">
            Circulars &amp; Notices
          </Link>
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="font-semibold border-slate-300 dark:border-slate-700">
              Institutional Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-[#E23636] hover:bg-[#c52d2d] text-white font-bold shadow-2xs">
              Student Portal &rarr;
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link
              href="/opportunities"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
            >
              Placement Drives
            </Link>
            <Link
              href="/coordinator/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
            >
              TPO Console
            </Link>
            <Link
              href="/ai"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
            >
              Campus AI
            </Link>
            <Link
              href="/circulars"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
            >
              Circulars &amp; Notices
            </Link>
          </nav>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" size="md" fullWidth>
                Institutional Sign In
              </Button>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button size="md" fullWidth className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Student Portal &rarr;
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
