"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Search,
  AlertCircle,
  Clock,
  Download,
  Filter,
  ArrowUpDown,
  Building,
  Users,
  CheckCircle2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PillTag } from "@/components/ui/PillTag";
import { CounselingGuidanceIllustration } from "@/components/illustrations/CollegiateScenes";
import {
  getStudentCirculars,
  CircularItem,
  CircularDeadlineStatus,
} from "@/lib/circulars/actions";

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical Only" },
  { value: "urgent", label: "Urgent Only" },
  { value: "normal", label: "Normal Only" },
];

const sortOptions = [
  { value: "newest", label: "Newest Published" },
  { value: "deadline_soonest", label: "Deadline Soonest" },
];

export default function CircularsPage() {
  const [circulars, setCirculars] = React.useState<
    Array<CircularItem & { deadlineStatus: CircularDeadlineStatus }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [studentCohort, setStudentCohort] = React.useState<{
    department: string;
    year: number;
    section: string;
    name: string;
  } | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPriority, setSelectedPriority] = React.useState("all");
  const [hasPdfOnly, setHasPdfOnly] = React.useState(false);
  const [selectedSort, setSelectedSort] = React.useState<"newest" | "deadline_soonest">("newest");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentCirculars({
        search: searchTerm,
        priority: selectedPriority,
        hasAttachment: hasPdfOnly,
        sortBy: selectedSort,
      });
      setCirculars(res.circulars);
      setStudentCohort(res.studentCohort);
    } catch (err) {
      console.error("Failed to load circulars:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedPriority, hasPdfOnly, selectedSort]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const getPriorityBadge = (priority: "normal" | "urgent" | "critical") => {
    switch (priority) {
      case "critical":
        return <Badge variant="danger">CRITICAL</Badge>;
      case "urgent":
        return <Badge variant="warning">URGENT</Badge>;
      case "normal":
      default:
        return <Badge variant="secondary">NORMAL</Badge>;
    }
  };

  const getDeadlineBadge = (status: CircularDeadlineStatus) => {
    if (status.status === "none") return null;

    if (status.status === "overdue") {
      return (
        <Badge variant="danger" size="sm">
          {status.label}
        </Badge>
      );
    }
    if (status.status === "due_today") {
      return (
        <Badge variant="danger" size="sm">
          Due Today
        </Badge>
      );
    }
    if (status.status === "due_tomorrow") {
      return (
        <Badge variant="warning" size="sm">
          Due Tomorrow
        </Badge>
      );
    }
    return (
      <Badge variant="blue" size="sm">
        {status.label}
      </Badge>
    );
  };

  return (
    <DashboardShell role="student" userName={studentCohort?.name || "Alex Johnson"}>
      {/* Collegiate Illustrated Hero Banner */}
      <Card className="border-[#F0E4E2] dark:border-[#2B2C35] bg-gradient-to-br from-white via-[#FFF7F6] to-[#FBF1EF] dark:from-[#1A1D20] dark:via-[#1E2024] dark:to-[#17181C] shadow-xs overflow-hidden mb-6">
        <div className="p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <PillTag variant="amber" size="sm">Official Dispatches</PillTag>
              <PillTag variant="outline" size="sm">Cohort Verified</PillTag>
              <PillTag variant="powder" size="sm">{circulars.length} Active Notices</PillTag>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] dark:text-[#F4EBE9] tracking-tight">
                Official Circulars <span className="text-[#F59E0B]">✦</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Verified announcements, examination schedules, and official department circulars tailored to your cohort at BVRIT Narsapur.
              </p>
            </div>

            {/* Quick Priority Filter Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              {priorityOptions.map((opt) => (
                <PillTag
                  key={opt.value}
                  label={opt.label}
                  active={selectedPriority === opt.value}
                  onClick={() => setSelectedPriority(opt.value)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          <div className="shrink-0 hidden sm:flex justify-center items-center">
            <CounselingGuidanceIllustration className="w-56 h-auto drop-shadow-xs" />
          </div>
        </div>
      </Card>

      {/* Cohort Targeting Awareness Notice */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1D20] border border-[#F0E4E2] dark:border-[#2B2C35] text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Users className="h-4 w-4 text-[#F59E0B] shrink-0" />
          <span>
            Showing circulars relevant to{" "}
            <strong>
              {studentCohort?.department || "CSE"} • Year {studentCohort?.year || 3} • Section {studentCohort?.section || "A"}
            </strong>{" "}
            and college-wide circulars.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-[#F59E0B] bg-[#FFF0EE] dark:bg-[#F59E0B]/15 px-2.5 py-1 rounded-full">
          Cohort Verified ✓
        </span>
      </div>

      {/* Search & Sort Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by title, ref no, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40">
              <Select
                options={priorityOptions}
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              />
            </div>

            <div className="w-44">
              <Select
                options={sortOptions}
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as "newest" | "deadline_soonest")}
              />
            </div>

            <button
              type="button"
              onClick={() => setHasPdfOnly(!hasPdfOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 min-h-[40px] ${
                hasPdfOnly
                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>With PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Circulars List */}
      {loading ? (
        <LoadingState message="Loading cohort circulars..." />
      ) : circulars.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No circulars match your criteria"
          description="Try adjusting your search terms or clearing your priority filter to view other campus notices."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedPriority("all");
                setHasPdfOnly(false);
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {circulars.map((item) => (
            <Card
              key={item.id}
              className={`hover:border-blue-300 dark:hover:border-blue-800 transition-colors ${
                item.priority === "critical"
                  ? "border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10"
                  : ""
              }`}
            >
              <CardContent className="p-4 sm:p-5 space-y-3">
                {/* Header: Ref No, Priority Badge, Target Cohort, Published Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {item.circular_no}
                    </span>
                    {getPriorityBadge(item.priority)}
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {item.department === "All" || !item.department
                        ? "Entire Campus"
                        : `${item.department} ${item.year ? `Year ${item.year}` : ""}`}
                    </span>
                  </div>

                  <span className="text-slate-500">
                    {new Date(item.published_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <Link
                    href={`/circulars/${item.id}`}
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                  >
                    {item.title}
                  </Link>
                </div>

                {/* Summary / Description preview */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Footer: Deadlines, PDF Attachment badge, Read button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.deadline && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-slate-500">
                          Deadline:{" "}
                          {new Date(item.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {getDeadlineBadge(item.deadlineStatus)}
                      </div>
                    )}

                    {item.attachment_url && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        <FileText className="h-3 w-3 text-red-500" />
                        PDF Document ({item.attachment_size || "Verified"})
                      </span>
                    )}
                  </div>

                  <Link href={`/circulars/${item.id}`}>
                    <Button variant="outline" size="sm">
                      Read Circular
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
