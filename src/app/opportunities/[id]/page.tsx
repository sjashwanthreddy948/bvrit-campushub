"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  IndianRupee,
  Share2,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Laptop,
  Sparkles,
  User,
  RotateCcw,
  ShieldAlert,
  Bot,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApplyPreparationModal } from "@/components/opportunities/ApplyPreparationModal";
import { AskAiModal } from "@/components/opportunities/AskAiModal";
import {
  getOpportunityById,
  saveOpportunity,
  unsaveOpportunity,
  trackApplication,
  OpportunityCardData,
} from "@/lib/opportunities/actions";
import { prepareApplicationData } from "@/lib/profile/actions";
import { ApplicationPreparationData } from "@/lib/profile/types";
import { calculateOpportunityMatch } from "@/lib/matching/actions";
import { MatchingResult } from "@/lib/matching/types";
import { getWhatsAppShareUrl } from "@/lib/utils";
import { getStudentDriveViewAction } from "@/lib/tpo/actions";
import { StudentDriveStageView } from "@/lib/tpo/types";
import { StudentDriveStageTimeline } from "@/components/opportunities/StudentDriveStageTimeline";

export default function OpportunityDetailsPage() {
  const params = useParams();
  const id = (params?.id as string) || "opp-1";

  const [opp, setOpp] = React.useState<OpportunityCardData | null>(null);
  const [stageView, setStageView] = React.useState<StudentDriveStageView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ text: string; type: "success" | "info" } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [applying, setApplying] = React.useState(false);

  // Application Preparation Modal State
  const [isPrepModalOpen, setIsPrepModalOpen] = React.useState(false);
  const [prepData, setPrepData] = React.useState<ApplicationPreparationData | null>(null);

  // AI Opportunity Matching State
  const [matchLoading, setMatchLoading] = React.useState(false);
  const [matchResult, setMatchResult] = React.useState<MatchingResult | null>(null);
  const [matchError, setMatchError] = React.useState<string | null>(null);
  const [isAskAiOpen, setIsAskAiOpen] = React.useState(false);


  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [data, stageData, matchRes] = await Promise.all([
        getOpportunityById(id),
        getStudentDriveViewAction(id),
        calculateOpportunityMatch(id).catch(() => null),
      ]);
      setOpp(data);
      setStageView(stageData);
      if (matchRes && matchRes.success && matchRes.result) {
        setMatchResult(matchRes.result);
      }
    } catch (err) {
      console.error("Failed to load opportunity:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSave = async () => {
    if (!opp) return;
    setSaving(true);
    try {
      if (opp.isSaved) {
        const res = await unsaveOpportunity(opp.id);
        setOpp({ ...opp, isSaved: false });
        setFeedback({ text: res.message, type: "info" });
      } else {
        const res = await saveOpportunity(opp.id);
        setOpp({ ...opp, isSaved: true });
        setFeedback({ text: res.message, type: "success" });
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ text: "Unable to update save status.", type: "info" });
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!opp) return;
    if (opp.isClosed) return;

    setApplying(true);
    try {
      const data = await prepareApplicationData(opp.id);
      if (data) {
        setPrepData(data);
        setIsPrepModalOpen(true);
      } else if (opp.application_url) {
        window.open(opp.application_url, "_blank", "noopener,noreferrer");
      }
    } catch {
      setFeedback({ text: "Unable to load application preparation data.", type: "info" });
    } finally {
      setApplying(false);
    }
  };

  const handleOpenPreparation = async () => {
    if (!opp) return;
    try {
      const data = await prepareApplicationData(opp.id);
      if (data) {
        setPrepData(data);
        setIsPrepModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to open preparation modal:", err);
    }
  };

  const handleRefreshPrepData = async () => {
    if (!opp) return;
    const data = await prepareApplicationData(opp.id);
    if (data) {
      setPrepData(data);
    }
  };

  const handleAppliedSuccess = () => {
    if (opp) {
      setOpp({ ...opp, applicationStatus: "applied" });
      setFeedback({
        text: "Application tracked in CampusHub! External portal opened in a new tab.",
        type: "success",
      });
      setTimeout(() => setFeedback(null), 5000);
    }
  };


  const handleShare = () => {
    if (!opp) return;
    const url = getWhatsAppShareUrl(
      opp.title,
      opp.company,
      opp.deadline,
      typeof window !== "undefined" ? window.location.href : ""
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCheckMatch = async () => {
    if (!opp) return;
    setMatchLoading(true);
    setMatchError(null);

    try {
      const res = await calculateOpportunityMatch(opp.id);
      if (res.success && res.result) {
        setMatchResult(res.result);
      } else {
        setMatchError(res.error || "Unable to evaluate match.");
      }
    } catch (err: any) {
      setMatchError(err?.message || "An unexpected error occurred during match evaluation.");
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell role="student" userName="Alex Johnson">
        <LoadingState message="Loading opportunity details..." />
      </DashboardShell>
    );
  }

  if (!opp) {
    return (
      <DashboardShell role="student" userName="Alex Johnson">
        <div className="text-center py-12 space-y-4">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Opportunity Not Found
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            This opportunity listing might have been removed or expired.
          </p>
          <Link href="/opportunities">
            <Button variant="outline" size="sm">
              Back to Opportunities
            </Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const isClosed = opp.isClosed;
  const hasApplied = !!opp.applicationStatus;

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors min-h-[44px] py-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={handleToggleSave}
            leftIcon={<Bookmark className={`h-4 w-4 ${opp.isSaved ? "fill-current text-blue-600" : ""}`} />}
            className="min-h-[40px]"
          >
            {opp.isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* STRUCTURED OPPORTUNITY DETAILS */}
      <div className="space-y-4 max-w-3xl pb-24 md:pb-6">
        <Card className={isClosed ? "border-red-200 dark:border-red-900/50" : ""}>
          <CardContent className="p-4 sm:p-6 space-y-5">
            {/* Header: Company, Role & Status Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                  <Building className="h-4 w-4" />
                  <span>{opp.company}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                    (opp.matchScore ?? 85) >= 85
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : (opp.matchScore ?? 85) >= 70
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  ⚡ {opp.matchScore ?? 85}% Match • {opp.matchCategory || "Strong Match"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {opp.title}
              </h1>
            </div>

            {/* Deadline Urgency Callout */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-medium ${
                isClosed
                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                  : opp.daysRemaining <= 1
                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                  : opp.daysRemaining <= 7
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                  : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Application Deadline: </strong>
                  {new Date(opp.deadline).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Badge
                variant={isClosed || opp.daysRemaining <= 1 ? "danger" : opp.daysRemaining <= 7 ? "warning" : "default"}
                size="sm"
              >
                {isClosed
                  ? "Closed"
                  : opp.daysRemaining === 0
                  ? "Deadline Today"
                  : opp.daysRemaining === 1
                  ? "Deadline Tomorrow"
                  : `In ${opp.daysRemaining} days`}
              </Badge>
            </div>

            {/* Logistics: Location, Work Mode, Stipend, Package */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Location</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {opp.location}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                  <Laptop className="h-3.5 w-3.5" />
                  <span>Work Mode</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {opp.work_mode}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 mb-0.5">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>Stipend / Package</span>
                </div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  {opp.stipend || opp.package || "As per norms"}
                </p>
              </div>
            </div>

            {/* TPO Placement Drive Stage Progress & 4-Tier Match */}
            {stageView && (
              <StudentDriveStageTimeline stageView={stageView} />
            )}

            {/* ========================================================================= */}
            {/* ========================================================================= */}
            {/* YOUR MATCH SECTION */}
            {/* ========================================================================= */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/60 to-indigo-50/30 dark:from-blue-950/30 dark:to-indigo-950/20 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Your Match
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                        Advisory
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Deterministic comparison of your verified profile against official requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full border shadow-2xs ${
                      (matchResult?.matchScore ?? opp.matchScore ?? 85) >= 85
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : (matchResult?.matchScore ?? opp.matchScore ?? 85) >= 70
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    ⚡ {matchResult?.matchScore ?? opp.matchScore ?? 85}% Match
                  </span>
                  <Badge
                    variant={
                      (matchResult?.matchCategory || opp.matchCategory) === "Strong Match"
                        ? "success"
                        : (matchResult?.matchCategory || opp.matchCategory) === "Good Match"
                        ? "blue"
                        : (matchResult?.matchCategory || opp.matchCategory) === "Partial Match"
                        ? "warning"
                        : (matchResult?.matchCategory || opp.matchCategory) === "Requirements Not Fully Matched"
                        ? "danger"
                        : "secondary"
                    }
                    size="md"
                    className="font-bold text-xs sm:text-sm px-3 py-1"
                  >
                    {matchResult?.matchCategory || opp.matchCategory || "Strong Match"}
                  </Badge>
                </div>
              </div>

              {/* Visual Match Percentage Meter */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Overall Profile Alignment
                  </span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {matchResult?.matchScore ?? opp.matchScore ?? 85}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (matchResult?.matchScore ?? opp.matchScore ?? 85) >= 85
                        ? "bg-emerald-500"
                        : (matchResult?.matchScore ?? opp.matchScore ?? 85) >= 70
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${matchResult?.matchScore ?? opp.matchScore ?? 85}%` }}
                  />
                </div>
              </div>

              {!matchResult && !matchLoading && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Detailed skills breakdown is ready to calculate against your verified profile.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCheckMatch}
                    leftIcon={<Sparkles className="h-4 w-4" />}
                    className="min-h-[40px] shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    Recalculate match
                  </Button>
                </div>
              )}

              {matchLoading && (
                <div className="py-4 text-center space-y-2">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Comparing your profile with official requirements...
                  </p>
                </div>
              )}

              {matchError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{matchError}</span>
                </div>
              )}

              {matchResult && (
                <div className="space-y-4 pt-1">
                  {/* Short AI Explanation */}
                  <div className="p-3.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>CampusHub AI Summary</span>
                    </div>
                    <p>{matchResult.aiExplanation}</p>
                  </div>

                  {/* Skills Breakdown (Matching vs Missing Required vs Missing Preferred) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Matching Skills */}
                    <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Matching skills ({matchResult.matchingSkills.length})
                      </span>
                      {matchResult.matchingSkills.length === 0 ? (
                        <p className="text-xs text-slate-500">None currently matching</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {matchResult.matchingSkills.map((m) => (
                            <span
                              key={m}
                              className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Missing Skills */}
                    <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Missing skills
                      </span>
                      <div className="space-y-1">
                        {matchResult.missingRequiredSkills.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase block">
                              Required:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {matchResult.missingRequiredSkills.map((g) => (
                                <span
                                  key={g}
                                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {matchResult.missingPreferredSkills.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                              Preferred:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {matchResult.missingPreferredSkills.map((g) => (
                                <span
                                  key={g}
                                  className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {matchResult.missingRequiredSkills.length === 0 && matchResult.missingPreferredSkills.length === 0 && (
                          <p className="text-xs text-slate-500">No skill gaps identified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Summary Checklist */}
                  <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      Eligibility Requirements Summary
                    </span>
                    <div className="space-y-1 text-xs">
                      {matchResult.satisfiedRequirements.map((r) => (
                        <div key={r} className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}

                      {matchResult.unsatisfiedRequirements.map((r) => (
                        <div key={r} className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}

                      {matchResult.missingInfoRequirements.map((r) => (
                        <div key={r} className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ask AI CTA & Profile Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/40">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAskAiOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium min-h-[44px]"
                      leftIcon={<Bot className="h-4 w-4" />}
                    >
                      Ask CampusHub AI about this opportunity
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCheckMatch}
                        disabled={matchLoading}
                        leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        className="min-h-[44px]"
                      >
                        Re-check
                      </Button>

                      <Link href="/profile">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={<User className="h-3.5 w-3.5" />}
                          className="min-h-[44px]"
                        >
                          Update profile
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Mandatory Advisory Disclaimer */}
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>Please verify the official opportunity requirements before applying.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Eligibility Requirements
              </h2>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {opp.eligibility}
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {opp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Opportunity Description
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {opp.description}
              </p>
            </div>

            {/* Application Information Disclaimer */}
            <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <strong>Application Note:</strong> When you click Apply, CampusHub records your application in your personal tracker and opens the official external careers portal in a new tab.
              </p>
            </div>

            {/* Desktop Action Buttons Bar */}
            <div className="hidden md:flex items-center justify-between gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={handleToggleSave}
                  leftIcon={<Bookmark className={`h-4 w-4 ${opp.isSaved ? "fill-current text-blue-600" : ""}`} />}
                >
                  {opp.isSaved ? "Saved" : "Save Opportunity"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  leftIcon={<Share2 className="h-4 w-4" />}
                >
                  Share on WhatsApp
                </Button>
              </div>

              {isClosed ? (
                <Button variant="secondary" disabled>
                  Applications Closed
                </Button>
              ) : hasApplied ? (
                <div className="flex items-center gap-2">
                  <Badge variant="success">Applied (Tracked)</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenPreparation}
                    leftIcon={<Sparkles className="h-3.5 w-3.5 text-blue-600" />}
                  >
                    Preparation & Copy Tools
                  </Button>
                  <a
                    href={opp.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                      Revisit Portal
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    rightIcon={<ExternalLink className="h-4 w-4" />}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px]"
                  >
                    {applying ? "Preparing Details..." : "Prepare & Apply"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Sticky Bottom Apply Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shadow-lg">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <Button
            variant="outline"
            disabled={saving}
            onClick={handleToggleSave}
            className="px-3 min-h-[44px]"
            aria-label="Save"
          >
            <Bookmark className={`h-4 w-4 ${opp.isSaved ? "fill-current text-blue-600" : ""}`} />
          </Button>

          {isClosed ? (
            <Button variant="secondary" disabled fullWidth className="min-h-[44px]">
              Applications Closed
            </Button>
          ) : hasApplied ? (
            <div className="flex items-center gap-2 w-full">
              <Badge variant="success" className="whitespace-nowrap">
                Applied
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPreparation}
                className="min-h-[44px] flex-1 text-xs"
              >
                Copy Tools
              </Button>
              <a
                href={opp.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" size="sm" fullWidth className="min-h-[44px] text-xs" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Revisit
                </Button>
              </a>
            </div>
          ) : (
            <Button
              onClick={handleApply}
              disabled={applying}
              fullWidth
              className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
              rightIcon={<ExternalLink className="h-4 w-4" />}
            >
              {applying ? "Preparing..." : "Prepare & Apply"}
            </Button>
          )}
        </div>
      </div>

      {/* Reusable Application Preparation Modal */}
      <ApplyPreparationModal
        isOpen={isPrepModalOpen}
        onClose={() => setIsPrepModalOpen(false)}
        prepData={prepData}
        onApplied={handleAppliedSuccess}
        onRefreshPrepData={handleRefreshPrepData}
      />

      {/* CampusHub AI Assistant Modal */}
      {opp && (
        <AskAiModal
          isOpen={isAskAiOpen}
          onClose={() => setIsAskAiOpen(false)}
          opportunityId={opp.id}
          opportunityTitle={opp.title}
          company={opp.company}
        />
      )}
    </DashboardShell>
  );
}

