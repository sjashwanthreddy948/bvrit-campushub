"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Share2,
  Sparkles,
  RotateCcw,
  FileText,
  Info,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppShareModal } from "@/components/ui/WhatsAppShareModal";
import { createOpportunity } from "@/lib/opportunities/actions";
import { generateOpportunityReminderText } from "@/lib/share/whatsapp";
import { extractOpportunityDetails } from "@/lib/ai/actions";
import { OpportunityType } from "@/types/database";

const opportunityTypes = [
  { value: "internship", label: "Internship" },
  { value: "job", label: "Full-Time Job" },
  { value: "hackathon", label: "Hackathon / Competition" },
  { value: "scholarship", label: "Scholarship / Fellowship" },
  { value: "workshop", label: "Workshop / Bootcamp" },
  { value: "other", label: "Other Opportunity" },
];

const workModes = [
  { value: "Hybrid", label: "Hybrid" },
  { value: "On-site", label: "On-site" },
  { value: "Remote", label: "Remote" },
];

const targetDepartments = [
  { value: "All", label: "All Departments (Entire Campus)" },
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "IT", label: "Information Technology" },
  { value: "ECE", label: "Electronics & Communication Engineering" },
  { value: "EEE", label: "Electrical & Electronics Engineering" },
  { value: "MECH", label: "Mechanical Engineering" },
];

const targetYears = [
  { value: "0", label: "All Years (1st to 4th)" },
  { value: "3", label: "3rd Year (Pre-Final Year)" },
  { value: "4", label: "4th Year (Graduating Batch)" },
  { value: "2", label: "2nd Year" },
];

const initialFormState = {
  title: "",
  company: "",
  type: "internship" as OpportunityType,
  deadline: "",
  eligibility: "",
  skills: "",
  location: "Hyderabad / Bangalore",
  work_mode: "Hybrid",
  stipend: "",
  package: "",
  application_url: "",
  description: "",
  department: "CSE",
  year: "3",
  section: "All",
};

export default function NewCoordinatorOpportunityPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState(initialFormState);

  // AI Extractor State
  const [isAiModalOpen, setIsAiModalOpen] = React.useState(false);
  const [rawText, setRawText] = React.useState("");
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  // Form State
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // WhatsApp Post-Publish Modal
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [shareText, setShareText] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRunAiExtraction = async () => {
    if (!rawText.trim() || rawText.trim().length < 15) {
      setAiError("Please paste at least 15 characters of recruiter notice text.");
      return;
    }

    setIsExtracting(true);
    setAiError(null);

    try {
      const res = await extractOpportunityDetails(rawText);
      if (!res.success || !res.data) {
        setAiError(res.error || "Failed to extract structured fields.");
        setIsExtracting(false);
        return;
      }

      const d = res.data;
      setFormData((prev) => ({
        ...prev,
        title: d.title || prev.title,
        company: d.company || prev.company,
        type: (d.type as OpportunityType) || prev.type,
        deadline: d.deadline || prev.deadline,
        eligibility: d.eligibility || prev.eligibility,
        skills: Array.isArray(d.skills) ? d.skills.join(", ") : (d.skills || prev.skills),
        location: d.location || prev.location,
        work_mode: d.work_mode || prev.work_mode,
        stipend: d.stipend || prev.stipend,
        package: d.package || prev.package,
        application_url: d.application_url || prev.application_url,
        description: d.description || prev.description,
        department: d.department || prev.department,
        year: d.year ? String(d.year) : prev.year,
      }));

      setIsAiModalOpen(false);
    } catch {
      setAiError("Extraction service is temporarily unavailable.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.title?.trim() || !formData.company?.trim() || !formData.deadline || !formData.eligibility?.trim()) {
      setErrorMessage("Please complete all required fields (Title, Company, Eligibility, and Deadline).");
      return;
    }

    setSubmitting(true);

    try {
      let appUrl = formData.application_url?.trim() || "";
      if (appUrl && !appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
        appUrl = `https://${appUrl}`;
      } else if (!appUrl) {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://campushub.bvrit.ac.in";
        appUrl = `${origin}/opportunities`;
      }

      const res = await createOpportunity({
        ...formData,
        application_url: appUrl,
        year: formData.year === "0" ? null : parseInt(formData.year, 10),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to publish placement drive.");
        setSubmitting(false);
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "https://campushub.bvrit.ac.in";
      const reminder = generateOpportunityReminderText({
        title: formData.title,
        company: formData.company,
        type: formData.type,
        eligibility: formData.eligibility,
        deadline: formData.deadline,
        stipend: formData.stipend,
        package: formData.package,
        location: formData.location,
        work_mode: formData.work_mode,
        skills: formData.skills,
        url: `${origin}/opportunities/${res.opportunity?.id || ""}`,
      });

      setShareText(reminder);
      setIsShareModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while publishing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell role="coordinator" userName="Dr. Lakshmi (Placement Officer)">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Link
            href="/coordinator/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors min-h-[44px] py-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Coordination Hub
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAiModalOpen(true)}
            leftIcon={<Sparkles className="h-4 w-4 text-purple-600" />}
            className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 min-h-[40px]"
          >
            AI Recruiter Parser
          </Button>
        </div>

        <PageHeader
          title="Publish Placement Drive"
          description="Create and broadcast verified campus placements, internships, and hackathons with section-level targeting."
          badge={<Badge variant="purple">Placement Cell Authorization</Badge>}
        />

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* AI Extractor Modal */}
        {isAiModalOpen && (
          <Card className="border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/20 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Opportunity Extractor</CardTitle>
                    <CardDescription className="text-xs">
                      Paste unstructured job circular text or recruiter email to auto-fill form fields
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAiModalOpen(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Example: 'Amazon Web Services is hiring 3rd year B.Tech CSE students for SDE Intern. Python/Java required. Stipend 1.1L/month. Apply before Sept 18...'"
              />
              {aiError && <p className="text-xs text-red-600 font-medium">{aiError}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={handleRunAiExtraction}
                  isLoading={isExtracting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Extract Fields
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Drive Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recruitment Information</CardTitle>
              <CardDescription>Core details visible to students across all cohorts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Role Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer Intern 2027"
                  required
                />
                <Input
                  label="Hiring Company / Organization *"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Amazon Web Services"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Opportunity Type *"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={opportunityTypes}
                />
                <Select
                  label="Work Mode *"
                  name="work_mode"
                  value={formData.work_mode}
                  onChange={handleChange}
                  options={workModes}
                />
                <Input
                  label="Job Location *"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad / Bangalore"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Monthly Stipend (Internships)"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  placeholder="e.g. ₹1,10,000 / month"
                />
                <Input
                  label="Full-Time CTC / Package"
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                  placeholder="e.g. ₹28 - 44 LPA (PPO)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Application Deadline *"
                  name="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Official Application / Portal Link *"
                  name="application_url"
                  type="url"
                  value={formData.application_url}
                  onChange={handleChange}
                  placeholder="https://amazon.jobs/..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Eligibility &amp; Target Cohort</CardTitle>
              <CardDescription>Specify academic eligibility requirements and section targeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Eligibility Criteria *"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                placeholder="e.g. B.Tech CSE/IT, CGPA >= 7.5, 2027 Graduating Batch, No backlogs"
                required
              />

              <Input
                label="Required Technical Skills (Comma-separated) *"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Data Structures, Java, AWS, React"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Target Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  options={targetDepartments}
                />
                <Select
                  label="Target Batch / Year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  options={targetYears}
                />
              </div>

              <Textarea
                label="Detailed Job Description &amp; Responsibilities"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Outline core responsibilities, interview rounds, and qualifications..."
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/coordinator/dashboard")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] px-6"
            >
              Publish &amp; Ready WhatsApp Reminder
            </Button>
          </div>
        </form>

        {/* WhatsApp Share / Reminder Modal */}
        <WhatsAppShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            router.push("/coordinator/dashboard");
          }}
          title="Placement Drive Published!"
          subtitle="Your drive has been published to CampusHub. The WhatsApp reminder text is ready below to broadcast to student class groups."
          shareText={shareText}
          badgeLabel="PLACEMENT DRIVE READY"
        />
      </div>
    </DashboardShell>
  );
}
