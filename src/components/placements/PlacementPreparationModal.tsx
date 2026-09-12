"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  MapPin,
  Laptop,
  HelpCircle,
  ExternalLink,
  Zap,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Layers,
  Award,
} from "lucide-react";
import { PlacementActivityWithMatch } from "@/lib/placements/types";
import { Button } from "@/components/ui/Button";

interface PlacementPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: PlacementActivityWithMatch | null;
}

export function PlacementPreparationModal({
  isOpen,
  onClose,
  activity,
}: PlacementPreparationModalProps) {
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});

  // Reset or initialize state on activity change
  React.useEffect(() => {
    if (activity?.id) {
      setCheckedItems({});
    }
  }, [activity?.id]);

  if (!isOpen || !activity) return null;

  const match = activity.match;
  const plan = match?.preparationPlan;
  const isToday = plan?.timeContext === "today";

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Compute readiness percentage
  const totalTasks =
    (plan?.skillsToReview.length || 0) +
    (plan?.documentsAndGear.length || 0) +
    (plan?.conceptCheckpoints.length || 0);
  const completedTasks = Object.values(checkedItems).filter(Boolean).length;
  const readinessPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prep-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#15171E] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#1A1D26] dark:via-[#15171E] dark:to-[#1A1D26]">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#232733] border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-lg text-slate-800 dark:text-slate-100 shrink-0 shadow-2xs overflow-hidden">
              {activity.companyLogo ? (
                <img
                  src={activity.companyLogo}
                  alt={activity.companyName}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                activity.companyName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F59E0B]/20">
                  PERSONALIZED PREPARATION PLAN
                </span>
                {activity.packageCtc && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    {activity.packageCtc}
                  </span>
                )}
              </div>
              <h2
                id="prep-modal-title"
                className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 truncate mt-0.5"
              >
                {activity.companyName} — {activity.role}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 font-semibold text-[#F59E0B]">
                  <Clock className="h-3.5 w-3.5" /> {activity.startTime}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {activity.venue}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200 text-sm">
          {/* Readiness Tracker Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E222D] border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                Your Preparation Progress
              </span>
              <span className="text-[#F59E0B]">{readinessPercent}% Ready</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#F59E0B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {completedTasks} of {totalTasks} preparation checkpoints completed. Check off items as you prepare.
            </p>
          </div>

          {/* Time-Aware Guidance Banner */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border ${
              isToday
                ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
                : "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isToday ? (
                <Zap className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isToday
                      ? "text-rose-700 dark:text-rose-300"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {isToday ? "Today's Rapid Revision Strategy" : "Upcoming Activity Roadmap"}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {plan?.summary || match?.preparationGuidance}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 1: CORE SKILLS TO REVISE */}
          {plan?.skillsToReview && plan.skillsToReview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-[#F59E0B]" />
                  1. Core Skills to Review
                </h3>
                <span className="text-[10px] text-slate-400">CampusHub Guidance</span>
              </div>

              <div className="space-y-2">
                {plan.skillsToReview.map((item, idx) => {
                  const checkId = `skill-${idx}-${item.skill}`;
                  const isChecked = !!checkedItems[checkId];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(checkId)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80 text-slate-900 dark:text-slate-100"
                          : "bg-white dark:bg-[#1B1D25] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded-md text-[#F59E0B] focus:ring-0 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-extrabold ${
                              isChecked ? "line-through text-slate-400 dark:text-slate-500" : ""
                            }`}
                          >
                            {item.skill}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              item.category === "Strength"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {item.category === "Strength" ? "✓ Your Strength" : "⚠ Revision Focus"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.guidance}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: HIGH-YIELD CONCEPT CHECKPOINTS */}
          {plan?.conceptCheckpoints && plan.conceptCheckpoints.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#F59E0B]" />
                  2. High-Yield Concept Checkpoints
                </h3>
                <span className="text-[10px] text-slate-400">Essential Theory</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {plan.conceptCheckpoints.map((cp, idx) => {
                  const checkId = `concept-${idx}`;
                  const isChecked = !!checkedItems[checkId];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(checkId)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isChecked
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                          : "bg-white dark:bg-[#1B1D25] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-3.5 w-3.5 rounded-md text-[#F59E0B] focus:ring-0 cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <h5
                          className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${
                            isChecked ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {cp.topic}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {cp.keyTakeaway}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: CURATED PRACTICE QUESTIONS */}
          {plan?.practiceQuestions && plan.practiceQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-[#F59E0B]" />
                  3. Practice Questions & Interview Patterns
                </h3>
                <span className="text-[10px] text-slate-400">High-Frequency</span>
              </div>

              <div className="space-y-2">
                {plan.practiceQuestions.map((pq, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white dark:bg-[#1B1D25] border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {pq.question}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {pq.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                        pq.difficulty === "Easy"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : pq.difficulty === "Medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {pq.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: REQUIRED DOCUMENTS & TEST GEAR CHECKLIST */}
          {plan?.documentsAndGear && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#F59E0B]" />
                  4. Required Documents & Test Gear
                </h3>
                <span className="text-[10px] text-rose-500 font-bold">Mandatory</span>
              </div>

              <div className="space-y-1.5">
                {plan.documentsAndGear.map((doc, idx) => {
                  const checkId = `doc-${idx}-${doc.name}`;
                  const isChecked = !!checkedItems[checkId];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(checkId)}
                      className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80"
                          : "bg-white dark:bg-[#1B1D25] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded-md text-[#F59E0B] focus:ring-0 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${
                              isChecked ? "line-through text-slate-400" : ""
                            }`}
                          >
                            {doc.name}
                          </span>
                          {doc.required && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded-md">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {doc.note}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 5: OFFICIAL COMPANY & TPO INSTRUCTIONS */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 dark:border-amber-800/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Official Instructions from TPO (Mandatory)
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {plan?.officialRulesNotice || activity.instructions}
            </p>
          </div>

          {/* Separation Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141A] border border-slate-200/50 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-700 dark:text-slate-300">Policy Note: </span>
            Official eligibility cutoffs, venue, and test rules are established by {activity.companyName} and the Placement Office. Preparation checkpoints and suggestions are generated by CampusHub Mentorship.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#1A1D26]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/placements/activities/${activity.id}`}
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-bold"
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
            >
              View Full Drive Details
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-bold px-6 shadow-xs"
          >
            I'm Ready • Close Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
