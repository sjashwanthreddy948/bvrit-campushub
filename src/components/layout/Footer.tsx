import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
          {/* Brand Info */}
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Campus<span className="text-blue-600 dark:text-blue-400">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Smart campus information, organized. Everything important on campus in one single place.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 text-sm">
            <div className="space-y-2.5">
              <span className="font-semibold text-slate-900 dark:text-slate-200">Platform</span>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/opportunities" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="/circulars" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Circulars
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <span className="font-semibold text-slate-900 dark:text-slate-200">About</span>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    About CampusHub
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 col-span-2 sm:col-span-1">
              <span className="font-semibold text-slate-900 dark:text-slate-200">Legal</span>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 CampusHub. All rights reserved.</p>
          <p>Designed mobile-first for college campuses.</p>
        </div>
      </div>
    </footer>
  );
}
