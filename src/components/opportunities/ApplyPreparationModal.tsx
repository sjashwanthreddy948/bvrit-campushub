"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Upload,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ApplicationPreparationData, ChecklistItem, QuickCopyItem } from "@/lib/profile/types";
import { uploadResume, confirmAndTrackApplication } from "@/lib/profile/actions";

interface ApplyPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prepData: ApplicationPreparationData | null;
  onApplied?: () => void;
  onRefreshPrepData?: () => void;
}

export function ApplyPreparationModal({
  isOpen,
  onClose,
  prepData,
  onApplied,
  onRefreshPrepData,
}: ApplyPreparationModalProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [trackInCampusHub, setTrackInCampusHub] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadingResume, setUploadingResume] = React.useState(false);
  const [resumeError, setResumeError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Handle Quick Copy
  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback copy using textarea
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Handle Resume Replacement from modal
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setResumeError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await uploadResume(formData);
      if (res.success) {
        if (onRefreshPrepData) onRefreshPrepData();
      } else {
        setResumeError(res.error || "Failed to upload resume.");
      }
    } catch {
      setResumeError("An error occurred during resume upload.");
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Continue to External Application
  const handleProceed = async () => {
    if (!prepData) return;
    setIsSubmitting(true);

    try {
      if (trackInCampusHub) {
        await confirmAndTrackApplication(prepData.opportunityId);
        if (onApplied) onApplied();
      }

      // Open official portal safely in a new tab
      if (prepData.applicationUrl) {
        window.open(prepData.applicationUrl, "_blank", "noopener,noreferrer");
      }

      onClose();
    } catch (err) {
      console.error("Failed to track application:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!prepData) return null;

  const completeness = prepData.profileCompleteness;
  const criticalMissing = completeness.missingFields.filter((m) => m.importance === "critical");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Preparation"
      description={`${prepData.opportunityTitle} • ${prepData.company}`}
      size="lg"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={trackInCampusHub}
              onChange={(e) => setTrackInCampusHub(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Record application in CampusHub tracker</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="flex-1 sm:flex-initial min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              variant="amber-glow"
              size="md"
              onClick={handleProceed}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial min-h-[44px]"
              rightIcon={<ExternalLink className="h-4 w-4" />}
            >
              {isSubmitting ? "Launching..." : "Continue to External Application"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-slate-900 dark:text-slate-100">
        {/* Notice banner: CampusHub is an assistant */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
          <Sparkles className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
            CampusHub prepares your information and validates readiness. You will complete your actual
            submission on the employer’s official application portal.
          </div>
        </div>

        {/* 1. Profile Completeness Overview */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold">Reusable Profile Completeness</span>
            </div>
            <Badge
              variant={
                completeness.percentage >= 80
                  ? "success"
                  : completeness.percentage >= 50
                  ? "warning"
                  : "secondary"
              }
              size="sm"
            >
              {completeness.percentage}% Ready
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full transition-all duration-300 ${
                completeness.percentage >= 80
                  ? "bg-emerald-500"
                  : completeness.percentage >= 50
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }`}
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>

          {criticalMissing.length > 0 ? (
            <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 mt-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                Missing critical info:{" "}
                <span className="font-semibold">
                  {criticalMissing.map((m) => m.label).join(", ")}
                </span>
                .{" "}
                <Link
                  href="/profile"
                  className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-800"
                  onClick={onClose}
                >
                  Complete profile now &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>All critical personal and academic details are ready.</span>
            </div>
          )}
        </div>

        {/* 2. Deterministic Opportunity Readiness Checklist */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Opportunity Readiness Checklist
          </h3>
          <div className="space-y-2">
            {prepData.checklist.map((item: ChecklistItem) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {item.status === "ready" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {item.status === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  {item.status === "missing" && (
                    <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.isRequired && (
                        <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                      {item.message}
                    </p>
                  </div>
                </div>

                {item.valuePreview && (
                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 shrink-0 max-w-[140px] truncate hidden sm:inline-block">
                    {item.valuePreview}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Resume Quick Access & Replacement */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resume Quick Access
            </h3>
            <span className="text-xs text-slate-400">PDF, DOC, DOCX up to 5MB</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {prepData.resumeFileName || "No resume uploaded yet"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {prepData.hasResume
                    ? "Uploaded & ready for external submission"
                    : "Upload a resume to quickly attach or download"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {prepData.hasResume && prepData.resumeUrl && (
                <a
                  href={prepData.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 min-h-[44px] min-w-[44px] flex-1 sm:flex-initial"
                >
                  <Download className="h-4 w-4" />
                  <span>View</span>
                </a>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingResume}
                className="min-h-[44px] flex-1 sm:flex-initial text-xs"
                leftIcon={<Upload className="h-4 w-4" />}
              >
                {uploadingResume
                  ? "Uploading..."
                  : prepData.hasResume
                  ? "Replace"
                  : "Upload Resume"}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeFileChange}
                className="hidden"
                aria-label="Upload resume file"
              />
            </div>
          </div>

          {resumeError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{resumeError}</span>
            </p>
          )}
        </div>

        {/* 4. Quick Copy Palette */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Copy Palette
            </h3>
            <span className="text-xs text-slate-400">One-tap copy for form fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {prepData.quickCopyItems.map((item: QuickCopyItem) => {
              const isCopied = copiedKey === item.key;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate block">
                      {item.value}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(item.key, item.value)}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                      isCopied
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                    aria-label={`Copy ${item.label}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. AI Alignment Brief */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 p-4 bg-blue-50/30 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              AI Alignment Brief
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Stated Deadline */}
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Stated Deadline:</strong>{" "}
                {prepData.aiBrief.deadlineNotice}
              </span>
            </div>

            {/* Matching Skills */}
            {prepData.aiBrief.matchingSkills.length > 0 && (
              <div>
                <span className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">
                  Matching Profile Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {prepData.aiBrief.matchingSkills.map((skill) => (
                    <Badge key={skill} variant="success" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {prepData.aiBrief.missingSkills.length > 0 && (
              <div>
                <span className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">
                  Skills Not Listed in Profile:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {prepData.aiBrief.missingSkills.map((skill) => (
                    <Badge key={skill} variant="warning" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Guidance Notes */}
            <div className="pt-2 border-t border-blue-100 dark:border-blue-900/40">
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {prepData.aiBrief.guidanceNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
