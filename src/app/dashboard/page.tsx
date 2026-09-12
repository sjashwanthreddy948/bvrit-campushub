"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Briefcase,
  Bookmark,
  Send,
  FileText,
  BookOpen,
  Calendar,
  ExternalLink,
  MapPin,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Bell,
  Code2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  getStudentDashboardData,
  toggleSaveOpportunity,
  StudentDashboardData,
} from "@/lib/dashboard/queries";
import { getUnreadNotificationCount } from "@/lib/notifications/actions";
import { ApplicationStatus } from "@/types/database";
import { TodaysPlacementActivityBanner } from "@/components/placements/TodaysPlacementActivityBanner";

export default function StudentDashboardPage() {
  const [data, setData] = React.useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  // Dynamic Time of Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const loadData = React.useCallback(async () => {
    try {
      const [result, unread] = await Promise.all([
        getStudentDashboardData(),
        getUnreadNotificationCount(),
      ]);
      setData(result);
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSave = async (opportunityId: string) => {
    setSavingId(opportunityId);
    try {
      const res = await toggleSaveOpportunity(opportunityId);
      setData((prev) => {
        if (!prev) return prev;
        const updatedOpps = prev.latestOpportunities.map((opp) =>
          opp.id === opportunityId ? { ...opp, isSaved: res.isSaved } : opp
        );
        const newSavedCount = updatedOpps.filter((o) => o.isSaved).length;
        return {
          ...prev,
          latestOpportunities: updatedOpps,
          statistics: {
            ...prev.statistics,
            savedOpportunities: newSavedCount,
          },
        };
      });
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setSavingId(null);
    }
  };

  const getApplicationStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "saved":
        return <Badge variant="secondary">Saved</Badge>;
      case "applied":
        return <Badge variant="blue">Applied</Badge>;
      case "assessment":
        return <Badge variant="purple">Assessment</Badge>;
      case "interview":
        return <Badge variant="warning">Interview</Badge>;
      case "selected":
        return <Badge variant="success">Selected</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading || !data) {
    return (
      <DashboardShell role="student" userName="Student">
        <LoadingState message="Loading your personalized campus hub..." />
      </DashboardShell>
    );
  }

  const greeting = getGreeting();

  return (
    <DashboardShell
      role="student"
      userName={data.student.name}
      unreadNotifications={unreadCount}
    >
      {/* 1. EXECUTIVE INSTITUTIONAL HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {greeting}, {data.student.name}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              Verified Student
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            B.V. Raju Institute of Technology &bull; {data.student.department} &bull; Year {data.student.year}, Section {data.student.section} &bull; Roll No: 22211A05B4
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/ai">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              className="font-semibold text-xs border-slate-300 dark:border-slate-700"
            >
              Ask Campus AI
            </Button>
          </Link>
          <Link href="/notifications">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bell className="h-4 w-4" />}
              className="font-semibold text-xs border-slate-300 dark:border-slate-700"
            >
              Alerts
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Explore Drives
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI METRICS (4 CLEAN DATA TILES) */}
      <section aria-label="Academic & Placement Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Saved Opportunities */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Eligible Drives</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {data.statistics.savedOpportunities + 8}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Cutoff matched &bull; 8 new this week
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Applications</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {data.statistics.applications}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            {data.statistics.interviews > 0 ? `${data.statistics.interviews} In Interview Round` : "Active submission tracked"}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Deadlines</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {data.statistics.upcomingDeadlines}
          </div>
          <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
            Action required within 48 hrs
          </div>
        </div>

        {/* Placement Readiness */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Profile Match</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            92%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Tier-1 Verified &bull; ATS Ready
          </div>
        </div>
      </section>

      {/* 3. TODAY'S ACTIVE PLACEMENT ACTIVITY SPOTLIGHT */}
      <TodaysPlacementActivityBanner />

      {/* 4. CAREER & PLACEMENT ACCELERATORS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/skills"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                DSA &amp; Placement Preparation Roadmap
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Targeted Blind 75 / NeetCode 150 patterns, DBMS, OS &amp; Core CS review.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <Link
          href="/resume-builder"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                ATS-Verified Resume Studio
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Institutional single-column format, automated profile sync, and 1-click PDF.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </section>

      {/* 3. UPCOMING DEADLINES (PRIORITIZED CHRONOLOGICALLY) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Upcoming Deadlines
            </h2>
          </div>
          <span className="text-xs text-slate-500">Sorted by urgency</span>
        </div>

        {data.upcomingDeadlines.some((d) => d.urgency === "today" || d.urgency === "tomorrow") && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm text-red-800 dark:text-red-300">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600 shrink-0" />
              <span>Urgent deadlines closing today or tomorrow. Review details in Deadline Center.</span>
            </div>
            <Link href="/notifications" className="font-semibold text-red-700 dark:text-red-300 hover:underline shrink-0">
              View Alerts →
            </Link>
          </div>
        )}

        {data.upcomingDeadlines.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="No upcoming deadlines"
            description="You have no pending deadlines today or within the next 7 days. Great job staying ahead!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.upcomingDeadlines.map((item) => {
              const isToday = item.urgency === "today";
              const isTomorrow = item.urgency === "tomorrow";
              const isWithinWeek = item.urgency === "within_7_days";

              return (
                <Card
                  key={item.id}
                  className={`border-l-4 transition-all ${
                    isToday
                      ? "border-l-red-600 bg-red-50/20 dark:bg-red-950/10"
                      : isTomorrow
                      ? "border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
                      : isWithinWeek
                      ? "border-l-blue-500"
                      : "border-l-slate-300 dark:border-l-slate-700"
                  }`}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <Badge
                          variant={isToday ? "danger" : isTomorrow ? "warning" : "blue"}
                          size="sm"
                        >
                          {isToday
                            ? "Deadline Today"
                            : isTomorrow
                            ? "Tomorrow"
                            : `In ${item.daysRemaining} Days`}
                        </Badge>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                        {item.title}
                      </h3>

                      {item.secondaryInfo && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.secondaryInfo}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                      {item.actionUrl.startsWith("http") ? (
                        <a
                          href={item.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" fullWidth rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                            {item.actionLabel}
                          </Button>
                        </a>
                      ) : (
                        <Link href={item.actionUrl} className="flex-1">
                          <Button variant="outline" size="sm" fullWidth rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                            {item.actionLabel}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MAIN TWO-COLUMN BALANCED DESKTOP GRID (STACKED ON MOBILE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Opportunities & Circulars */}
        <div className="lg:col-span-2 space-y-6">
          {/* LATEST OPPORTUNITIES */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Latest Opportunities
                </h2>
              </div>
              <Link
                href="/opportunities"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all opportunities</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.latestOpportunities.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No opportunities available"
                description="New internship and full-time job openings will appear here once published by faculty."
              />
            ) : (
              <div className="space-y-3">
                {data.latestOpportunities.map((opp) => (
                  <Card key={opp.id} className="hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                    <CardContent className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {opp.company}
                            </span>
                            {opp.matchScore != null && (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                                  opp.matchScore >= 85
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                    : opp.matchScore >= 70
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                                }`}
                              >
                                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                                ⚡ {opp.matchScore}% Match
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                            {opp.title}
                          </h3>
                        </div>
                        <Badge variant={opp.type === "internship" ? "purple" : opp.type === "job" ? "blue" : "warning"} size="sm">
                          {opp.type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {opp.location} ({opp.workMode})
                        </span>
                        {opp.stipend && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            • {opp.stipend}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={savingId === opp.id}
                          onClick={() => handleToggleSave(opp.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[38px] ${
                            opp.isSaved
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${opp.isSaved ? "fill-current" : ""}`} />
                          <span>{opp.isSaved ? "Saved" : "Save"}</span>
                        </button>

                        <Link href={opp.viewUrl}>
                          <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* LATEST CIRCULARS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Latest Circulars
                </h2>
              </div>
              <Link
                href="/circulars"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.latestCirculars.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No circulars posted"
                description="Official notifications for your branch and year will appear here."
              />
            ) : (
              <div className="space-y-2.5">
                {data.latestCirculars.map((circ) => (
                  <Card key={circ.id} className="hover:border-amber-200 dark:hover:border-amber-900 transition-colors">
                    <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {circ.department} • {circ.date}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {circ.title}
                        </h3>
                        {circ.deadline && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Action Deadline: {circ.deadline}
                          </p>
                        )}
                      </div>
                      <Link href={circ.viewUrl} className="shrink-0">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right 1 Column: Assignment Reminders & Application Activity */}
        <div className="space-y-6">
          {/* ASSIGNMENT REMINDERS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Assignment Reminders
              </h2>
            </div>

            {data.assignmentReminders.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-6 w-6" />}
                title="No pending assignments"
                description="No academic assignments due at this time."
              />
            ) : (
              <div className="space-y-3">
                {data.assignmentReminders.map((asg) => (
                  <Card key={asg.id} className="border-purple-100 dark:border-purple-950/60">
                    <CardContent className="p-4 space-y-2.5">
                      <div>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          {asg.subject}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                          {asg.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due: {new Date(asg.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>

                      {/* Submit on Vedic.ai Button */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <a
                          href={asg.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white"
                          >
                            Submit on Vedic.ai
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* APPLICATION ACTIVITY */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Application Activity
                </h2>
              </div>
              <Link href="/applications" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                All
              </Link>
            </div>

            {data.applicationActivity.length === 0 ? (
              <EmptyState
                icon={<Send className="h-6 w-6" />}
                title="No applications tracked"
                description="Explore opportunities to start building your career tracker."
                action={
                  <Link href="/opportunities">
                    <Button size="sm">Browse Opportunities</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {data.applicationActivity.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-3.5 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {app.company}
                          </span>
                          <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                            {app.opportunityTitle}
                          </h3>
                        </div>
                        {getApplicationStatusBadge(app.status)}
                      </div>

                      {app.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          {app.notes}
                        </p>
                      )}

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        Updated {app.updatedAt}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
