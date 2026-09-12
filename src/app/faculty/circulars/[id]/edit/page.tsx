"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  FileText,
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
import { getCircularById, updateCircular } from "@/lib/circulars/actions";

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

export default function EditCircularPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "circ-1";

  const [loading, setLoading] = React.useState(true);
  const [formData, setFormData] = React.useState({
    title: "",
    refNo: "",
    priority: "normal" as "normal" | "urgent" | "critical",
    department: "CSE",
    year: "0",
    section: "All",
    deadline: "",
    content: "",
    signatory: "",
    contactEmail: "",
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getCircularById(id);
        if (res.circular) {
          const c = res.circular;
          setFormData({
            title: c.title,
            refNo: c.circular_no,
            priority: c.priority,
            department: c.department || "All",
            year: c.year ? String(c.year) : "0",
            section: c.section || "All",
            deadline: c.deadline ? c.deadline.split("T")[0] : "",
            content: c.description,
            signatory: c.signatory || c.posted_by_name,
            contactEmail: c.contact_email || "office@college.edu",
          });
        } else {
          setErrorMessage("Circular not found.");
        }
      } catch {
        setErrorMessage("Failed to load circular details.");
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
      const res = await updateCircular(id, {
        circular_no: formData.refNo,
        title: formData.title,
        description: formData.content,
        department: formData.department,
        year: formData.year === "0" ? null : Number(formData.year),
        section: formData.section,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        priority: formData.priority,
        signatory: formData.signatory,
        contact_email: formData.contactEmail,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update circular.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push("/faculty/circulars");
      }, 1200);
    } catch {
      setErrorMessage("An unexpected network error occurred.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell role="faculty" userName="Prof. K. Sharma">
        <LoadingState message="Loading circular editor..." />
      </DashboardShell>
    );
  }

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
        title="Edit Circular Notice"
        description="Update circular specifications, instructions, or targeting parameters."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl pb-12">
        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-sm">Circular updated successfully! Redirecting...</span>
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
              Update audience targeting. Only students in selected groups will be permitted to access.
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
          </CardContent>
        </Card>

        {/* 3. Deadlines & Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content & Dates</CardTitle>
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
            Save Changes
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
