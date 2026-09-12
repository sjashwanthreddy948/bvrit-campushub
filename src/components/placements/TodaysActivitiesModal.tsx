"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  ExternalLink,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { PlacementActivityWithMatch } from "@/lib/placements/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TodaysActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: PlacementActivityWithMatch[];
}

export function TodaysActivitiesModal({
  isOpen,
  onClose,
  activities,
}: TodaysActivitiesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1B1C22] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  Today’s Placement Activities
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F59E0B] text-white">
                  {activities.length} Today
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official company placement schedule for today
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Activities List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/60">
          {activities.map((act, index) => (
            <div
              key={act.id}
              className={`pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-[#2A2B33] border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 shrink-0 overflow-hidden">
                  {act.companyLogo ? (
                    <img
                      src={act.companyLogo}
                      alt={act.companyName}
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    act.companyName.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                      {act.companyName}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {act.activityType}
                    </span>
                    {act.match && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
                        ⚡ {act.match.score}% • {act.match.tier}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {act.role} {act.packageCtc && `• ${act.packageCtc}`}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#F59E0B]">
                      <Clock className="h-3 w-3" /> Starts at {act.startTime}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {act.venue}
                    </span>
                  </div>

                  {act.requiredSkills.length > 0 && (
                    <div className="pt-1 flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Key Skills:</span>
                      {act.requiredSkills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center sm:self-center shrink-0 pt-2 sm:pt-0">
                <Link
                  href={`/placements/activities/${act.id}`}
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold px-4"
                    rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#202129] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <Link
            href="/placements/activities"
            onClick={onClose}
            className="text-xs font-semibold text-[#F59E0B] hover:underline"
          >
            View Complete Placement Calendar →
          </Link>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
