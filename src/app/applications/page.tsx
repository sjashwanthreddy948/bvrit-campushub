"use client";

import * as React from "react";
import Link from "next/link";
import {
  Send,
  Calendar,
  Building,
  ExternalLink,
  Edit3,
  Check,
  Briefcase,
  AlertCircle,
  Clock,
  Filter,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  getUserApplications,
  updateApplicationStatus,
} from "@/lib/opportunities/actions";
import { ApplicationStatus, Opportunity } from "@/types/database";

interface TrackedApp {
  id: string;
  studentId: string;
  opportunityId: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity: Opportunity;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "saved", label: "Saved" },
  { value: "planning", label: "Planning to Apply" },
  { value: "applied", label: "Applied" },
  { value: "assessment", label: "Assessment" },
  { value: "interview", label: "Interview" },
  { value: "selected", label: "Selected (Offer)" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
  { value: "not_interested", label: "Not Interested" },
];

const editableStatuses = [
  { value: "saved", label: "Saved" },
  { value: "planning", label: "Planning to Apply" },
  { value: "applied", label: "Applied" },
  { value: "assessment", label: "Assessment (Test / Screening)" },
  { value: "interview", label: "Interview (Rounds Ongoing)" },
  { value: "selected", label: "Selected (Offer Received)" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
  { value: "not_interested", label: "Not Interested" },
];

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = React.useState<TrackedApp[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // Edit modal state
  const [editingApp, setEditingApp] = React.useState<TrackedApp | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<ApplicationStatus>("applied");
  const [notesInput, setNotesInput] = React.useState("");
  const [updating, setUpdating] = React.useState(false);

  const loadApplications = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await getUserApplications();
      setApplications(list as TrackedApp[]);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const openEditModal = (app: TrackedApp) => {
    setEditingApp(app);
    setSelectedStatus(app.status);
    setNotesInput(app.notes || "");
  };

  const handleSaveStatusUpdate = async () => {
    if (!editingApp) return;
    setUpdating(true);

    try {
      const res = await updateApplicationStatus(editingApp.id, selectedStatus, notesInput);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === editingApp.id
              ? {
                  ...a,
                  status: selectedStatus,
                  notes: notesInput,
                  updatedAt: new Date().toISOString(),
                }
              : a
          )
        );
        setFeedback("Application status and notes updated.");
        setEditingApp(null);
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch {
      setFeedback("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "saved":
        return <Badge variant="secondary">Saved</Badge>;
      case "planning":
        return <Badge variant="powder">Planning to Apply</Badge>;
      case "applied":
        return <Badge variant="blue">Applied</Badge>;
      case "assessment":
        return <Badge variant="purple">Assessment</Badge>;
      case "interview":
        return <Badge variant="warning">Interview</Badge>;
      case "selected":
        return <Badge variant="success">Selected (Offer)</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      case "closed":
        return <Badge variant="default">Closed</Badge>;
      case "not_interested":
        return <Badge variant="secondary">Not Interested</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      <PageHeader
        title="Application Tracker"
        description="Track your hiring pipeline, update interview stages, and store interview notes in one place."
        badge={<Badge variant="blue">{applications.length} Tracked</Badge>}
        action={
          <Link href="/opportunities">
            <Button size="sm" rightIcon={<ExternalLink className="h-4 w-4" />}>
              Explore Opportunities
            </Button>
          </Link>
        }
      />

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors min-h-[36px] whitespace-nowrap ${
              statusFilter === opt.value
                ? "bg-blue-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {opt.label}{" "}
            {opt.value === "all"
              ? `(${applications.length})`
              : `(${applications.filter((a) => a.status === opt.value).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading your application tracker..." />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={<Send className="h-6 w-6" />}
          title={statusFilter === "all" ? "No applications tracked yet" : `No applications in '${statusFilter}' stage`}
          description={
            statusFilter === "all"
              ? "When you find an opportunity you like, click Apply to record your application and start your tracker."
              : "No opportunities currently match this filter. Change the filter or explore new postings."
          }
          action={
            <Link href="/opportunities">
              <Button size="sm">Explore Opportunities</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* 1. Mobile View (< 768px): Stacked Responsive Cards */}
          <div className="md:hidden space-y-3">
            {filteredApps.map((app) => (
              <Card key={app.id} className="hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {app.opportunity.company}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {app.opportunity.title}
                      </h3>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  {app.notes && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Notes: </span>
                      {app.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <span>
                      Applied:{" "}
                      {new Date(app.appliedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(app)}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline p-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Update</span>
                      </button>

                      <Link
                        href={`/opportunities/${app.opportunityId}`}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 p-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 2. Desktop View (>= 768px): Structured Table */}
          <div className="hidden md:block">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company & Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {app.opportunity.company}
                        </div>
                        <div className="text-xs text-slate-500">
                          {app.opportunity.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" size="sm">
                          {app.opportunity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {app.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(app)}
                            leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                          >
                            Update
                          </Button>
                          <Link href={`/opportunities/${app.opportunityId}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      {/* UPDATE STATUS & NOTES MODAL */}
      {editingApp && (
        <Modal
          isOpen={Boolean(editingApp)}
          onClose={() => setEditingApp(null)}
          title={`Update ${editingApp.opportunity.company}`}
          description={`Update recruitment stage or add personal notes for ${editingApp.opportunity.title}`}
          footer={
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setEditingApp(null)}>
                Cancel
              </Button>
              <Button isLoading={updating} onClick={handleSaveStatusUpdate}>
                Save Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Select
              label="Application Stage *"
              options={editableStatuses}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
            />

            <Textarea
              label="Personal Notes & Next Steps"
              placeholder="e.g. Completed technical round 1. Recruiter mentioned next interview on Friday. Focus on system design..."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              rows={4}
              helperText="These notes are private to your student account."
            />
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
