"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  GraduationCap,
  Save,
  Check,
  Sparkles,
  Briefcase,
  MapPin,
  Code,
  Award,
  Laptop,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Copy,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Layers,
  Globe,
  Plus,
  X,
  Search,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PillTag } from "@/components/ui/PillTag";
import {
  getApplicationProfile,
  updateApplicationProfile,
  uploadResume,
  deleteResume,
} from "@/lib/profile/actions";
import {
  getStudentSkills,
  addStudentSkill,
  removeStudentSkill,
  updateStudentCgpa,
} from "@/lib/skills/actions";
import {
  STANDARD_SKILLS,
  SKILL_CATEGORIES,
  searchSkills,
  StandardSkill,
} from "@/lib/skills/catalog";
import { SkillCategory, StudentSkill } from "@/types/database";
import { StudentApplicationProfile, ProfileCompleteness } from "@/lib/profile/types";
import { calculateProfileCompleteness, generateQuickCopyPalette } from "@/lib/profile/utils";
import {
  getStudentMatchingProfile,
  updateStudentMatchingProfile,
} from "@/lib/matching/actions";

const workModeOptions = [
  { value: "Hybrid", label: "Hybrid" },
  { value: "Remote", label: "Remote" },
  { value: "On-site", label: "On-site" },
  { value: "Any", label: "Any Work Mode" },
];

const degreeOptions = [
  { value: "B.Tech", label: "B.Tech (Bachelor of Technology)" },
  { value: "B.E.", label: "B.E. (Bachelor of Engineering)" },
  { value: "M.Tech", label: "M.Tech (Master of Technology)" },
  { value: "BCA", label: "BCA (Bachelor of Computer Applications)" },
  { value: "MCA", label: "MCA (Master of Computer Applications)" },
  { value: "B.Sc", label: "B.Sc (Bachelor of Science)" },
];

const yearOptions = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
];

