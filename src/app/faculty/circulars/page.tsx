"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  AlertCircle,
  Building,
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
import {
  getAllCircularsForFaculty,
  deleteCircular,
  CircularItem,
  CircularDeadlineStatus,
} from "@/lib/circulars/actions";

export default function FacultyCircularsPage() {
  const [circulars, setCirculars] = React.useState<
    Array<CircularItem & { deadlineStatus: CircularDeadlineStatus }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCircularsForFaculty();
      setCirculars(res.circulars);
    } catch (err) {
      console.error("Failed to load faculty circulars:", err);
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
      const res = await deleteCircular(deletingId);
      if (res.success) {
        setCirculars((prev) => prev.filter((c) => c.id !== deletingId));
        setFeedback("Circular deleted successfully.");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback(res.error || "Failed to delete circular.");
      }
    } catch {
      setFeedback("Failed to delete circular.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const filtered = circulars.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.circular_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.department || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardShell role="faculty" userName="Prof. K. Sharma">
      <PageHeader
        title="Faculty Circulars Management"
        description="Issue official announcements, manage departmental circulars, and target specific cohorts."
        action={
          <Link href="/faculty/circulars/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Issue Circular
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

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search circulars by title or ref no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading departmental circulars..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No circulars found"
          description="You haven't issued any circulars matching this criteria yet."
          action={
            <Link href="/faculty/circulars/new">
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Issue First Circular
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
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {item.circular_no}
                    </span>
                    <Badge
                      variant={
                        item.priority === "critical"
                          ? "danger"
                          : item.priority === "urgent"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {item.priority.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Target:{" "}
                      <strong>
                        {item.department === "All" || !item.department
                          ? "All Campus"
                          : item.department}
                        {item.year ? ` Year ${item.year}` : ""}
                        {item.section ? ` Sec ${item.section}` : ""}
                      </strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      Published:{" "}
                      {new Date(item.published_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {item.deadline && (
                      <span>
                        Deadline:{" "}
                        {new Date(item.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {item.attachment_url && (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        ✓ PDF Attached
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <Link href={`/circulars/${item.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                      View
                    </Button>
                  </Link>

                  <Link href={`/faculty/circulars/${item.id}/edit`}>
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
        title="Confirm Circular Deletion"
        description="Are you sure you want to delete this circular notice? Students will no longer see this announcement."
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
          This action will permanently delete the circular record from CampusHub.
        </p>
      </Modal>
    </DashboardShell>
  );
}
