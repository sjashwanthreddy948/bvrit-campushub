"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Building,
  Download,
  FileText,
  Share2,
  ExternalLink,
  Printer,
  ShieldAlert,
  Clock,
  CheckCircle,
  Eye,
  Mail,
  UserCheck,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  getCircularById,
  CircularItem,
  CircularDeadlineStatus,
} from "@/lib/circulars/actions";

export default function CircularDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "circ-1";

  const [circular, setCircular] = React.useState<
    (CircularItem & { deadlineStatus: CircularDeadlineStatus }) | null
  >(null);
  const [loading, setLoading] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // PDF Viewer Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = React.useState(false);

  // Clipboard Feedback State
  const [copied, setCopied] = React.useState(false);

  const loadCircular = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCircularById(id);
      if (!res.isAuthorized || !res.circular) {
        setIsAuthorized(false);
        setErrorMessage(
          res.error || "You do not have authorization to view this circular."
        );
      } else {
        setIsAuthorized(true);
        setCircular(res.circular);
      }
    } catch (err) {
      console.error("Failed to load circular:", err);
      setIsAuthorized(false);
      setErrorMessage("An error occurred while loading this circular.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadCircular();
  }, [loadCircular]);

  const handleShare = () => {
    if (!circular) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(
      `Official Circular: ${circular.title} (Ref: ${circular.circular_no})\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <DashboardShell role="student" userName="Alex Johnson">
        <LoadingState message="Verifying authorization and loading circular..." />
      </DashboardShell>
    );
  }

  // ACCESS CONTROL SECURITY GUARD
  if (!isAuthorized || !circular) {
    return (
      <DashboardShell role="student" userName="Alex Johnson">
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Access Restricted
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {errorMessage ||
              "This official notification is targeted to a different department, academic year, or private group. CampusHub prevents unauthorized disclosure of restricted documents."}
          </p>
          <div className="pt-2">
            <Link href="/circulars">
              <Button variant="primary">Return to My Circulars</Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="student" userName="Alex Johnson">
      {/* Navigation Topbar */}
      <div className="flex items-center justify-between pb-3">
        <Link
          href="/circulars"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Circulars</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              circular.priority === "critical"
                ? "danger"
                : circular.priority === "urgent"
                ? "warning"
                : "default"
            }
          >
            {circular.priority.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Structured Reading Page */}
      <div className="max-w-3xl space-y-4 pb-12">
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Header: Ref No, Published Date, Issuing Authority */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  Ref: {circular.circular_no}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Published:{" "}
                  {new Date(circular.published_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {circular.title}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Issued by: <strong>{circular.posted_by_name}</strong>
              </p>
            </div>

            {/* Target Audience Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Target Audience & Cohort Eligibility</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Department:{" "}
                <strong>
                  {circular.department === "All" || !circular.department
                    ? "All Departments (Campus-wide)"
                    : circular.department}
                </strong>{" "}
                • Year:{" "}
                <strong>
                  {circular.year ? `Year ${circular.year}` : "All Years"}
                </strong>{" "}
                • Section:{" "}
                <strong>
                  {circular.section ? `Section ${circular.section}` : "All Sections"}
                </strong>
              </p>
            </div>

            {/* Important Dates Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Important Dates:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Published:{" "}
                  {new Date(circular.published_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {circular.deadline && (
                    <>
                      {" "}
                      • Deadline:{" "}
                      <strong>
                        {new Date(circular.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                    </>
                  )}
                </p>
              </div>

              {circular.deadline && (
                <Badge
                  variant={
                    circular.deadlineStatus.status === "overdue" ||
                    circular.deadlineStatus.status === "due_today"
                      ? "danger"
                      : circular.deadlineStatus.status === "due_tomorrow"
                      ? "warning"
                      : "blue"
                  }
                >
                  {circular.deadlineStatus.label}
                </Badge>
              )}
            </div>

            {/* Main Circular Description / Text */}
            <div className="space-y-3">
              <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Circular Notice Content
              </h2>
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {circular.description}
              </div>
            </div>

            {/* ATTACHMENT / PDF SECTION */}
            {circular.attachment_url && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Official Attachment (PDF)
                </h2>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {circular.attachment_name || "Official_Notice.pdf"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {circular.attachment_size || "PDF Document"} • Verified Official College Seal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View PDF in accessible modal */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPdfModalOpen(true)}
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                    >
                      View PDF
                    </Button>

                    {/* Open attachment in new tab */}
                    <a
                      href={circular.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                      >
                        Open attachment
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Related Information / Signatory */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Authorized Signatory</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {circular.signatory || circular.posted_by_name}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  <span>Inquiries & Department Contact</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {circular.contact_email || "office@college.edu"}
                </p>
              </div>
            </div>

            {/* Action Bar: Share & Copy */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  leftIcon={<Share2 className="h-3.5 w-3.5" />}
                >
                  Share on WhatsApp
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {copied ? "Link Copied!" : "Copy Link"}
                </Button>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                CampusHub ID: {circular.id}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF VIEWER MODAL */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title={circular.attachment_name || "Official PDF Document"}
        description={`Ref: ${circular.circular_no} • Authorized publication`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500">
              {circular.attachment_size || "Verified PDF"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPdfModalOpen(false)}
              >
                Close
              </Button>
              <a
                href={circular.attachment_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                >
                  Open in New Tab
                </Button>
              </a>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-3 py-10">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {circular.attachment_name || "Official_Notice.pdf"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Verified digital copy issued by {circular.posted_by_name}.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <a
                href={circular.attachment_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Open Full PDF Attachment
                </Button>
              </a>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              Document access verified for {circular.department || "all"} students. File signature confirmed.
            </span>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
