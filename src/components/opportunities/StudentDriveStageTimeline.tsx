"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StudentDriveStageView, MatchTier } from "@/lib/tpo/types";

interface StudentDriveStageTimelineProps {
  stageView: StudentDriveStageView;
}

export function StudentDriveStageTimeline({ stageView }: StudentDriveStageTimelineProps) {
  const { match, rounds, currentRoundIndex, studentStatus, driveStatus } = stageView;

  const getTierColor = (tier: MatchTier) => {
    switch (tier) {
      case "Strong Match":
        return {
          bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "Potential Match":
        return {
          bg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
          icon: Sparkles,
        };
      case "Requirements Not Fully Matched":
        return {
          bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
          icon: AlertTriangle,
        };
      case "Unable to Determine":
      default:
        return {
          bg: "bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
          icon: HelpCircle,
        };
    }
  };

  const tierStyle = getTierColor(match.tier);
  const TierIcon = tierStyle.icon;

  return (
    <div className="space-y-4">
      {/* 4-Tier Match Assessment Box */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Eligibility &amp; Match Rating
              </span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                {match.score}% Score
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${tierStyle.bg}`}
            >
              <TierIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{match.tier}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {match.explanation}
          </p>

          {/* Criteria Checklist Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {match.criteriaBreakdown.departmentMatch ? "✅ Eligible" : "⚠️ Alternate Cohort"}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Grad Year</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {match.criteriaBreakdown.yearMatch ? "✅ Eligible" : "⚠️ Targeted Year"}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">CGPA Cutoff</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {match.criteriaBreakdown.cgpaMatch ? "✅ Clears Cutoff" : "❌ Below Threshold"}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Skill Alignment</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {match.criteriaBreakdown.skillsMatchPercentage}% Matches
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Multi-Round Stages & Individual Progress */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Placement Drive Stage Progress
              </h3>
              <p className="text-xs text-slate-500">
                Current Drive Stage: <span className="font-bold text-[#F59E0B]">{driveStatus}</span>
              </p>
            </div>

            {/* Student Individual Status */}
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Your Status</span>
              <Badge
                variant="amber"
                className="text-xs font-semibold px-2 py-0.5"
              >
                {studentStatus}
              </Badge>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-3">
            {rounds.map((round, idx) => {
              const isCurrent = idx === currentRoundIndex;
              const isCompleted = round.status === "Completed";
              const isCleared = round.isStudentCleared;
              const isInvited = round.isStudentInvited;

              return (
                <div
                  key={round.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                    isCurrent
                      ? "bg-[#FFF0EE] dark:bg-[#F59E0B]/10 border-[#F59E0B]/40 text-slate-900 dark:text-slate-100"
                      : isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/20 text-slate-700 dark:text-slate-300"
                      : "bg-slate-50 dark:bg-[#1B1C22] border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Clock className="h-4 w-4 text-[#F59E0B] animate-pulse" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-400">
                        {round.roundNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">
                        Round {round.roundNumber}: {round.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {round.status}
                      </span>
                    </div>

                    {round.scheduledAt && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3 inline" />
                        <span>{new Date(round.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      </p>
                    )}

                    {/* Individual clearance note */}
                    {isCurrent && isInvited && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        <UserCheck className="h-3 w-3" />
                        <span>You are shortlisted for this round</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
