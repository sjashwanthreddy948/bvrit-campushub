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
import { PillTag } from "@/components/ui/PillTag";
import {
  TeamworkLaptopIllustration,
  CafeDiscussionIllustration,
} from "@/components/illustrations/CollegiateScenes";
import { ApplicationStatus } from "@/types/database";
import { TodaysPlacementActivityBanner } from "@/components/placements/TodaysPlacementActivityBanner";
import { TodaysFocus, FocusActionItem } from "@/components/dashboard/TodaysFocus";
import { MyDaySection } from "@/components/dashboard/MyDaySection";
import { DontMissThisSection } from "@/components/dashboard/DontMissThisSection";

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

  const focusItems: FocusActionItem[] = [
    {
      id: "focus-1",
      category: "drive",
      icon: "rocket",
      title: "Today's Placement Activity",
      subtitle: "Microsoft India & AWS assessment scheduled today • Review preparation plan",
      urgencyLabel: "Drive Today",
      urgencyColor: "rose",
      actionLabel: "View Placement Drive",
      actionHref: "/placements/activities/act-today-1",
    },
    {
      id: "focus-2",
      category: "assignment",
      icon: "book",
      title: "CS304 Operating Systems Lab Submission",
      subtitle: "Simulation upload due tonight before 11:59 PM on Vedic.ai portal",
      urgencyLabel: "Due Today",
      urgencyColor: "amber",
      actionLabel: "Submit Coursework",
      actionHref: "/assignments",
    },
    {
      id: "focus-3",
      category: "opportunity",
      icon: "briefcase",
      title: "Amazon Web Services Application",
      subtitle: "Saved SDE summer intern application deadline closing tomorrow",
      urgencyLabel: "Closing Soon",
      urgencyColor: "blue",
      actionLabel: "Apply Now",
      actionHref: "/opportunities/opp-1",
    },
  ];

  return (
    <DashboardShell
      role="student"
      userName={data.student.name}
      unreadNotifications={unreadCount}
    >
      {/* 0. TODAY'S FOCUS: IMMEDIATE STUDENT ACTION CENTER */}
      <TodaysFocus items={focusItems} />

      {/* 1. HIGH-PRIORITY LIVE PLACEMENT SPOTLIGHT */}
      <TodaysPlacementActivityBanner />

      {/* 2. DON'T MISS THIS: SMART MISSED-OPPORTUNITY PREVENTION */}
      <DontMissThisSection />

      {/* 3. MY DAY: PERSONAL TIMELINE & TASKS */}
      <MyDaySection />

      {/* 4. BVRIT EDITORIAL HERO — Astotech design language */}
      <div className="w-full rounded-3xl overflow-hidden border border-amber-200/30 dark:border-amber-800/20 shadow-lg relative">
        {/* Campus photo background */}
        <div className="relative h-[200px] sm:h-[240px] md:h-[280px]">
          <img
            src="/images/bvrit-campus.png"
            alt="BVRIT Dr. A.P.J. Abdul Kalam Block, Narsapur"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark editorial overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          {/* Editorial text overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
            <div className="flex items-center gap-2 mb-2">
              <img src="/images/bvrit-logo.png" alt="BVRIT" className="h-6 w-auto opacity-90" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/80">
                Vishnu Universal Learning
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              {greeting},&nbsp;
              <span className="text-amber-400">{data.student.name}</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300/90 max-w-md leading-relaxed">
              B.V. Raju Institute of Technology &bull; {data.student.department} &bull; Year {data.student.year}, Sec {data.student.section}
            </p>
          </div>
        </div>

        {/* Amber stats block — Astotech editorial accent row */}
        <div className="bg-[#F59E0B] dark:bg-amber-500 grid grid-cols-2 sm:grid-cols-4 divide-x divide-amber-600/30">
          {[
            { value: "25+", label: "Years of Excellence" },
            { value: "1500+", label: "Placements This Year" },
            { value: "80+", label: "Students ≥10 LPA" },
            { value: "20+", label: "Programs Offered" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-3 text-center">
              <div className="text-lg sm:text-xl font-black text-slate-950 leading-none">{stat.value}</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-800/80 mt-0.5 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick action pill-links */}
        <div className="bg-white dark:bg-slate-900 px-5 py-3 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">Quick&nbsp;Jump</span>
          {[
            { label: "Placement Drives", href: "/opportunities", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
            { label: "Vedic.ai Tasks", href: "/assignments", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
            { label: "CampusHub AI", href: "/ai", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
            { label: "ATS Resume", href: "/resume-builder", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
            { label: "DSA Roadmap", href: "/skills", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer hover:opacity-80 transition-opacity ${link.color}`}>
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {greeting}, {data.student.name}
            </h1>
            <Badge variant="blue">
              {data.student.department} • Year {data.student.year} • Sec {data.student.section}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here’s what’s happening on campus.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          <Link href="/ai">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
            >
              CampusHub AI
            </Button>
          </Link>
          <Link href="/notifications">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bell className="h-4 w-4" />}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Opportunities
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. SUMMARY CARDS (FOUR COMPACT REAL-DATABASE STATISTICS) */}
      <section aria-label="Dashboard Statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Saved Opportunities */}
        <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <CardContent className="p-3.5 sm:p-4.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Saved Opportunities
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {data.statistics.savedOpportunities}
              </h3>
              <Link href="/saved" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-block">
                View bookmarks →
              </Link>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Bookmark className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <CardContent className="p-3.5 sm:p-4.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Applications
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {data.statistics.applications}
              </h3>
              <Link href="/applications" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-block">
                Track status →
              </Link>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Send className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="hover:border-red-300 dark:hover:border-red-900/60 transition-colors">
          <CardContent className="p-3.5 sm:p-4.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Upcoming Deadlines
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {data.statistics.upcomingDeadlines}
              </h3>
              <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold inline-block">
                Urgent actions pending
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Interviews */}
        <Card className="hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
          <CardContent className="p-3.5 sm:p-4.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Interviews
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {data.statistics.interviews}
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold inline-block">
                Active recruitment
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CAMPUSHUB AI PERSONAL GUIDE CALLOUT (WARM ILLUSTRATED CARD) */}
      <section>
        <Link
          href="/ai"
          className="p-5 sm:p-6 rounded-3xl border border-[#F59E0B]/30 bg-gradient-to-r from-[#FFF0EE] via-[#FFF7F6] to-[#EBF7FA] dark:from-[#24252E] dark:to-[#1B1C22] shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
        >
          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#1A1D20] dark:text-[#F4EBE9]">
                  CampusHub AI — Personal Campus &amp; Career Guide
                </h3>
                <Badge variant="amber">Verified Grounding</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                Ask your personal guide: <em>&quot;What is happening tomorrow?&quot;</em>, <em>&quot;Which opportunities suit me?&quot;</em>, or <em>&quot;What am I weak at?&quot;</em>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#F59E0B] group-hover:translate-x-1 transition-transform shrink-0">
            <span className="px-4 py-2 rounded-full bg-white dark:bg-[#1B1C22] border border-[#F59E0B]/30 shadow-2xs">
              Chat with AI Guide →
            </span>
          </div>
        </Link>
      </section>

      {/* PLACEMENT & CAREER READINESS QUICK TOOLS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/skills"
          className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 to-blue-50/40 dark:from-indigo-950/40 dark:to-slate-900 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                Skills &amp; DSA Placement Roadmap
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                4-Phase DSA patterns (Blind 75 / NeetCode 150), DBMS &amp; Core CS review.
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <Link
          href="/resume-builder"
          className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-blue-950/40 dark:to-slate-900 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                ATS-Friendly Resume Maker
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                100% compliant single-column templates, profile auto-fill, and 1-page PDF export.
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
