"use client";

import * as React from "react";
import { PlacementActivity } from "@/lib/placements/types";

export interface UrgentStatusConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  pulse: boolean;
}

export interface PlacementCountdownResult {
  urgentStatus: UrgentStatusConfig;
  countdownLabel: string;
  countdownFormatted: string | null;
  state: "countdown" | "in_progress" | "ended" | "upcoming_day" | "unavailable";
  isToday: boolean;
  isTomorrow: boolean;
}

function parseActivityDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const parts = timeStr.trim().split(" ");
    const [hoursStr, minsStr] = parts[0].split(":");
    let h = parseInt(hoursStr, 10);
    const m = parseInt(minsStr, 10);
    const isPm = (parts[1] || "").toUpperCase() === "PM";
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return new Date(year, month - 1, day, h, m, 0, 0);
  } catch {
    return null;
  }
}

function pad(num: number): string {
  return String(num).padStart(2, "0");
}

export function usePlacementCountdown(
  activity: PlacementActivity | null | undefined
): PlacementCountdownResult {
  const [now, setNow] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    if (!activity) return;

    // Update every second for live countdown
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [activity?.id, activity?.date, activity?.startTime]);

  if (!activity) {
    return {
      urgentStatus: {
        label: "NO ACTIVITY",
        badgeBg: "bg-slate-100 dark:bg-slate-800",
        badgeText: "text-slate-600 dark:text-slate-400",
        badgeBorder: "border-slate-200 dark:border-slate-700",
        dotColor: "bg-slate-400",
        pulse: false,
      },
      countdownLabel: "STATUS",
      countdownFormatted: null,
      state: "unavailable",
      isToday: false,
      isTomorrow: false,
    };
  }

  const todayStr = (() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const tomorrowStr = (() => {
    const t = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const isToday = activity.date === todayStr;
  const isTomorrow = activity.date === tomorrowStr;

  const targetDate = parseActivityDateTime(activity.date, activity.startTime);
  const endDate = activity.endTime
    ? parseActivityDateTime(activity.date, activity.endTime)
    : null;

  // Countdown Label determination
  const isDeadline = activity.activityType === "Registration Deadline";
  const countdownLabel = isDeadline
    ? "REGISTRATION CLOSES IN"
    : activity.activityType === "Company Visit / Placement Drive"
    ? "DRIVE STARTS IN"
    : activity.activityType === "Online Assessment"
    ? "ASSESSMENT STARTS IN"
    : activity.activityType === "Technical Interview"
    ? "INTERVIEW STARTS IN"
    : "ACTIVITY STARTS IN";

  if (!targetDate) {
    return {
      urgentStatus: {
        label: isToday ? "LIVE TODAY" : isTomorrow ? "COMING TOMORROW" : "SCHEDULED",
        badgeBg: "bg-slate-100 dark:bg-slate-800",
        badgeText: "text-slate-700 dark:text-slate-300",
        badgeBorder: "border-slate-300 dark:border-slate-700",
        dotColor: "bg-slate-500",
        pulse: false,
      },
      countdownLabel,
      countdownFormatted: null,
      state: "unavailable",
      isToday,
      isTomorrow,
    };
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const minutesUntilStart = Math.floor(diffMs / (1000 * 60));

  // 1. Calculate Deterministic Urgent Status Label
  let urgentStatus: UrgentStatusConfig;

  if (isDeadline && isToday) {
    if (diffMs > 0) {
      urgentStatus = {
        label: "🟡 REGISTRATION CLOSES TODAY",
        badgeBg: "bg-amber-500/10 dark:bg-amber-950/40",
        badgeText: "text-amber-700 dark:text-amber-300",
        badgeBorder: "border-amber-500/30 dark:border-amber-600/40",
        dotColor: "bg-amber-500",
        pulse: true,
      };
    } else {
      urgentStatus = {
        label: "⚪ REGISTRATION CLOSED",
        badgeBg: "bg-slate-100 dark:bg-slate-800",
        badgeText: "text-slate-600 dark:text-slate-400",
        badgeBorder: "border-slate-200 dark:border-slate-700",
        dotColor: "bg-slate-400",
        pulse: false,
      };
    }
  } else if (isToday) {
    if (diffMs > 0 && minutesUntilStart <= 180) {
      urgentStatus = {
        label: "🟠 STARTING SOON",
        badgeBg: "bg-orange-500/15 dark:bg-orange-950/50",
        badgeText: "text-orange-700 dark:text-orange-300",
        badgeBorder: "border-orange-500/40 dark:border-orange-600/50",
        dotColor: "bg-orange-500",
        pulse: true,
      };
    } else if (diffMs <= 0) {
      const isStillRunning = endDate
        ? now.getTime() <= endDate.getTime()
        : diffMs > -360 * 60 * 1000;

      if (isStillRunning) {
        urgentStatus = {
          label: "🔴 LIVE NOW — IN PROGRESS",
          badgeBg: "bg-emerald-500/15 dark:bg-emerald-950/50",
          badgeText: "text-emerald-700 dark:text-emerald-300",
          badgeBorder: "border-emerald-500/40 dark:border-emerald-600/50",
          dotColor: "bg-emerald-500",
          pulse: true,
        };
      } else {
        urgentStatus = {
          label: "⚪ COMPLETED TODAY",
          badgeBg: "bg-slate-100 dark:bg-slate-800",
          badgeText: "text-slate-600 dark:text-slate-400",
          badgeBorder: "border-slate-200 dark:border-slate-700",
          dotColor: "bg-slate-400",
          pulse: false,
        };
      }
    } else {
      urgentStatus = {
        label: "🔴 LIVE TODAY — PLACEMENT PRIORITY",
        badgeBg: "bg-rose-500/15 dark:bg-rose-950/50",
        badgeText: "text-rose-700 dark:text-rose-300",
        badgeBorder: "border-rose-500/40 dark:border-rose-600/50",
        dotColor: "bg-rose-500",
        pulse: true,
      };
    }
  } else if (isTomorrow) {
    urgentStatus = {
      label: "🔵 COMING TOMORROW",
      badgeBg: "bg-blue-500/10 dark:bg-blue-950/40",
      badgeText: "text-blue-700 dark:text-blue-300",
      badgeBorder: "border-blue-500/30 dark:border-blue-600/40",
      dotColor: "bg-blue-500",
      pulse: false,
    };
  } else {
    urgentStatus = {
      label: "🔵 UPCOMING PLACEMENT ACTIVITY",
      badgeBg: "bg-indigo-500/10 dark:bg-indigo-950/40",
      badgeText: "text-indigo-700 dark:text-indigo-300",
      badgeBorder: "border-indigo-500/30 dark:border-indigo-600/40",
      dotColor: "bg-indigo-500",
      pulse: false,
    };
  }

  // 2. Calculate Countdown Time Formatted
  let countdownFormatted: string | null = null;
  let state: PlacementCountdownResult["state"] = "countdown";

  if (diffMs > 0) {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      countdownFormatted = `${days}d : ${pad(remHours)}h : ${pad(mins)}m`;
      state = "upcoming_day";
    } else {
      countdownFormatted = `${pad(hours)}h : ${pad(mins)}m : ${pad(secs)}s`;
      state = "countdown";
    }
  } else {
    const isStillRunning = endDate
      ? now.getTime() <= endDate.getTime()
      : diffMs > -360 * 60 * 1000;

    if (isStillRunning) {
      countdownFormatted = "LIVE IN PROGRESS";
      state = "in_progress";
    } else {
      countdownFormatted = isDeadline ? "DEADLINE PASSED" : "ACTIVITY CONCLUDED";
      state = "ended";
    }
  }

  return {
    urgentStatus,
    countdownLabel,
    countdownFormatted,
    state,
    isToday,
    isTomorrow,
  };
}
