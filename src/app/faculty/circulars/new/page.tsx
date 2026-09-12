"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  FileText,
  Upload,
  Check,
  AlertCircle,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createCircular } from "@/lib/circulars/actions";
import { validateUploadedFile } from "@/lib/circulars/utils";
import { WhatsAppShareModal } from "@/components/ui/WhatsAppShareModal";
import { generateCircularShareText } from "@/lib/share/whatsapp";

const priorities = [
  { value: "normal", label: "Normal Priority" },
  { value: "urgent", label: "Urgent Priority (Featured Announcement)" },
  { value: "critical", label: "Critical / Emergency Notice" },
];

const targetCohorts = [
  { value: "All", label: "Entire College (All Departments)" },
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "ECE", label: "Electronics & Communication Engineering" },
  { value: "MECH", label: "Mechanical Engineering" },
  { value: "CIVIL", label: "Civil Engineering" },
];

const targetYears = [
  { value: "0", label: "All Years (1st to 4th)" },
  { value: "1", label: "1st Year Only" },
  { value: "2", label: "2nd Year Only" },
  { value: "3", label: "3rd Year Only" },
  { value: "4", label: "4th Year (Graduating Batch)" },
];

const targetSections = [
  { value: "All", label: "All Sections (A, B, C...)" },
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
];

export default function NewCircularPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    title: "",
    refNo: `CSE-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
    priority: "normal" as "normal" | "urgent" | "critical",
    department: "CSE",
    year: "3",
    section: "All",
    deadline: "",
    content: "",
    signatory: "Prof. K. Sharma, HOD CSE",
    contactEmail: "hod.cse@college.edu",
  });

  // Attachment state
  const [attachmentFile, setAttachmentFile] = React.useState<{
    name: string;
    size: number;
  } | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [shareText, setShareText] = React.useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) {
      setAttachmentFile(null);
      return;
    }

    const file = e.target.files[0];
    // Client-side PDF and size validation
    const validation = validateUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      setFileError(validation.error || "Invalid file format.");
      setAttachmentFile(null);
      e.target.value = "";
      return;
    }

    setAttachmentFile({
      name: file.name,
      size: file.size,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await createCircular({
        circular_no: formData.refNo,
        title: formData.title,
        description: formData.content,
        department: formData.department,
        year: formData.year === "0" ? null : Number(formData.year),
        section: formData.section,
        deadline: formData.deadline ? formData.deadline : null,
        priority: formData.priority,
        signatory: formData.signatory,
        contact_email: formData.contactEmail,
        attachment_name: attachmentFile?.name,
        attachment_size: attachmentFile
          ? `${(attachmentFile.size / (1024 * 1024)).toFixed(1)} MB`
          : undefined,
      });

      if (!res.success || !res.circular) {
        setErrorMessage(res.error || "Failed to create circular.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      const origin = typeof window !== "undefined" ? window.location.origin : "https://campushub.edu";
      const text = generateCircularShareText({
        title: res.circular.title,
        deadline: res.circular.deadline,
        url: `${origin}/circulars/${res.circular.id}`,
      });
      setShareText(text);
      setShareModalOpen(true);
      setSubmitting(false);
    } catch {
      setErrorMessage("An unexpected network error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell role="faculty" userName="Prof. K. Sharma">
      <div className="pb-3">
        <Link
          href="/faculty/circulars"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Circulars</span>
        </Link>
      </div>

      <PageHeader
        title="Issue Official Circular"
        description="Publish an official departmental notice. Configure cohort targeting so only applicable students receive this notice."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl pb-12">
        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-sm">Circular issued successfully! Redirecting...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Basic Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notice Details</CardTitle>
            <CardDescription>
              Reference number, title, and priority categorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Reference Number *"
                value={formData.refNo}
                onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                required
              />

              <Select
                label="Priority Level *"
                options={priorities}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                required
              />
            </div>

            <Input
              label="Circular Title *"
              placeholder="e.g. Schedule of Practical Laboratory Examinations"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </CardContent>
        </Card>

        {/* 2. Cohort Targeting Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Cohort Targeting</CardTitle>
            </div>
            <CardDescription>
              Restrict circular visibility to applicable students only. Non-targeted students will not have access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Target Department *"
                options={targetCohorts}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />

              <Select
                label="Target Academic Year *"
                options={targetYears}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />

              <Select
                label="Target Class Section *"
                options={targetSections}
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-600 dark:text-slate-400">
              <strong>Target Preview:</strong> This circular will be delivered to{" "}
              <strong>
                {formData.department === "All" ? "all departments" : `${formData.department} branch`}
                {formData.year === "0" ? ", all academic years" : `, Year ${formData.year}`}
                {formData.section === "All" ? ", all sections" : `, Section ${formData.section}`}
              </strong>
              .
            </div>
          </CardContent>
        </Card>

        {/* 3. Deadlines & Detailed Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content & Action Deadline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Action Deadline (Optional)"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />

            <Textarea
              label="Circular Notice Text *"
              placeholder="Provide complete guidelines, room assignments, instructions, and regulations..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Signatory Authority *"
                value={formData.signatory}
                onChange={(e) => setFormData({ ...formData, signatory: e.target.value })}
                required
              />

              <Input
                label="Department Contact Email *"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 4. PDF Attachment & Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document Attachment (PDF)</CardTitle>
            <CardDescription>
              Upload official signed PDF notice. Maximum file size: 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center space-y-2">
              <Upload className="h-8 w-8 mx-auto text-slate-400" />
              <div>
                <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                  <span>Choose PDF file from computer</span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Only .pdf files up to 10MB are permitted.
                </p>
              </div>

              {attachmentFile && (
                <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold mt-2">
                  <FileText className="h-4 w-4" />
                  <span>{attachmentFile.name} ({(attachmentFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
              )}

              {fileError && (
                <div className="text-xs text-red-600 font-semibold mt-2">
                  {fileError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link href="/faculty/circulars" className="w-full sm:w-auto">
            <Button variant="outline" fullWidth type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="sm:w-auto"
            isLoading={submitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Issue Circular
          </Button>
        </div>
      </form>

      {/* Post-publish WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          router.push("/faculty/circulars");
        }}
        title="Share Circular on WhatsApp"
        shareText={shareText}
      />
    </DashboardShell>
  );
}
