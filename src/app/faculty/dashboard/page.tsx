"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  Plus,
  Users,
  Eye,
  TrendingUp,
  Clock,
  ArrowRight,
  Share2,
  Edit3,
  Trash2,
  Check,
  Search,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PillTag } from "@/components/ui/PillTag";
import { WhatsAppShareModal } from "@/components/ui/WhatsAppShareModal";

import {
  getAllCircularsForFaculty,
  deleteCircular,
  CircularItem,
  CircularDeadlineStatus,
} from "@/lib/circulars/actions";

import {
  getAllAssignmentsForFaculty,
  deleteAssignment,
  AssignmentItem,
  AssignmentDeadlineStatus,
} from "@/lib/assignments/actions";

import {
  generateCircularShareText,
  generateAssignmentShareText,
} from "@/lib/share/whatsapp";

interface UnifiedPostItem {
  id: string;
  type: "circular" | "assignment";
  title: string;
  subtitle: string;
  targetCohort: string;
  date: string;
  deadline?: string | null;
  statusBadge?: string;
  viewUrl: string;
  editUrl: string;
  rawItem: any;
}

export default function FacultyDashboardPage() {
  const [circulars, setCirculars] = React.useState<
    Array<CircularItem & { deadlineStatus: CircularDeadlineStatus }>
  >([]);
  const [assignments, setAssignments] = React.useState<
    Array<AssignmentItem & { deadlineStatus: AssignmentDeadlineStatus }>
  >([]);
  const [loading, setLoading] = React.useState(true);

  // Filter & Search
  const [activeTab, setActiveTab] = React.useState<"all" | "circular" | "assignment">("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Deletion state
  const [deletingItem, setDeletingItem] = React.useState<{
    id: string;
    type: "circular" | "assignment";
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // WhatsApp Share Modal State
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [shareText, setShareText] = React.useState("");
  const [shareTitle, setShareTitle] = React.useState("Share on WhatsApp");

  const loadAllData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [circRes, asgRes] = await Promise.all([
        getAllCircularsForFaculty(),
        getAllAssignmentsForFaculty(),
      ]);

      setCirculars(circRes.circulars);
      setAssignments(asgRes.assignments);
    } catch (err) {
      console.error("Failed to load faculty dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle WhatsApp Share
  const handleOpenShare = (item: UnifiedPostItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://campushub.edu";

    if (item.type === "circular") {
      const circ = item.rawItem as CircularItem;
      const text = generateCircularShareText({
        title: circ.title,
        deadline: circ.deadline,
        url: `${origin}/circulars/${circ.id}`,
      });
      setShareText(text);
      setShareTitle("Share Circular on WhatsApp");
    } else {
      const asg = item.rawItem as AssignmentItem;
      const text = generateAssignmentShareText({
        title: `${asg.subject_code}: ${asg.title}`,
        subject_code: asg.subject_code,
        subject_name: asg.subject_name,
        faculty_name: asg.faculty_name,
        deadline: asg.deadline,
        submissionUrl: asg.submission_url,
        attachment_url: asg.attachment_url,
      });
      setShareText(text);
      setShareTitle("Share Assignment on WhatsApp");
    }

    setShareModalOpen(true);
  };

  // Handle Deletion
  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      if (deletingItem.type === "circular") {
        const res = await deleteCircular(deletingItem.id);
        if (res.success) {
          setCirculars((prev) => prev.filter((c) => c.id !== deletingItem.id));
          setFeedback("Circular notice deleted.");
        }
      } else {
        const res = await deleteAssignment(deletingItem.id);
        if (res.success) {
          setAssignments((prev) => prev.filter((a) => a.id !== deletingItem.id));
          setFeedback("Assignment reminder deleted.");
        }
      }
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback("Failed to delete item.");
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  // Combine circulars and assignments for chronological feed (Opportunities handled exclusively by Placement Coordinator)
  const unifiedPosts: UnifiedPostItem[] = [
    ...circulars.map((c) => ({
      id: c.id,
      type: "circular" as const,
      title: c.title,
      subtitle: `Ref: ${c.circular_no} • ${c.posted_by_name}`,
      targetCohort: `${c.department || "All"} ${c.year ? `Yr ${c.year}` : ""} ${c.section ? `Sec ${c.section}` : ""}`,
      date: c.published_date,
      deadline: c.deadline,
      statusBadge: c.priority.toUpperCase(),
      viewUrl: `/circulars/${c.id}`,
      editUrl: `/faculty/circulars/${c.id}/edit`,
      rawItem: c,
    })),
    ...assignments.map((a) => ({
      id: a.id,
      type: "assignment" as const,
      title: a.title,
      subtitle: `${a.subject_code} • ${a.subject_name} (${a.faculty_name})`,
      targetCohort: `${a.department} Yr ${a.year} Sec ${a.section}`,
      date: a.created_at,
      deadline: a.deadline,
      statusBadge: a.deadlineStatus.label,
      viewUrl: `/assignments`,
      editUrl: `/faculty/assignments/${a.id}/edit`,
      rawItem: a,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredPosts = unifiedPosts.filter((p) => {
    const matchesTab = activeTab === "all" || p.type === activeTab;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.targetCohort.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardShell role="faculty" userName="Prof. K. Sharma">
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Faculty Institutional Header */}
        <div className="academic-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold text-xs">
                Faculty Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                Department of CSE &bull; BVRIT Autonomous
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                Vedic.ai Integration Live
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Academic Coursework &amp; Circulars Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Publish official department notices, dispatch course assignment deadlines, and track section-level submission turnout across all student cohorts.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/faculty/circulars/new">
              <Button size="md" variant="primary" leftIcon={<Plus className="h-4 w-4" />} className="font-semibold shadow-xs">
                Post Circular
              </Button>
            </Link>
            <Link href="/faculty/assignments/new">
              <Button size="md" variant="outline" leftIcon={<Plus className="h-4 w-4" />} className="font-semibold border-slate-200 dark:border-slate-700">
                New Assignment
              </Button>
            </Link>
          </div>
        </div>

        {feedback && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Department Circulars</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {circulars.length}
                </h3>
                <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                  {circulars.filter((c) => c.priority === "urgent" || c.priority === "critical").length} urgent notices
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Assignment Reminders</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {assignments.length}
                </h3>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                  Vedic.ai Integrated
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Academic Submissions</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {assignments.filter((a) => a.deadlineStatus.status === "due_today" || a.deadlineStatus.status === "due_tomorrow").length}
                </h3>
                <p className="text-[11px] text-red-600 font-medium mt-0.5">Due Today / Tomorrow</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Estimated Cohort Reach</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">480+</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">B.Tech CSE Students</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placement Coordination Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Placement &amp; Internship Opportunities Notice
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Campus recruitment drives and company internships are managed exclusively by the <strong>Placement Coordinator</strong>.
              </p>
            </div>
          </div>
          <Link
            href="/coordinator/dashboard"
            className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline shrink-0 inline-flex items-center gap-1"
          >
            <span>Placement Hub</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Quick Publishing Actions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Link
            href="/faculty/circulars/new"
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Publish Official Circular
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Announce exams, timetables, or academic notices with PDF attachments.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>

          <Link
            href="/faculty/assignments/new"
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:border-purple-400 hover:shadow-xs transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Schedule Coursework Assignment
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Broadcast lab problem sets and Vedic.ai submission deadlines to your sections.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        </div>

        {/* Content Management Feed */}
        <Card>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <PillTag
                label={`All Content (${unifiedPosts.length})`}
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                size="sm"
              />
              <PillTag
                label={`Circulars (${circulars.length})`}
                active={activeTab === "circular"}
                onClick={() => setActiveTab("circular")}
                size="sm"
              />
              <PillTag
                label={`Assignments (${assignments.length})`}
                active={activeTab === "assignment"}
                onClick={() => setActiveTab("assignment")}
                size="sm"
              />
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search circulars &amp; tasks..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-8">
                <LoadingState message="Loading your published content..." />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<FileText className="h-6 w-6" />}
                  title="No content found"
                  description={
                    searchTerm
                      ? "No circulars or assignments match your search query."
                      : "You haven't published any items yet. Create your first circular or assignment above."
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPosts.map((post) => {
                  const isCircular = post.type === "circular";

                  return (
                    <div
                      key={post.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCircular
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-600"
                              : "bg-purple-50 dark:bg-purple-950 text-purple-600"
                          }`}
                        >
                          {isCircular ? <FileText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={isCircular ? "warning" : "purple"} size="sm">
                              {post.type.toUpperCase()}
                            </Badge>
                            {post.statusBadge && (
                              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                                {post.statusBadge}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">•</span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Target: {post.targetCohort}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                            <Link href={post.viewUrl} className="hover:underline">
                              {post.title}
                            </Link>
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {post.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenShare(post)}
                          leftIcon={<Share2 className="h-3.5 w-3.5 text-emerald-600" />}
                          className="min-h-[38px] text-xs"
                        >
                          WhatsApp
                        </Button>

                        <Link href={post.editUrl}>
                          <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
                            Edit
                          </Button>
                        </Link>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setDeletingItem({
                              id: post.id,
                              type: post.type,
                              title: post.title,
                            })
                          }
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          title="Confirm Deletion"
          description={`Are you sure you want to delete "${deletingItem?.title}"? This action cannot be undone.`}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setDeletingItem(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete} isLoading={isDeleting}>
                Confirm Delete
              </Button>
            </div>
          }
        >
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Deleting this record removes it from the student portal immediately.
          </p>
        </Modal>

        {/* WhatsApp Share Modal */}
        <WhatsAppShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={shareTitle}
          subtitle="Review and broadcast this notice to student class groups via WhatsApp."
          shareText={shareText}
        />
      </div>
    </DashboardShell>
  );
}
