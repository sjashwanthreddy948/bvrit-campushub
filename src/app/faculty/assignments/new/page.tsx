"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Check,
  AlertCircle,
  ExternalLink,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createAssignment } from "@/lib/assignments/actions";
import { WhatsAppShareModal } from "@/components/ui/WhatsAppShareModal";
import { generateAssignmentShareText } from "@/lib/share/whatsapp";

const departments = [
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "ECE", label: "Electronics & Communication Engineering" },
  { value: "MECH", label: "Mechanical Engineering" },
  { value: "CIVIL", label: "Civil Engineering" },
];

const years = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

const sections = [
  { value: "All", label: "All Sections" },
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
];

export default function NewAssignmentReminderPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    subjectCode: "CS304",
    subjectName: "Operating Systems",
    title: "",
    department: "CSE",
    year: "3",
    section: "A",
    dueDate: "",
    submissionUrl: "https://vedicai.student.edwisely.com/#/assignments/cs304-lab3",
    description: "",
    maxMarks: "25",
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [shareText, setShareText] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await createAssignment({
        subject_code: formData.subjectCode,
        subject_name: formData.subjectName,
        title: formData.title,
        department: formData.department,
        year: Number(formData.year),
        section: formData.section,
        deadline: formData.dueDate,
        submission_url: formData.submissionUrl,
        description: formData.description,
        max_marks: Number(formData.maxMarks) || 25,
      });

      if (!res.success || !res.assignment) {
        setErrorMessage(res.error || "Failed to create assignment reminder.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      const text = generateAssignmentShareText({
        title: `${res.assignment.subject_code}: ${res.assignment.title}`,
        deadline: res.assignment.deadline,
        submissionUrl: res.assignment.submission_url,
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
          href="/faculty/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assignments</span>
        </Link>
      </div>

      <PageHeader
        title="Schedule Assignment Reminder"
        description="Notify students about an upcoming lab task, problem set, or presentation deadline with direct Vedic.ai submission links."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl pb-12">
        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-sm">Assignment reminder scheduled! Redirecting...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Subject & Title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course & Task Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Subject Code *"
                placeholder="e.g. CS304"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                required
              />

              <Input
                label="Subject Name *"
                placeholder="e.g. Operating Systems"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Assignment Task Title *"
              placeholder="e.g. Lab Assignment 3: Virtual Memory Page Replacement"
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
              Specify which class cohort will receive this assignment reminder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Department *"
                options={departments}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />

              <Select
                label="Academic Year *"
                options={years}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />

              <Select
                label="Class Section *"
                options={sections}
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Deadlines & Vedic.ai Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission & Deadline Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Submission Deadline *"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />

              <Input
                label="Maximum Marks"
                type="number"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Official Vedic.ai / Edwisely Submission Link *"
                placeholder="https://vedicai.student.edwisely.com/#/assignments/..."
                value={formData.submissionUrl}
                onChange={(e) => setFormData({ ...formData, submissionUrl: e.target.value })}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Direct URL to the student submission assignment slot on Vedic.ai (Edwisely portal or mobile app).
              </p>
            </div>

            <Textarea
              label="Instructions & Details *"
              placeholder="Provide problem specifications, algorithm constraints, and test case expectations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link href="/faculty/assignments" className="w-full sm:w-auto">
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
            Schedule Reminder
          </Button>
        </div>
      </form>

      {/* Post-publish WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          router.push("/faculty/assignments");
        }}
        title="Share Assignment Reminder on WhatsApp"
        shareText={shareText}
      />
    </DashboardShell>
  );
}
