"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Bell,
  BellOff,
  Flame,
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface MyDayTimelineItem {
  id: string;
  timeline: "NOW" | "TODAY" | "UPCOMING";
  title: string;
  category: "Placement" | "Assignment" | "Opportunity" | "Personal" | "Academic";
  dueText: string;
  actionHref?: string;
  isPersonal?: boolean;
}

interface MyDaySectionProps {
  initialItems?: MyDayTimelineItem[];
}

const STORAGE_KEY_COMPLETED = "campushub_myday_completed_ids";
const STORAGE_KEY_CUSTOM = "campushub_myday_custom_tasks";
const STORAGE_KEY_SNOOZED = "campushub_myday_snoozed_ids";

export function MyDaySection({ initialItems }: MyDaySectionProps) {
  const [activeTab, setActiveTab] = React.useState<"NOW" | "TODAY" | "UPCOMING">("NOW");
  const [completedIds, setCompletedIds] = React.useState<string[]>([]);
  const [snoozedIds, setSnoozedIds] = React.useState<string[]>([]);
  const [customTasks, setCustomTasks] = React.useState<MyDayTimelineItem[]>([]);
  const [newTodoInput, setNewTodoInput] = React.useState("");
  const [showAddInput, setShowAddInput] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // Load local state
  React.useEffect(() => {
    try {
      const savedComp = localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (savedComp) setCompletedIds(JSON.parse(savedComp));

      const savedSnoozed = localStorage.getItem(STORAGE_KEY_SNOOZED);
      if (savedSnoozed) setSnoozedIds(JSON.parse(savedSnoozed));

      const savedCust = localStorage.getItem(STORAGE_KEY_CUSTOM);
      if (savedCust) setCustomTasks(JSON.parse(savedCust));
    } catch {
      // ignore
    }
  }, []);

  const defaultItems: MyDayTimelineItem[] = [
    {
      id: "myday-1",
      timeline: "NOW",
      title: "Review high-yield DSA patterns for today's placement drive",
      category: "Placement",
      dueText: "Live today • Immediate preparation",
      actionHref: "/placements/activities/act-today-1",
    },
    {
      id: "myday-2",
      timeline: "NOW",
      title: "Verify college ID card and print 2 ATS resume copies",
      category: "Placement",
      dueText: "Mandatory check-in requirements",
      actionHref: "/resume-builder",
    },
    {
      id: "myday-3",
      timeline: "TODAY",
      title: "CS304 Operating Systems Lab simulation upload",
      category: "Assignment",
      dueText: "Due by 11:59 PM tonight on Vedic.ai",
      actionHref: "/assignments",
    },
    {
      id: "myday-4",
      timeline: "TODAY",
      title: "JPMorgan Chase application window closes",
      category: "Opportunity",
      dueText: "Registration cutoff tonight",
      actionHref: "/opportunities/opp-3",
    },
    {
      id: "myday-5",
      timeline: "UPCOMING",
      title: "Amazon Web Services SDE intern deadline closes tomorrow",
      category: "Opportunity",
      dueText: "Tomorrow • 11:59 PM",
      actionHref: "/opportunities/opp-1",
    },
    {
      id: "myday-6",
      timeline: "UPCOMING",
      title: "Cisco Systems pre-placement talk in auditorium",
      category: "Placement",
      dueText: "In 3 days • 03:00 PM",
      actionHref: "/placements/activities/act-cisco-1",
    },
  ];

  const allItems = [...(initialItems || defaultItems), ...customTasks];

  const toggleComplete = (id: string) => {
    const isDone = completedIds.includes(id);
    const updated = isDone ? completedIds.filter((x) => x !== id) : [...completedIds, id];
    setCompletedIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(updated));
    } catch {}

    if (!isDone) {
      setFeedback("Marked completed in your personal checklist. Official records remain unchanged.");
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const toggleSnooze = (id: string) => {
    const isSnoozed = snoozedIds.includes(id);
    const updated = isSnoozed ? snoozedIds.filter((x) => x !== id) : [...snoozedIds, id];
    setSnoozedIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SNOOZED, JSON.stringify(updated));
    } catch {}

    setFeedback(isSnoozed ? "Reminder restored." : "Reminder snoozed for 4 hours.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;

    const newTask: MyDayTimelineItem = {
      id: `custom-${Date.now()}`,
      timeline: activeTab,
      title: newTodoInput.trim(),
      category: "Personal",
      dueText: `Added for ${activeTab.toLowerCase()}`,
      isPersonal: true,
    };

    const updated = [...customTasks, newTask];
    setCustomTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(updated));
    } catch {}

    setNewTodoInput("");
    setShowAddInput(false);
    setFeedback("Added personal task to My Day.");
    setTimeout(() => setFeedback(null), 2500);
  };

  const deleteCustomTask = (id: string) => {
    const updated = customTasks.filter((t) => t.id !== id);
    setCustomTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(updated));
    } catch {}
  };

  const filteredItems = allItems.filter(
    (item) => item.timeline === activeTab && !snoozedIds.includes(item.id)
  );

  return (
    <section
      aria-label="My Day Schedule and Personal Checklist"
      className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#161820] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all space-y-4"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              MY DAY
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                • Organized personal timeline & tasks
              </span>
            </h2>
          </div>
        </div>

        {/* Timeline Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1F222C] p-1 rounded-xl self-start sm:self-center">
          {(["NOW", "TODAY", "UPCOMING"] as const).map((tab) => {
            const count = allItems.filter(
              (i) => i.timeline === tab && !snoozedIds.includes(i.id)
            ).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white dark:bg-[#2A2E3B] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive
                      ? "bg-[#F59E0B] text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No items in your {activeTab.toLowerCase()} timeline. You're all caught up!
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = completedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isCompleted
                    ? "bg-slate-50/50 dark:bg-[#181A22]/50 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                    : "bg-slate-50/80 dark:bg-[#1D202A] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-[#F59E0B] transition-colors cursor-pointer shrink-0"
                    aria-label="Toggle task completion"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold ${
                          isCompleted
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.dueText}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.actionHref && (
                    <Link href={item.actionHref}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#F59E0B]"
                        rightIcon={<ArrowRight className="h-3 w-3" />}
                      >
                        View
                      </Button>
                    </Link>
                  )}

                  <button
                    onClick={() => toggleSnooze(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                    title="Snooze reminder"
                    aria-label="Snooze reminder"
                  >
                    <BellOff className="h-3.5 w-3.5" />
                  </button>

                  {item.isPersonal && (
                    <button
                      onClick={() => deleteCustomTask(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete personal task"
                      aria-label="Delete personal task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom To-Do Toggle & Form */}
      {showAddInput ? (
        <form onSubmit={handleAddCustomTask} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder={`Add a personal to-do for ${activeTab.toLowerCase()}...`}
            value={newTodoInput}
            onChange={(e) => setNewTodoInput(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1A1C24] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#F59E0B]"
            autoFocus
          />
          <Button size="sm" type="submit" className="rounded-xl text-xs font-bold bg-[#F59E0B] text-white">
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setShowAddInput(false)}
            className="rounded-xl text-xs font-semibold text-slate-500"
          >
            Cancel
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setShowAddInput(true)}
          className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:text-[#F59E0B] hover:border-[#F59E0B]/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add personal task to {activeTab.toLowerCase()}</span>
        </button>
      )}

      {/* Official Data Integrity Assurance Notice */}
      <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1">
        <ShieldCheck className="h-3 w-3 text-slate-400" />
        <span>Personal task actions only affect your private view. Official college records remain unaltered.</span>
      </div>
    </section>
  );
}
