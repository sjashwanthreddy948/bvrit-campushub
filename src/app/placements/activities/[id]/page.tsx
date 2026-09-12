"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Share2,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Video,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlacementActivityWithMatch } from "@/lib/placements/types";
import { getPlacementActivityByIdAction } from "@/lib/placements/actions";

export default function PlacementActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params?.id as string;

  const [activity, setActivity] = React.useState<PlacementActivityWithMatch | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activityId) return;

    let isMounted = true;
    setLoading(true);
    getPlacementActivityByIdAction(activityId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.activity) {
          setActivity(res.activity);
        } else {
          setError(res.error || "Placement activity not found.");
        }
      })
      .catch((err) => {
        if (isMounted) setError("Failed to load activity details.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activityId]);

  if (loading) {
    return (
      <DashboardShell role="student" userName="Student">
        <div className="max-w-4xl mx-auto py-12">
          <LoadingState message="Loading official placement activity details & match analysis..." />
        </div>
      </DashboardShell>
    );
  }

  if (error || !activity) {
    return (
      <DashboardShell role="student" userName="Student">
        <div className="max-w-4xl mx-auto py-12">
          <EmptyState
            title="Activity Not Found"
            description={error || "The requested placement activity could not be found or has restricted access."}
            action={
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            }
          />
        </div>
      </DashboardShell>
    );
  }

  const match = activity.match;
  const isToday = activity.date === new Date().toISOString().slice(0, 10);

  const formattedDate = new Date(activity.date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors py-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/placements/activities"
              className="text-xs font-semibold text-[#F59E0B] hover:underline"
            >
              All Placement Activities
            </Link>
          </div>
        </div>

        {/* 1. HERO HEADER: COMPANY INFORMATION & ACTIVITY BADGE */}
        <div className="w-full rounded-3xl bg-white dark:bg-[#1B1C22] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 dark:bg-[#2A2B33] border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xl sm:text-2xl text-slate-800 dark:text-slate-100 shrink-0 overflow-hidden shadow-2xs">
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

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isToday ? (
                    <Badge variant="amber" className="font-extrabold animate-pulse">
                      TODAY'S ACTIVITY
                    </Badge>
                  ) : (
                    <Badge variant="powder">Upcoming Schedule</Badge>
                  )}
                  <Badge variant="secondary">{activity.activityType}</Badge>
                  <span className="text-xs font-semibold text-slate-500">{activity.employmentType}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {activity.companyName}
                </h1>

                <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {activity.role}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                  {activity.packageCtc && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      💰 {activity.packageCtc}
                    </span>
                  )}
                  {activity.stipend && (
                    <span className="text-slate-600 dark:text-slate-300">
                      Stipend: {activity.stipend}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {activity.location} ({activity.workMode})
                  </span>
                  {activity.companyWebsite && (
                    <a
                      href={activity.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#F59E0B] hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Official Site
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Match summary Pill & Apply Link */}
            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              {match && (
                <div className="text-left sm:text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border ${getMatchBadgeStyles(
                      match.tier
                    )}`}
                  >
                    <Zap className="h-3.5 w-3.5" /> {match.score}% • {match.tier}
                  </span>
                </div>
              )}

              {activity.registrationLink && (
                <a
                  href={activity.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold px-5"
                    rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                  >
                    Open Registration Link
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 2-COLUMN GRID: DETAILS & ELIGIBILITY vs MATCH & PREP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: SCHEDULE, ELIGIBILITY, SKILLS (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* SCHEDULE CARD */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#F59E0B]" />
                  Schedule &amp; Venue
                </CardTitle>
                <CardDescription className="text-xs">
                  Official timing and coordinates for this placement activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#202129]">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Date</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
                      {formattedDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Timing</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {activity.startTime} {activity.endTime ? `- ${activity.endTime}` : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Venue</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#F59E0B] shrink-0" />
                    {activity.venue}
                  </p>
                </div>

                {activity.meetingLink && (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
                    <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 mb-1">
                      <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Online Session / Meeting Link
                    </span>
                    <a
                      href={activity.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline break-all"
                    >
                      {activity.meetingLink}
                    </a>
                  </div>
                )}

                {activity.selectionRounds.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2">Selection Rounds</span>
                    <div className="space-y-1.5">
                      {activity.selectionRounds.map((round, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#1B1C22] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center text-[10px] font-black shrink-0">
                            {idx + 1}
                          </span>
                          <span>{round}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activity.instructions && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Official Instructions</span>
                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      {activity.instructions}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OFFICIAL ELIGIBILITY CARD */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  Official Eligibility Criteria
                </CardTitle>
                <CardDescription className="text-xs">
                  Academic prerequisites mandated by {activity.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202129]">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Target Branches</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {activity.eligibleDepartments.join(", ")}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202129]">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Eligible Years</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {activity.eligibleYears.map((y) => `${y}th Year`).join(", ")}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202129]">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Cutoff CGPA</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {activity.minCgpa.toFixed(1)}+
                    </span>
                  </div>
                </div>

                {activity.otherRequirements && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202129] text-xs">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Additional Requirements</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {activity.otherRequirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SKILLS SECTION: CLEARLY SEPARATED REQUIRED, PREFERRED, PREPARATION */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  Skills Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Clearly distinguished official requirements and preparation priorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* 1. Required Skills */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    Required Skills (Official Prerequisite)
                  </span>
                  <div className="flex items-center gap-2 flex-wrap pl-3.5">
                    {activity.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Preferred Skills */}
                {activity.preferredSkills.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      Preferred Skills (Bonus Alignment)
                    </span>
                    <div className="flex items-center gap-2 flex-wrap pl-3.5">
                      {activity.preferredSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Important Skills for Preparation */}
                {activity.importantPreparationSkills.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      Important Skills for Preparation
                    </span>
                    <div className="flex items-center gap-2 flex-wrap pl-3.5">
                      {activity.importantPreparationSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: YOUR MATCH & PREPARATION GUIDANCE (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* YOUR MATCH CARD */}
            {match && (
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white dark:from-[#202129] dark:to-[#1B1C22]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#F59E0B]" />
                      YOUR MATCH
                    </CardTitle>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getMatchBadgeStyles(
                        match.tier
                      )}`}
                    >
                      {match.tier}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Deterministic comparison with your student profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                  {/* Matching Requirements */}
                  {match.matchingRequirements.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        You Currently Match:
                      </span>
                      <div className="space-y-1.5">
                        {match.matchingRequirements.map((req, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-slate-700 dark:text-slate-200 font-medium"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Information */}
                  {match.missingInformation.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                        Information Missing:
                      </span>
                      <div className="space-y-1.5">
                        {match.missingInformation.map((info, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-amber-800 dark:text-amber-300 font-medium"
                          >
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>{info}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements not currently matched */}
                  {match.unmatchedRequirements.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                        Requirements Not Currently Matched:
                      </span>
                      <div className="space-y-1.5">
                        {match.unmatchedRequirements.map((unm, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-rose-800 dark:text-rose-300 font-medium"
                          >
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>{unm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas to improve */}
                  {match.areasToImprove.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Areas to Improve:
                      </span>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 font-medium">
                        {match.areasToImprove.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mandatory Official Disclaimer */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202129] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    {match.verifiedDisclaimer}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* HOW TO PREPARE FOR THIS ACTIVITY (CAMPUSHUB AI MENTOR) */}
            {match && (
              <Card className="border-[#F59E0B]/30 dark:border-[#F59E0B]/30 bg-gradient-to-b from-[#FFF5F4]/40 to-white dark:from-[#231A1B]/40 dark:to-[#1B1C22] shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                        HOW TO PREPARE FOR THIS ACTIVITY
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Practical mentorship advice from CampusHub Senior AI
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed">
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {match.preparationGuidance}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Tailored for: {activity.activityType}</span>
                    <Link href="/ai" className="text-[#F59E0B] hover:underline font-semibold">
                      Ask CampusHub AI →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function getMatchBadgeStyles(tier: string): string {
  switch (tier) {
    case "Strong Match":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    case "Good Match":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    case "Partial Match":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    case "Requirements Not Fully Matched":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800";
  }
}