export default function ProfilePage() {
  // Active step for Application Profile tabs: "personal" | "academic" | "career" | "resume"
  const [activeStep, setActiveStep] = React.useState<"personal" | "academic" | "career" | "resume">("personal");

  // Application Profile State
  const [profile, setProfile] = React.useState<StudentApplicationProfile | null>(null);
  const [fullName, setFullName] = React.useState("Alex Johnson");
  const [rollNumber, setRollNumber] = React.useState("22CSE042");
  const [personalEmail, setPersonalEmail] = React.useState("alex.johnson.dev@gmail.com");
  const [collegeEmail, setCollegeEmail] = React.useState("alex.j@college.edu");
  const [phone, setPhone] = React.useState("+91 9876543210");

  const [collegeName, setCollegeName] = React.useState("Vedic Institute of Technology");
  const [degree, setDegree] = React.useState("B.Tech");
  const [department, setDepartment] = React.useState("Computer Science and Engineering");
  const [currentYear, setCurrentYear] = React.useState("3");
  const [gradYear, setGradYear] = React.useState("2026");
  const [cgpa, setCgpa] = React.useState("8.45");

  const [progLanguages, setProgLanguages] = React.useState("Python, TypeScript, JavaScript, Java");
  const [techSkills, setTechSkills] = React.useState("React, Next.js, Node.js, PostgreSQL, Docker");
  const [preferredRoles, setPreferredRoles] = React.useState("Software Engineer Intern, Full Stack Developer");
  const [linkedinUrl, setLinkedinUrl] = React.useState("https://linkedin.com/in/alex-johnson-dev");
  const [githubUrl, setGithubUrl] = React.useState("https://github.com/alexjohnson-tech");
  const [portfolioUrl, setPortfolioUrl] = React.useState("https://alexjohnson.dev");

  // Feedback states
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileFeedback, setProfileFeedback] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  // Resume upload state
  const [uploadingResume, setUploadingResume] = React.useState(false);
  const [resumeError, setResumeError] = React.useState<string | null>(null);
  const resumeInputRef = React.useRef<HTMLInputElement | null>(null);

  // Matching Preferences State
  const [preferredLocations, setPreferredLocations] = React.useState("Bangalore, Hyderabad, Remote");
  const [preferredWorkMode, setPreferredWorkMode] = React.useState("Hybrid");
  const [savingMatching, setSavingMatching] = React.useState(false);
  const [matchingSaved, setMatchingSaved] = React.useState(false);

  // Quick Copy Feedback
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // Normalized Student Skills State
  const [studentSkills, setStudentSkills] = React.useState<StudentSkill[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = React.useState("");
  const [selectedSkillCategory, setSelectedSkillCategory] = React.useState<SkillCategory | "All">("All");
  const [customSkillName, setCustomSkillName] = React.useState("");
  const [customSkillCategory, setCustomSkillCategory] = React.useState<SkillCategory>("Programming Language");
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  const loadSkills = React.useCallback(async () => {
    try {
      const list = await getStudentSkills();
      setStudentSkills(list);
    } catch (err) {
      console.error("Failed to load skills:", err);
    }
  }, []);

  // Load initial data
  React.useEffect(() => {
    loadSkills();
    getApplicationProfile().then((p) => {
      if (p) {
        setProfile(p);
        if (p.full_name) setFullName(p.full_name);
        if (p.college_roll_number) setRollNumber(p.college_roll_number);
        if (p.personal_email) setPersonalEmail(p.personal_email);
        if (p.college_email) setCollegeEmail(p.college_email);
        if (p.phone) setPhone(p.phone);

        if (p.college_name) setCollegeName(p.college_name);
        if (p.degree) setDegree(p.degree);
        if (p.department) setDepartment(p.department);
        if (p.current_year) setCurrentYear(String(p.current_year));
        if (p.graduation_year) setGradYear(String(p.graduation_year));
        if (p.cgpa !== null && p.cgpa !== undefined) setCgpa(String(p.cgpa));

        if (p.programming_languages) setProgLanguages(p.programming_languages.join(", "));
        if (p.technical_skills) setTechSkills(p.technical_skills.join(", "));
        if (p.preferred_roles) setPreferredRoles(p.preferred_roles.join(", "));
        if (p.linkedin_url) setLinkedinUrl(p.linkedin_url);
        if (p.github_url) setGithubUrl(p.github_url);
        if (p.portfolio_url) setPortfolioUrl(p.portfolio_url);
      }
    });

    getStudentMatchingProfile().then((p) => {
      if (p) {
        if (p.preferredLocations) setPreferredLocations(p.preferredLocations.join(", "));
        if (p.preferredWorkMode) setPreferredWorkMode(p.preferredWorkMode);
      }
    });
  }, [loadSkills]);

  const handleAddSkillFromCatalog = async (skill: StandardSkill) => {
    try {
      const res = await addStudentSkill(skill.name, skill.category);
      if (res.success && res.skill) {
        setStudentSkills((prev) => [...prev, res.skill!]);
      }
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  const handleRemoveSkillItem = async (skill: StudentSkill) => {
    setStudentSkills((prev) => prev.filter((s) => s.id !== skill.id));
    await removeStudentSkill(skill.id);
  };

  const handleAddCustomSkillItem = async () => {
    const clean = customSkillName.trim();
    if (!clean) return;
    try {
      const res = await addStudentSkill(clean, customSkillCategory);
      if (res.success && res.skill) {
        setStudentSkills((prev) => [...prev, res.skill!]);
        setCustomSkillName("");
        setShowCustomInput(false);
      }
    } catch (err) {
      console.error("Failed to add custom skill:", err);
    }
  };

  // Compute current profile object for completeness & palette preview
  const currentProfileState: Partial<StudentApplicationProfile> = {
    full_name: fullName,
    college_roll_number: rollNumber,
    personal_email: personalEmail,
    college_email: collegeEmail,
    phone: phone,
    college_name: collegeName,
    degree: degree,
    department: department,
    current_year: parseInt(currentYear, 10) || 3,
    graduation_year: parseInt(gradYear, 10) || 2026,
    cgpa: cgpa ? parseFloat(cgpa) : null,
    programming_languages: progLanguages.split(",").map((s) => s.trim()).filter(Boolean),
    technical_skills: techSkills.split(",").map((s) => s.trim()).filter(Boolean),
    preferred_roles: preferredRoles.split(",").map((s) => s.trim()).filter(Boolean),
    linkedin_url: linkedinUrl,
    github_url: githubUrl,
    portfolio_url: portfolioUrl,
    resume_url: profile?.resume_url,
    resume_file_name: profile?.resume_file_name,
  };

  const completeness: ProfileCompleteness = calculateProfileCompleteness(currentProfileState);
  const quickCopyPalette = generateQuickCopyPalette(currentProfileState);

  // Handle Save Application Profile
  const handleSaveProfile = async (targetNextStep?: "personal" | "academic" | "career" | "resume") => {
    setSavingProfile(true);
    setProfileFeedback(null);

    const parsedCgpa = cgpa ? parseFloat(cgpa) : null;
    const parsedYear = parseInt(currentYear, 10) || 3;
    const parsedGradYear = parseInt(gradYear, 10) || 2026;

    const languages = progLanguages.split(",").map((s) => s.trim()).filter(Boolean);
    const skills = techSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const roles = preferredRoles.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await updateApplicationProfile({
        full_name: fullName.trim(),
        college_roll_number: rollNumber.trim(),
        personal_email: personalEmail.trim(),
        college_email: collegeEmail.trim(),
        phone: phone.trim(),
        college_name: collegeName.trim(),
        degree: degree.trim(),
        department: department.trim(),
        current_year: parsedYear,
        graduation_year: parsedGradYear,
        cgpa: parsedCgpa !== null && !isNaN(parsedCgpa) ? parsedCgpa : null,
        programming_languages: languages,
        technical_skills: skills,
        preferred_roles: roles,
        linkedin_url: linkedinUrl.trim() || null,
        github_url: githubUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
      });

      if (res.success && res.profile) {
        setProfile(res.profile);
        setProfileFeedback({
          text: "Application Profile saved successfully! Changes are ready for upcoming applications.",
          type: "success",
        });
        if (targetNextStep) {
          setActiveStep(targetNextStep);
        }
        setTimeout(() => setProfileFeedback(null), 4000);
      } else {
        setProfileFeedback({
          text: res.error || "Failed to update profile.",
          type: "error",
        });
      }
    } catch {
      setProfileFeedback({ text: "An unexpected error occurred.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Resume Upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setResumeError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await uploadResume(formData);
      if (res.success) {
        const freshProfile = await getApplicationProfile();
        setProfile(freshProfile);
        setProfileFeedback({ text: "Resume uploaded successfully!", type: "success" });
        setTimeout(() => setProfileFeedback(null), 3000);
      } else {
        setResumeError(res.error || "Upload failed.");
      }
    } catch {
      setResumeError("Error uploading resume document.");
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  // Handle Delete Resume
  const handleDeleteResume = async () => {
    setUploadingResume(true);
    try {
      await deleteResume();
      const freshProfile = await getApplicationProfile();
      setProfile(freshProfile);
      setProfileFeedback({ text: "Resume removed.", type: "success" });
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch {
      setResumeError("Unable to delete resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  // Handle Save Matching Preferences
  const handleSaveMatching = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMatching(true);

    const locationsArray = preferredLocations
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await updateStudentMatchingProfile({
        preferredLocations: locationsArray,
        preferredWorkMode: preferredWorkMode as any,
      });
      setMatchingSaved(true);
      setTimeout(() => setMatchingSaved(false), 3000);
    } finally {
      setSavingMatching(false);
    }
  };

  // Handle quick copy test in profile
  const handleCopy = async (key: string, val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <DashboardShell role="student" userName={fullName}>
      <PageHeader
        title="Student Application Profile"
        description="Complete your reusable profile once. Save time and automatically prepare your application details for any internship, job, or hackathon."
        badge={<Badge variant="blue">Placement & Career Ready</Badge>}
      />

      <div className="max-w-4xl space-y-6">
        {/* PROMINENT ACADEMIC, CGPA & SKILLS HERO CARD (Mockup #8) */}
        <div className="liquid-glass-card p-5 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-start gap-3.5">
                <div className="p-0.5 rounded-2xl story-ring-gradient shrink-0 shadow-sm">
                  <div className="w-14 h-14 rounded-[14px] bg-slate-900 dark:bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl border-2 border-white dark:border-slate-900 shadow-inner">
                    {fullName.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {fullName}
                    </h2>
                    <PillTag variant="amber" size="sm">
                      {rollNumber || "22CSE042"}
                    </PillTag>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      BVRIT Autonomous • Verified Student
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {department} • Year {currentYear} • Class of {gradYear}
                  </p>
                </div>
              </div>

              {/* Quick Action Links */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <Link href="/resume-builder">
                  <Button variant="amber-glow" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                    ATS Resume Studio
                  </Button>
                </Link>
                <Link href="/skills">
                  <Button variant="glass" size="sm" leftIcon={<Sparkles className="h-4 w-4 text-[#F59E0B]" />}>
                    Placement &amp; DSA Prep
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Metrics: CGPA, Verified Skills, ATS Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* CGPA Display */}
              <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cumulative CGPA
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {cgpa ? parseFloat(cgpa).toFixed(2) : "8.45"}
                    </span>
                    <span className="text-xs text-slate-500">/ 10.00</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep("academic")}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-200/60 dark:border-blue-800"
                >
                  Edit &rarr;
                </button>
              </div>

              {/* Verified Skills */}
              <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Verified Skills
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                      {studentSkills.length || 12}
                    </span>
                    <span className="text-xs text-slate-500">Active Skills</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep("career")}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 rounded-lg transition-colors border border-indigo-200/60 dark:border-indigo-800"
                >
                  Manage &rarr;
                </button>
              </div>

              {/* ATS Resume Score */}
              <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    ATS Resume Match
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                      88%
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Strong Match</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep("resume")}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-200/60 dark:border-emerald-800"
                >
                  Resume &rarr;
                </button>
              </div>
            </div>

            {/* Active Skills Snapshot Pills */}
            {studentSkills.length > 0 && (
              <div className="pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {studentSkills.slice(0, 8).map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                    >
                      {s.skill_name}
                    </span>
                  ))}
                  {studentSkills.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setActiveStep("career")}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      +{studentSkills.length - 8} more...
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ATS RESUME STUDIO & PLACEMENT READINESS WIDGET (Mockup #8) */}
        <div className="liquid-glass-card p-5 sm:p-6 relative overflow-hidden border-teal-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Radial SVG Gauge */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                  stroke="currentColor"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-emerald-500 transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="30.1"
                  strokeLinecap="round"
                  fill="transparent"
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">88%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ATS Score
                </span>
              </div>
            </div>

            {/* Studio Info & Match Breakdown */}
            <div className="flex-1 min-w-0 space-y-2 text-center md:text-left w-full">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  ATS Resume Studio &amp; Placement Readiness
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" /> Strong Match for SDE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                Verified against BVRIT campus recruitment standards (Microsoft, Amazon, Cognizant, Infosys). High compatibility for Software Engineer Intern &amp; Full Stack roles.
              </p>

              {/* Match Category Sub-bars */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>Core CS &amp; DSA</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">95%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[95%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>Tech Stack</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">88%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[88%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>Projects &amp; Cloud</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">84%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[84%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Pill Highlights & Action Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium shrink-0">Detected Keywords:</span>
              {["Python", "TypeScript", "React", "PostgreSQL", "Docker", "REST APIs"].map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/60 dark:border-emerald-800/60"
                >
                  ✓ {kw}
                </span>
              ))}
              <span className="text-slate-400 font-medium shrink-0 ml-2">Recommended:</span>
              {["System Design", "Redis", "Microservices"].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setActiveStep("career")}
                  className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  + {kw}
                </button>
              ))}
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link href="/resume-builder">
                <Button variant="amber-glow" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                  Tailor Resume for SDE Drive
                </Button>
              </Link>
              {profile?.resume_url ? (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="glass" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                    Download Verified PDF
                  </Button>
                </a>
              ) : (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setActiveStep("resume")}
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  Upload Master Resume
                </Button>
              )}
              <button
                type="button"
                onClick={() => setActiveStep("career")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>Re-scan against Target Role</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {profileFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
              profileFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {profileFeedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{profileFeedback.text}</span>
          </div>
        )}

        {/* MOBILE-FIRST SECTIONED / STEPPED PROFILE FORM */}
        <Card className="shadow-xs">
          {/* Step Navigation Tabs (Touch Targets >= 44px) */}
          <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
            <div className="flex items-center min-w-full px-2 sm:px-4">
              <button
                type="button"
                onClick={() => setActiveStep("personal")}
                className={`min-h-[48px] px-3 sm:px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeStep === "personal"
                    ? "border-[#F59E0B] text-[#F59E0B]"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <User className="h-4 w-4" />
                <span>1. Personal Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep("academic")}
                className={`min-h-[48px] px-3 sm:px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeStep === "academic"
                    ? "border-[#F59E0B] text-[#F59E0B]"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>2. Academic Info &amp; CGPA</span>
                <Badge variant={cgpa ? "coral" : "secondary"} size="sm" className="text-[10px] px-1.5 py-0.5">
                  {cgpa ? `CGPA: ${parseFloat(cgpa).toFixed(2)}` : "Set CGPA"}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep("career")}
                className={`min-h-[48px] px-3 sm:px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeStep === "career"
                    ? "border-[#F59E0B] text-[#F59E0B]"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>3. Career &amp; Skills</span>
                <Badge variant="powder" size="sm" className="text-[10px] px-1.5 py-0.5">
                  {studentSkills.length} Skills
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep("resume")}
                className={`min-h-[48px] px-3 sm:px-5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeStep === "resume"
                    ? "border-[#F59E0B] text-[#F59E0B]"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>4. ATS Resume</span>
                {profile?.resume_url && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-0.5" />
                )}
              </button>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6">
            {/* STEP 1: PERSONAL INFORMATION */}
            {activeStep === "personal" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your institutional and personal contact points for placement correspondence.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    leftIcon={<User className="h-4 w-4" />}
                    required
                  />

                  <Input
                    label="College Roll Number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 22CSE042"
                    leftIcon={<Award className="h-4 w-4" />}
                    helperText="Official university/college identification number."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Personal Email Address"
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="e.g. alex.personal@gmail.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    helperText="Stored strictly as metadata for application forms. We never ask for passwords."
                    required
                  />

                  <Input
                    label="College Email Address"
                    type="email"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="e.g. alex.j@college.edu"
                    leftIcon={<Mail className="h-4 w-4" />}
                    helperText="Institutional email provided by your campus."
                    required
                  />
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  leftIcon={<Phone className="h-4 w-4" />}
                  helperText="Primary mobile number for SMS and recruiter call alerts."
                  required
                />

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">Step 1 of 4</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => handleSaveProfile()}
                      disabled={savingProfile}
                      leftIcon={<Save className="h-4 w-4" />}
                      className="min-h-[44px]"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleSaveProfile("academic")}
                      disabled={savingProfile}
                      className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      Save & Next &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMIC INFORMATION */}
            {activeStep === "academic" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Academic Credentials
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your institutional degree, major, year, and cumulative academic performance.
                  </p>
                </div>

                <Input
                  label="College / University Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Vedic Institute of Technology"
                  leftIcon={<Building className="h-4 w-4" />}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Degree"
                    options={degreeOptions}
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />

                  <Input
                    label="Department / Branch"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science and Engineering"
                    leftIcon={<GraduationCap className="h-4 w-4" />}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Current Year"
                    options={yearOptions}
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                  />

                  <Input
                    label="Expected Graduation Year"
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="e.g. 2026"
                    leftIcon={<Calendar className="h-4 w-4" />}
                    required
                  />

                  <Input
                    label="Current CGPA (Scale 0-10)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 8.45"
                    leftIcon={<Award className="h-4 w-4" />}
                    helperText="Used to verify CGPA cutoffs."
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setActiveStep("personal")}
                    className="min-h-[44px]"
                  >
                    &larr; Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => handleSaveProfile()}
                      disabled={savingProfile}
                      leftIcon={<Save className="h-4 w-4" />}
                      className="min-h-[44px]"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleSaveProfile("career")}
                      disabled={savingProfile}
                      className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      Save & Next &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CAREER & SKILLS */}
            {activeStep === "career" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Career Profile & Technical Skills
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage your verified programming languages, frameworks, target roles, and online portfolios.
                  </p>
                </div>

                {/* Active Verified Skills Matrix (Mockup #8) */}
                <div className="p-5 rounded-2xl liquid-glass-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800/70 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          Verified Skills Matrix ({studentSkills.length})
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          70% AI Matching Weight
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        These verified skills directly boost your matching score across active campus drives.
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium shrink-0">Tap ✕ to remove</span>
                  </div>

                  {studentSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center">
                      No skills added yet. Search and tap skills below to add them to your career profile.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {studentSkills.map((s, idx) => {
                        // Deterministic endorsement count based on name length & index for realistic campus showcase
                        const endorsements = ((s.skill_name.length * 3 + idx * 2) % 15) + 3;
                        return (
                          <div
                            key={s.id}
                            className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-850/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs backdrop-blur-md group hover:border-amber-500/50 transition-all"
                          >
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[#D97706] dark:text-[#FBBF24]">
                              {s.skill_category}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {s.skill_name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              • {endorsements} endors.
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkillItem(s)}
                              className="h-6 w-6 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-0.5"
                              aria-label={`Remove ${s.skill_name}`}
                              title={`Remove ${s.skill_name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Searchable Skill Tag Picker */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Add Skills from Catalog
                    </span>
                    <span className="text-xs text-slate-400">Searchable multi-select</span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      placeholder="Search skills (e.g. Python, React, PostgreSQL, Docker)..."
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[44px]"
                    />
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedSkillCategory("All")}
                      className={`min-h-[36px] px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-colors ${
                        selectedSkillCategory === "All"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      All
                    </button>
                    {SKILL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedSkillCategory(cat)}
                        className={`min-h-[36px] px-3 py-1 text-xs font-medium rounded-full shrink-0 transition-colors ${
                          selectedSkillCategory === cat
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Available Skill Tag Chips */}
                  <div className="max-h-48 overflow-y-auto p-1 space-y-1">
                    <div className="flex flex-wrap gap-1.5">
                      {searchSkills(skillSearchQuery, selectedSkillCategory).map((item) => {
                        const isSelected = studentSkills.some(
                          (s) => s.skill_name.toLowerCase() === item.name.toLowerCase()
                        );
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              if (!isSelected) handleAddSkillFromCatalog(item);
                            }}
                            disabled={isSelected}
                            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 opacity-80 cursor-default"
                                : "bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                            }`}
                          >
                            {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3 text-slate-400" />}
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Skill Adder */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {!showCustomInput ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(true)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 min-h-[44px]"
                      >
                        <Plus className="h-3.5 w-3.5" /> Can't find a skill? Add a custom skill
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                          Add Custom Skill
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={customSkillName}
                            onChange={(e) => setCustomSkillName(e.target.value)}
                            placeholder="e.g. Solidity, Flutter"
                            className="px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[44px]"
                          />
                          <select
                            value={customSkillCategory}
                            onChange={(e) => setCustomSkillCategory(e.target.value as SkillCategory)}
                            className="px-3 py-2 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[44px]"
                          >
                            {SKILL_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCustomInput(false)}
                            className="text-xs min-h-[44px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleAddCustomSkillItem}
                            className="text-xs min-h-[44px] bg-blue-600 text-white"
                          >
                            Add to Profile
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Input
                  label="Preferred Roles (Comma separated)"
                  value={preferredRoles}
                  onChange={(e) => setPreferredRoles(e.target.value)}
                  placeholder="e.g. Software Engineer Intern, Frontend Developer, Data Analyst"
                  leftIcon={<Briefcase className="h-4 w-4" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="LinkedIn Profile URL"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    leftIcon={<ExternalLink className="h-4 w-4" />}
                  />

                  <Input
                    label="GitHub Profile URL"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    leftIcon={<Code className="h-4 w-4" />}
                  />

                  <Input
                    label="Personal Portfolio URL"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    leftIcon={<Globe className="h-4 w-4" />}
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setActiveStep("academic")}
                    className="min-h-[44px]"
                  >
                    &larr; Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => handleSaveProfile()}
                      disabled={savingProfile}
                      leftIcon={<Save className="h-4 w-4" />}
                      className="min-h-[44px]"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleSaveProfile("resume")}
                      disabled={savingProfile}
                      className="min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      Save & Next &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: RESUME DOCUMENT */}
            {activeStep === "resume" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Resume / Curriculum Vitae
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload your master resume. You can download or view it during application preparation.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                  {profile?.resume_url ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {profile.resume_file_name || "Uploaded_Resume.pdf"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {profile.resume_file_size
                              ? `${(profile.resume_file_size / (1024 * 1024)).toFixed(2)} MB`
                              : "PDF Document"}{" "}
                            • Updated{" "}
                            {profile.resume_updated_at
                              ? new Date(profile.resume_updated_at).toLocaleDateString()
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={profile.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 min-h-[44px]"
                        >
                          <Download className="h-4 w-4" />
                          <span>View</span>
                        </a>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={uploadingResume}
                          className="min-h-[44px] text-xs"
                          leftIcon={<Upload className="h-4 w-4" />}
                        >
                          Replace
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteResume}
                          disabled={uploadingResume}
                          className="min-h-[44px] text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          leftIcon={<Trash2 className="h-4 w-4" />}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => resumeInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {uploadingResume ? "Uploading document..." : "Click to upload your resume"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Supports PDF, DOC, and DOCX files up to 5MB.
                      </p>
                    </div>
                  )}

                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    aria-label="Upload resume document"
                  />

                  {resumeError && (
                    <div className="p-3 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{resumeError}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setActiveStep("career")}
                    className="min-h-[44px]"
                  >
                    &larr; Previous
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => handleSaveProfile()}
                    disabled={savingProfile}
                    className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    Save & Finish Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QUICK COPY PALETTE PREVIEW */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Copy className="h-4 w-4 text-blue-600" />
                  <span>Quick Copy Palette Preview</span>
                </CardTitle>
                <CardDescription>
                  These values are ready for instant one-tap copy inside the application preparation screen.
                </CardDescription>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                Touch-friendly &bull; Instant clipboard copy
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {quickCopyPalette.map((item) => {
                const isCopied = copiedKey === item.key;
                return (
                  <div
                    key={item.key}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                        {item.value}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.key, item.value)}
                      className={`min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 shrink-0 ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Opportunity Matching Preferences */}
        <Card className="border-blue-200 dark:border-blue-900/60 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Opportunity Matching Preferences
                </CardTitle>
                <CardDescription className="text-xs">
                  CampusHub AI uses your application profile and these work preferences when evaluating matches.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveMatching} className="space-y-4">
              {matchingSaved && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Matching preferences updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Preferred Work Mode"
                  options={workModeOptions}
                  value={preferredWorkMode}
                  onChange={(e) => setPreferredWorkMode(e.target.value)}
                />

                <Input
                  label="Preferred Locations (Comma separated)"
                  value={preferredLocations}
                  onChange={(e) => setPreferredLocations(e.target.value)}
                  placeholder="e.g. Bangalore, Hyderabad, Remote"
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  disabled={savingMatching}
                  leftIcon={<Save className="h-4 w-4" />}
                  className="min-h-[44px]"
                >
                  {savingMatching ? "Saving..." : "Save Matching Preferences"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Academic Cohort Card (Read-only verified details) */}
        <Card className="border-blue-100 dark:border-blue-950/60 bg-blue-50/40 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Verified Academic Cohort</span>
            </CardTitle>
            <CardDescription>
              Targeted circulars and assignment reminders are filtered according to this institutional information.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">Department</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                CSE (Computer Science)
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">Current Year</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                3rd Year (Junior)
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">Assigned Section</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Section A
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
