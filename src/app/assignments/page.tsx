"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  User,
  ExternalLink,
  Download,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PillTag } from "@/components/ui/PillTag";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  getStudentAssignments,
  AssignmentItem,
  AssignmentDeadlineStatus,
} from "@/lib/assignments/actions";

const statusTabs = [
  { id: "all", label: "All Tasks" },
  { id: "due_today", label: "Due Today" },
  { id: "due_tomorrow", label: "Due Tomorrow" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
] as const;

export default function AssignmentsPage() {
  const [assignments, setAssignments] = React.useState<
    Array<AssignmentItem & { deadlineStatus: AssignmentDeadlineStatus }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [counts, setCounts] = React.useState({
    all: 0,
    due_today: 0,
    due_tomorrow: 0,
    upcoming: 0,
    overdue: 0,
  });
  const [studentCohort, setStudentCohort] = React.useState<{
    department: string;
    year: number;
    section: string;
    name: string;
  } | null>(null);

  // Search and status tab
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<
    "all" | "due_today" | "due_tomorrow" | "upcoming" | "overdue"
  >("all");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentAssignments({
        search: searchTerm,
        statusFilter: activeTab,
      });
      setAssignments(res.assignments);
      setCounts(res.counts);
      setStudentCohort(res.studentCohort);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeTab]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const getDeadlineBadge = (status: AssignmentDeadlineStatus) => {
    switch (status.status) {
      case "overdue":
        return (
          <Badge variant="danger" size="sm" className="font-bold">
            <AlertOctagon className="h-3 w-3 mr-1 inline" />
            {status.label}
          </Badge>
        );
      case "due_today":
        return (
          <Badge variant="danger" size="sm" className="font-bold">
            <AlertTriangle className="h-3 w-3 mr-1 inline" />
            Due Today
          </Badge>
        );
      case "due_tomorrow":
        return (
          <Badge variant="warning" size="sm" className="font-bold">
            <Clock className="h-3 w-3 mr-1 inline" />
            Due Tomorrow
          </Badge>
        );
      case "due_in_x_days":
      default:
        return (
          <Badge variant="blue" size="sm">
            {status.label}
          </Badge>
        );
    }
  };

  return (
    <DashboardShell role="student" userName={studentCohort?.name || "Alex Johnson"}>
      {/* EXECUTIVE ACADEMIC ASSIGNMENT HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-3 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                Coursework &amp; Labs
              </span>
              <span className="text-xs text-slate-500 font-semibold">{counts.all} Active Tasks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Academic Tasks &amp; Deadlines
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Upcoming lab tasks, problem sets, and submission reminders for {studentCohort?.department || "CSE"} Year {studentCohort?.year || 3} with official Vedic.ai portal integration.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800">
          {statusTabs.map((tab) => (
            <PillTag
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Cohort Targeting Awareness Notice */}
      <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            Showing academic deadlines for{" "}
            <strong>
              {studentCohort?.department || "CSE"} • Year {studentCohort?.year || 3} • Section {studentCohort?.section || "A"}
            </strong>
            .
          </span>
        </div>
        <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
          Cohort Filter Active ✓
        </span>
      </div>

      {/* Submission Note: CampusHub does NOT store submissions */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Vedic.ai Integration Notice:</strong> CampusHub keeps your academic deadlines organized and reminds you ahead of time. Upload submissions, view test cases, and check grades directly on the official <strong>Vedic.ai portal</strong> (<a href="https://vedicai.student.edwisely.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600">vedicai.student.edwisely.com</a>) or in the <strong>Edwisely mobile app</strong>. CampusHub does NOT store assignment submissions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by subject, topic, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {statusTabs.map((tab) => {
          const count = counts[tab.id as keyof typeof counts] || 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-blue-700 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Assignments List */}
      {loading ? (
        <LoadingState message="Loading assignment reminders..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={
            activeTab === "all"
              ? "No assignments scheduled"
              : `No assignments currently marked as '${activeTab.replace("_", " ")}'`
          }
          description="Check back later or adjust your search filter."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setActiveTab("all");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {assignments.map((item) => (
            <Card
              key={item.id}
              className={`hover:border-blue-300 dark:hover:border-blue-800 transition-colors ${
                item.deadlineStatus.status === "overdue"
                  ? "border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10"
                  : item.deadlineStatus.status === "due_today"
                  ? "border-red-300 dark:border-red-800/80 bg-red-50/10 dark:bg-red-950/10"
                  : ""
              }`}
            >
              <CardContent className="p-4 sm:p-5 space-y-3">
                {/* Header: Subject Code & Name, Deadline Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {item.subject_code} • {item.subject_name}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Instructor: {item.faculty_name} • Max Marks: {item.max_marks || 25}
                    </p>
                  </div>
                  {getDeadlineBadge(item.deadlineStatus)}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Footer: Due date, Problem Sheet Attachment, Submit on Vedic.ai Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      Due:{" "}
                      {new Date(item.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {item.attachment_url && (
                      <a
                        href={item.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                      >
                        <FileText className="h-3.5 w-3.5 text-red-500" />
                        <span>Problem Sheet</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* VEDIC.AI DIRECT SUBMISSION ACTION */}
                    <a
                      href={item.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                      >
                        Submit on Vedic.ai
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
