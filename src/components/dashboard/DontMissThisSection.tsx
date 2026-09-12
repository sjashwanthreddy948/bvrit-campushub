"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  Bell,
  CheckCircle2,
  Bookmark,
  Building,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface SmartReminderItem {
  id: string;
  type: "saved_closing_soon" | "eligible_unregistered" | "assignment_approaching";
  title: string;
  message: string;
  companyOrCourse: string;
  deadlineText: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionHref: string;
}

interface DontMissThisSectionProps {
  initialReminders?: SmartReminderItem[];
}

const STORAGE_KEY_DISMISSED = "campushub_dismissed_smart_reminders";

export function DontMissThisSection({ initialReminders }: DontMissThisSectionProps) {
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISMISSED);
      if (saved) setDismissedIds(JSON.parse(saved));
    } catch {}
  }, []);

  const defaultReminders: SmartReminderItem[] = [
    {
      id: "remind-1",
      type: "saved_closing_soon",
      title: "Amazon Web Services (AWS) — SDE Summer Intern",
      message: "You saved this opportunity and the official application deadline closes tomorrow at 11:59 PM.",
      companyOrCourse: "Amazon Web Services",
      deadlineText: "Closing Tomorrow",
      primaryActionLabel: "Apply Now",
      primaryActionHref: "https://amazon.jobs",
      secondaryActionHref: "/opportunities/opp-1",
    },
    {
      id: "remind-2",
      type: "eligible_unregistered",
      title: "Microsoft India — Software Engineer (SDE-1)",
      message: "Your profile matches 95% of required criteria (CSE • CGPA 8.42), but you have not registered for today's placement drive.",
      companyOrCourse: "Microsoft India",
      deadlineText: "Live Today • 10:00 AM",
      primaryActionLabel: "View Placement Drive",
      primaryActionHref: "/placements/activities/act-today-1",
      secondaryActionHref: "/placements/activities/act-today-1",
    },
    {
      id: "remind-3",
      type: "assignment_approaching",
      title: "Operating Systems: CPU Scheduling Simulation",
      message: "Your course assignment on Vedic.ai is approaching its submission deadline within 48 hours.",
      companyOrCourse: "Dept of CSE • Prof. K. Sharma",
      deadlineText: "Due in 2 days",
      primaryActionLabel: "Submit on Vedic.ai",
      primaryActionHref: "/assignments",
      secondaryActionHref: "/assignments",
    },
  ];

  const reminders = initialReminders || defaultReminders;
  const activeReminders = reminders.filter((r) => !dismissedIds.includes(r.id));

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(updated));
    } catch {}
    setToastMessage("Reminder dismissed for your account. Official records are unchanged.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemindMe = (reminder: SmartReminderItem) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("CampusHub Reminder", {
          body: `${reminder.title}: ${reminder.deadlineText}`,
          icon: "/favicon.ico",
        });
      }
    }
    setToastMessage(`Reminder scheduled: ${reminder.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (activeReminders.length === 0) return null;

  return (
    <section
      aria-label="Don't Miss This - Smart Opportunity Prevention"
      className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/5 via-white to-amber-500/5 dark:from-[#211B14] dark:via-[#161820] dark:to-[#211B14] border border-amber-500/30 dark:border-amber-500/30 p-4 sm:p-5 shadow-xs transition-all space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-amber-200/50 dark:border-amber-900/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              DON'T MISS THIS
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/40">
                Action Recommended
              </span>
            </h2>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {activeReminders.length} important reminder{activeReminders.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in duration-150">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reminder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {activeReminders.map((reminder) => (
          <div
            key={reminder.id}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1D202A] border border-amber-500/20 dark:border-amber-500/30 flex flex-col justify-between gap-3 hover:shadow-xs transition-all"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200">
                  {reminder.deadlineText}
                </span>

                <button
                  onClick={() => handleDismiss(reminder.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Dismiss reminder"
                  aria-label="Dismiss reminder"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {reminder.title}
              </h3>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {reminder.message}
              </p>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {reminder.primaryActionHref.startsWith("http") ? (
                  <a
                    href={reminder.primaryActionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      className="w-full rounded-xl text-xs font-bold bg-[#F59E0B] hover:bg-[#D97706] text-white"
                      rightIcon={<ArrowRight className="h-3 w-3" />}
                    >
                      {reminder.primaryActionLabel}
                    </Button>
                  </a>
                ) : (
                  <Link href={reminder.primaryActionHref} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full rounded-xl text-xs font-bold bg-[#F59E0B] hover:bg-[#D97706] text-white"
                      rightIcon={<ArrowRight className="h-3 w-3" />}
                    >
                      {reminder.primaryActionLabel}
                    </Button>
                  </Link>
                )}

                <Link href={reminder.secondaryActionHref}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-[11px] font-semibold"
                  >
                    Details
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <button
                  onClick={() => handleRemindMe(reminder)}
                  className="hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Bell className="h-3 w-3" />
                  <span>Remind Me</span>
                </button>

                <button
                  onClick={() => handleDismiss(reminder.id)}
                  className="hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
