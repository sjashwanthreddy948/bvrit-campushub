"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  Check,
  Search,
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
import { WhatsAppReminderButton } from "@/components/reminders/WhatsAppReminderButton";
import {
  getAllAssignmentsForFaculty,
  deleteAssignment,
  AssignmentItem,
  AssignmentDeadlineStatus,
} from "@/lib/assignments/actions";

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<
    Array<AssignmentItem & { deadlineStatus: AssignmentDeadlineStatus }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAssignmentsForFaculty();
      setAssignments(res.assignments);
    } catch (err) {
      console.error("Failed to load faculty assignments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteAssignment(deletingId);
      if (res.success) {
        setAssignments((prev) => prev.filter((a) => a.id !== deletingId));
        setFeedback("Assignment reminder deleted successfully.");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(res.error || "Failed to delete assignment reminder.");
      }
    } catch {
      setFeedback("Failed to delete assignment reminder.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardShell role="faculty" userName="Prof. K. Sharma">
      <PageHeader
        title="Faculty Assignment Reminders"
        description="Schedule academic deadlines for your courses. Track problem sets, lab tasks, and verify Vedic.ai submission links."
        action={
          <Link href="/faculty/assignments/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Create Reminder
            </Button>
          </Link>
        }
      />

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Reminder that CampusHub does not store submissions */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <p>
          <strong>Platform Policy:</strong> CampusHub provides deadline reminders and broadcasts. Student code, lab reports, and assignments are submitted and evaluated directly on <strong>Vedic.ai</strong>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by subject code, name, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading scheduled assignment reminders..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No assignments scheduled"
          description="Create your first deadline reminder to help your students stay on track."
          action={
            <Link href="/faculty/assignments/new">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Create First Reminder
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {item.subject_code} • {item.subject_name}
                    </span>
                    <Badge
                      variant={
                        item.deadlineStatus.status === "overdue"
                          ? "danger"
                          : item.deadlineStatus.status === "due_today"
                          ? "danger"
                          : item.deadlineStatus.status === "due_tomorrow"
                          ? "warning"
                          : "blue"
                      }
                    >
                      {item.deadlineStatus.label}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      Target:{" "}
                      <strong>
                        {item.department} {item.year ? `Year ${item.year}` : ""} {item.section ? `Sec ${item.section}` : ""}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Due:{" "}
                      {new Date(item.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <a
                      href={item.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Vedic.ai Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <WhatsAppReminderButton
                    type="assignment"
                    assignment={item}
                    size="sm"
                    label="WhatsApp Reminder"
                  />

                  <Link href={`/faculty/assignments/${item.id}/edit`}>
                    <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingId(item.id)}
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this assignment reminder?"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This will remove the assignment reminder from the student dashboard and reminders list. Existing submissions on Vedic.ai are not affected.
        </p>
      </Modal>
    </DashboardShell>
  );
}
