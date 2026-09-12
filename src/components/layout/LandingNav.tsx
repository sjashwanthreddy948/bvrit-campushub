"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#F0E4E2] dark:border-[#2B2C35] bg-white/90 dark:bg-[#181A20]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F59E0B] flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#1A1D20] dark:text-[#F4EBE9]">
            Campus<span className="text-[#F59E0B]">Hub</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="#problem" className="hover:text-[#F59E0B] transition-colors">
            Why CampusHub
          </Link>
          <Link href="#features" className="hover:text-[#F59E0B] transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-[#F59E0B] transition-colors">
            How It Works
          </Link>
          <Link href="#benefits" className="hover:text-[#F59E0B] transition-colors">
            For students
          </Link>
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="amber" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#FFF0EE] dark:hover:bg-[#24252E] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#F0E4E2] dark:border-[#2B2C35] bg-white dark:bg-[#181A20] px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0EE] hover:text-[#F59E0B] transition-colors"
            >
              Why CampusHub
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0EE] hover:text-[#F59E0B] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0EE] hover:text-[#F59E0B] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#FFF0EE] hover:text-[#F59E0B] transition-colors"
            >
              For students
            </Link>
          </nav>
          <div className="pt-2 border-t border-[#F0E4E2] dark:border-[#2B2C35] flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" size="md" fullWidth>
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="amber" size="md" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
