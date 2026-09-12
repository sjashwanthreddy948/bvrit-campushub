"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Briefcase,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ExternalLink,
  Target,
  Zap,
} from "lucide-react";
import {
  PlacementActivityWithMatch,
  TodaysPlacementAwarenessResult,
  PlacementMatchTier,
} from "@/lib/placements/types";
import { getTodaysPlacementActivitiesAction } from "@/lib/placements/actions";
import { TodaysActivitiesModal } from "./TodaysActivitiesModal";
import { PlacementPreparationModal } from "./PlacementPreparationModal";
import { usePlacementCountdown } from "./usePlacementCountdown";
import { Button } from "@/components/ui/Button";

export function TodaysPlacementActivityBanner() {
  const router = useRouter();
  const [data, setData] = React.useState<TodaysPlacementAwarenessResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    getTodaysPlacementActivitiesAction()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load today's placement activities:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryToday = data?.todayActivities?.[0] || null;
  const moreCount = data ? Math.max(0, data.todayActivities.length - 1) : 0;
  const nextUpcoming = data?.nextUpcomingActivity || null;

  // Real-time countdown and calculated urgent status
  const targetActivity = primaryToday || nextUpcoming;
  const { urgentStatus, countdownLabel, countdownFormatted, state, isToday } =
    usePlacementCountdown(targetActivity);

  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-slate-800 rounded-lg" />
          <div className="h-5 w-32 bg-slate-800 rounded-lg" />
        </div>
        <div className="h-8 w-64 bg-slate-800 rounded-lg mb-2" />
        <div className="h-5 w-48 bg-slate-800/60 rounded-lg mb-4" />
        <div className="h-10 w-full bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 1: NO PLACEMENT ACTIVITY SCHEDULED FOR TODAY
  // (Show compact, clean NEXT PLACEMENT ACTIVITY card without empty clutter)
  // =========================================================================
  if (!primaryToday) {
    return (
      <section
        aria-label="Next Placement Activity"
        className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 dark:from-[#0F121A] dark:via-[#131722] dark:to-[#0F121A] border border-slate-750 dark:border-slate-800 p-4 sm:p-5 shadow-sm overflow-hidden text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Calendar className="h-3 w-3" />
                Next Placement Activity
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                No active placement events scheduled for today
              </span>
            </div>

            {nextUpcoming ? (
              <div className="pt-1 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {nextUpcoming.companyName}
                </h3>
                <span className="text-xs sm:text-sm font-semibold text-slate-300 truncate">
                  {nextUpcoming.role} • {nextUpcoming.activityType}
                </span>
                <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-md">
                  {formatUpcomingDate(nextUpcoming.date)} • {nextUpcoming.startTime}
                </span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                All upcoming placement circulars and schedules are up to date.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            {nextUpcoming ? (
              <Link href={`/placements/activities/${nextUpcoming.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-bold bg-white/5 border-slate-700 text-white hover:bg-white/10 hover:border-slate-600 transition-colors"
                  rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                >
                  View Activity
                </Button>
              </Link>
            ) : (
              <Link href="/opportunities">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-bold bg-white/5 border-slate-700 text-white hover:bg-white/10"
                >
                  Explore Drives
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // SCENARIO 2: OFFICIAL PLACEMENT ACTIVITY TODAY (PLACEMENT SPOTLIGHT)
  // =========================================================================
  const match = primaryToday.match;
  const topStrengths = match?.topStrengths || [];
  const topFocusAreas = match?.topFocusAreas || [];
  const nextStep =
    match?.nextStepSuggestion ||
    "Review your technical fundamentals and verified resume copies before this activity.";

  return (
    <>
      <section
        aria-label="High Priority Placement Spotlight"
        className="w-full rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-600/30 dark:border-blue-500/40 p-5 sm:p-6 shadow-2xs relative overflow-hidden transition-all text-slate-900 dark:text-slate-100"
      >
        {/* 1. TOP BAR: URGENT STATUS LABEL + COUNTDOWN + MULTI-ACTIVITY TRIGGER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800 relative z-10">
          {/* Urgent Status Label with pulsing beacon */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${urgentStatus.badgeBg} ${urgentStatus.badgeText} ${urgentStatus.badgeBorder}`}
            >
              {urgentStatus.pulse && (
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${urgentStatus.dotColor} opacity-75`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${urgentStatus.dotColor}`}
                  />
                </span>
              )}
              {urgentStatus.label}
            </span>

            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs font-bold text-slate-300 truncate">
              {primaryToday.activityType}
            </span>
          </div>

          {/* Right: Live Countdown & Multi-activity modal trigger */}
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-center">
            {countdownFormatted && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-750 text-xs shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {countdownLabel}:
                </span>
                <span className="font-mono font-black text-[#F59E0B] text-xs tracking-wider">
                  {countdownFormatted}
                </span>
              </div>
            )}

            {moreCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="text-[11px] font-black text-[#F59E0B] hover:text-white bg-[#F59E0B]/15 hover:bg-[#F59E0B] px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer border border-[#F59E0B]/30"
              >
                <Layers className="h-3 w-3" />
                <span>+ {moreCount} more {moreCount === 1 ? "activity" : "activities"} today</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. CORE SPOTLIGHT BODY */}
        <div className="pt-4 sm:pt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 relative z-10">
          {/* LEFT 7 COLS: COMPANY SPOTLIGHT & SCHEDULE SPECS */}
          <div className="lg:col-span-7 space-y-4 min-w-0">
            <div className="flex items-start gap-3.5 sm:gap-4.5 min-w-0">
              {/* Prominent Company Logo or Initials */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2 flex items-center justify-center font-black text-xl text-slate-900 shrink-0 shadow-lg border border-slate-200 overflow-hidden">
                {primaryToday.companyLogo ? (
                  <img
                    src={primaryToday.companyLogo}
                    alt={primaryToday.companyName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  primaryToday.companyName.slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Company Name & Role Hierarchy */}
              <div className="min-w-0 space-y-0.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                    {primaryToday.companyName}
                  </h2>
                  {primaryToday.packageCtc && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      {primaryToday.packageCtc}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 truncate">
                  {primaryToday.role}
                </p>

                {/* Schedule & Venue Specs */}
                <div className="pt-1.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                    <Clock className="h-3.5 w-3.5" /> TODAY • {primaryToday.startTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {primaryToday.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Official Required Skills */}
            {primaryToday.requiredSkills && primaryToday.requiredSkills.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Important Drive Skills:
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {primaryToday.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: YOUR MATCH & YOUR NEXT STEP */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-between min-w-0">
            {/* YOUR MATCH SECTION */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  YOUR MATCH
                </span>
                {match && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getMatchBadgeStyles(
                      match.tier
                    )}`}
                  >
                    {match.tier} • {match.score}%
                  </span>
                )}
              </div>

              {/* Concise Strengths vs Focus Before Drive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Strengths */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Your strengths:
                  </div>
                  {topStrengths.length > 0 ? (
                    <div className="space-y-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {topStrengths.map((s, i) => (
                        <div key={i} className="flex items-center gap-1 truncate">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Review core prerequisites</p>
                  )}
                </div>

                {/* Focus Areas */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Focus before this drive:
                  </div>
                  {topFocusAreas.length > 0 ? (
                    <div className="space-y-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {topFocusAreas.map((f, i) => (
                        <div key={i} className="flex items-center gap-1 truncate">
                          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-600 italic">No missing critical skills</p>
                  )}
                </div>
              </div>
            </div>

            {/* YOUR NEXT STEP SECTION */}
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  RECOMMENDED NEXT STEP
                </span>
                <span className="text-slate-400 font-semibold text-[9px]">
                  CampusHub Advisor
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "{nextStep}"
              </p>
            </div>
          </div>
        </div>

        {/* 3. PRIMARY & SECONDARY ACTIONS BAR */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
            Official instructions published by BVRIT Placement Cell &bull; Authorized Partner
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Secondary CTA: VIEW FULL DRIVE */}
            <Link
              href={`/placements/activities/${primaryToday.id}`}
              className="flex-1 sm:flex-initial"
            >
              <Button
                variant="outline"
                size="md"
                className="w-full font-bold text-xs sm:text-sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                View Full Drive
              </Button>
            </Link>

            {/* Primary CTA: Check Eligibility / Prepare */}
            <Button
              size="md"
              onClick={() => setIsPrepModalOpen(true)}
              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-6 shadow-xs"
            >
              Check Eligibility &amp; Prepare &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* Multi-Activity Modal */}
      <TodaysActivitiesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activities={data?.todayActivities || []}
      />

      {/* Personalized Preparation Plan Modal */}
      <PlacementPreparationModal
        isOpen={isPrepModalOpen}
        onClose={() => setIsPrepModalOpen(false)}
        activity={primaryToday}
      />
    </>
  );
}

function getMatchBadgeStyles(tier: PlacementMatchTier): string {
  switch (tier) {
    case "Strong Match":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "Good Match":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "Partial Match":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "Requirements Not Fully Matched":
      return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/40";
  }
}

function formatUpcomingDate(dateStr: string): string {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

    return target.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
