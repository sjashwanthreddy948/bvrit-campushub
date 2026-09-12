"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Rocket,
  BookOpen,
  Briefcase,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface FocusActionItem {
  id: string;
  category: "drive" | "assignment" | "opportunity" | "circular";
  icon: "rocket" | "book" | "briefcase" | "alert";
  title: string;
  subtitle: string;
  urgencyLabel: string;
  urgencyColor: "rose" | "amber" | "blue" | "emerald";
  actionLabel: string;
  actionHref: string;
}

interface TodaysFocusProps {
  items: FocusActionItem[];
  onOpenPrepModal?: () => void;
}

export function TodaysFocus({ items, onOpenPrepModal }: TodaysFocusProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Today's Focus - Immediate Student Action Center"
      className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161820] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black border border-amber-300 dark:border-amber-700/50">
            <Sparkles className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5">
              TODAY'S FOCUS
              <span className="text-[11px] font-medium text-slate-400 hidden xs:inline">
                &bull; BVRIT Daily Command
              </span>
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {items.length} {items.length === 1 ? "priority action" : "priority actions"}
        </span>
      </div>

      {/* Focus Action Cards */}
      <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((item) => {
          const isDrive = item.category === "drive";
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs transition-all group"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      item.urgencyColor === "rose"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
                        : item.urgencyColor === "amber"
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300"
                        : item.urgencyColor === "emerald"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200"
                    }`}
                  >
                    {item.urgencyLabel}
                  </span>

                  {item.icon === "rocket" && <Rocket className="h-4 w-4 text-[#F59E0B]" />}
                  {item.icon === "book" && <BookOpen className="h-4 w-4 text-blue-500" />}
                  {item.icon === "briefcase" && <Briefcase className="h-4 w-4 text-emerald-500" />}
                  {item.icon === "alert" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                </div>

                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-[#D97706] dark:group-hover:text-[#FBBF24] transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              {isDrive && onOpenPrepModal ? (
                <Button
                  size="sm"
                  onClick={onOpenPrepModal}
                  className="w-full rounded-xl text-xs font-black bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 hover:text-white shadow-xs mt-1"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  {item.actionLabel}
                </Button>
              ) : (
                <Link href={item.actionHref} className="w-full mt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-xl text-xs font-bold hover:border-[#F59E0B] hover:text-[#D97706] dark:hover:border-[#FBBF24] dark:hover:text-[#FBBF24] transition-colors"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    {item.actionLabel}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
