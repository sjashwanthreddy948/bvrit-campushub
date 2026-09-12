"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  BookOpen,
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
import { LoadingState } from "@/components/ui/LoadingState";
import { getAssignmentById, updateAssignment } from "@/lib/assignments/actions";

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

export default function EditAssignmentReminderPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "as-1";

  const [loading, setLoading] = React.useState(true);
  const [formData, setFormData] = React.useState({
    subjectCode: "",
    subjectName: "",
    title: "",
    department: "CSE",
    year: "3",
    section: "A",
    dueDate: "",
    submissionUrl: "",
    description: "",
    maxMarks: "25",
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getAssignmentById(id);
        if (res.assignment) {
          const a = res.assignment;
          setFormData({
            subjectCode: a.subject_code,
            subjectName: a.subject_name,
            title: a.title,
            department: a.department,
            year: String(a.year),
            section: a.section,
            dueDate: a.deadline ? a.deadline.split("T")[0] : "",
            submissionUrl: a.submission_url,
            description: a.description,
            maxMarks: String(a.max_marks || 25),
          });
        } else {
          setErrorMessage("Assignment not found.");
        }
      } catch {
        setErrorMessage("Failed to load assignment details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await updateAssignment(id, {
        subject_code: formData.subjectCode,
        subject_name: formData.subjectName,
        title: formData.title,
        department: formData.department,
        year: Number(formData.year),
        section: formData.section,
        deadline: new Date(formData.dueDate).toISOString(),
        submission_url: formData.submissionUrl,
        description: formData.description,
        max_marks: Number(formData.maxMarks) || 25,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update assignment.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push("/faculty/assignments");
      }, 1200);
    } catch {
      setErrorMessage("An unexpected network error occurred.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell role="faculty" userName="Prof. K. Sharma">
        <LoadingState message="Loading assignment editor..." />
      </DashboardShell>
    );
  }

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
        title="Edit Assignment Reminder"
        description="Update assignment parameters, deadlines, or the Vedic.ai submission URL."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl pb-12">
        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-sm">Assignment updated successfully! Redirecting...</span>
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
            <CardTitle className="text-base">Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Subject Code *"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                required
              />

              <Input
                label="Subject Name *"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Assignment Task Title *"
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

        {/* 3. Deadlines & Vedic.ai URL */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deadline & Vedic.ai Portal</CardTitle>
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

            <Input
              label="Vedic.ai Submission Link *"
              value={formData.submissionUrl}
              onChange={(e) => setFormData({ ...formData, submissionUrl: e.target.value })}
              required
            />

            <Textarea
              label="Instructions & Details *"
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
            Save Changes
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
