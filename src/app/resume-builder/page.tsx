"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { getApplicationProfile } from "@/lib/profile/actions";
import { getStudentSkills } from "@/lib/skills/actions";
import { PillTag } from "@/components/ui/PillTag";

// Resume Data Model strictly optimized for ATS parsers
interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  rollNumber: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;

  education: {
    id: string;
    institution: string;
    degree: string;
    department: string;
    graduationYear: string;
    cgpa: string;
    location: string;
  }[];

  skills: {
    languages: string;
    webCloud: string;
    databases: string;
    toolsFundamentals: string;
  };

  projects: {
    id: string;
    title: string;
    techStack: string;
    liveUrl: string;
    githubUrl: string;
    bullets: string[];
  }[];

  experience: {
    id: string;
    role: string;
    company: string;
    location: string;
    duration: string;
    bullets: string[];
  }[];

  certifications: string[];
}

const DEFAULT_RESUME: ResumeData = {
  fullName: "Alex Johnson",
  title: "Software Engineer & Full Stack Developer",
  email: "alex.johnson.dev@gmail.com",
  phone: "+91 9876543210",
  location: "Hyderabad, India",
  rollNumber: "22CSE042",
  linkedin: "https://linkedin.com/in/alex-johnson-dev",
  github: "https://github.com/alexjohnson-tech",
  portfolio: "https://alexjohnson.dev",
  summary:
    "Pre-final year B.Tech Computer Science student at BVRIT Narsapur with strong foundations in Data Structures & Algorithms, Full Stack Web Development, and distributed backend systems. Proven experience building full-stack applications in React, Next.js, and Node.js with active problem-solving experience.",

  education: [
    {
      id: "edu-1",
      institution: "B.V. Raju Institute of Technology (BVRIT), Narsapur",
      degree: "Bachelor of Technology (B.Tech)",
      department: "Computer Science and Engineering (CSE)",
      graduationYear: "Expected May 2026",
      cgpa: "8.45 / 10.00",
      location: "Medak, Telangana",
    },
    {
      id: "edu-2",
      institution: "Sri Chaitanya Junior College",
      degree: "Intermediate (TSBIE - MPC)",
      department: "Maths, Physics, Chemistry",
      graduationYear: "2022",
      cgpa: "96.4%",
      location: "Hyderabad, Telangana",
    },
  ],

  skills: {
    languages: "Python, C++, Java, JavaScript, TypeScript, SQL",
    webCloud: "React.js, Next.js, Node.js, Express, Tailwind CSS, REST APIs",
    databases: "PostgreSQL, MongoDB, Redis, MySQL",
    toolsFundamentals: "Git, GitHub, Docker, Linux, Postman, DSA, OOP, DBMS, OS, Networks",
  },

  projects: [
    {
      id: "proj-1",
      title: "CampusHub — Intelligent Campus Placement & Academic Portal",
      techStack: "Next.js 16, TypeScript, Tailwind CSS, PostgreSQL, Supabase",
      liveUrl: "https://campushub.edu",
      githubUrl: "https://github.com/alexjohnson-tech/campushub",
      bullets: [
        "Architected an autonomous university management portal serving 3,500+ students and faculty across 11 departments.",
        "Engineered an ATS-ready application profile engine reducing repetitive internship application time by over 75%.",
        "Implemented deterministic skill-gap matching algorithms comparing candidate skill profiles with live employer postings.",
      ],
    },
    {
      id: "proj-2",
      title: "Distributed Task Scheduler & Real-Time Notification Pipeline",
      techStack: "Node.js, Redis Pub/Sub, WebSockets, PostgreSQL, Docker",
      liveUrl: "",
      githubUrl: "https://github.com/alexjohnson-tech/task-pipeline",
      bullets: [
        "Constructed a high-throughput job queue handling 10,000+ asynchronous events per second with sub-50ms latency.",
        "Integrated Redis caching and BullMQ workers to prevent database contention during concurrent campus exam deadlines.",
        "Containerized the multi-service architecture using Docker Compose for 100% reproducible staging and production deployments.",
      ],
    },
  ],

  experience: [
    {
      id: "exp-1",
      role: "Software Engineering Intern",
      company: "Cognitive Labs / EdTech Solutions",
      location: "Hyderabad, India (Hybrid)",
      duration: "May 2025 – July 2025",
      bullets: [
        "Developed responsive dashboard widgets in React.js and TypeScript, decreasing initial bundle load time by 32%.",
        "Authored RESTful microservices in Node.js to streamline batch student assessment exports for outcome-based accreditation.",
        "Collaborated in weekly Agile sprints, participated in code reviews, and increased test coverage by 40% with Jest.",
      ],
    },
  ],

  certifications: [
    "Smart India Hackathon (SIH) — College Finalist & Team Lead (2024)",
    "Meta Front-End Developer Professional Certificate (Coursera)",
    "LeetCode: 250+ Problems Solved (Top 15% contest rating in DSA)",
    "BVRIT Promethean Technical Symposium — 1st Place in Code-A-Thon",
  ],
};

type TemplateType = "classic" | "modern" | "compact";

export default function ResumeBuilderPage() {
  const [data, setData] = React.useState<ResumeData>(DEFAULT_RESUME);
  const [template, setTemplate] = React.useState<TemplateType>("modern");
  const [copiedText, setCopiedText] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [activeEditorSection, setActiveEditorSection] = React.useState<
    "header" | "summary" | "education" | "skills" | "projects" | "experience" | "certifications"
  >("header");

  // Load profile from CampusHub profile actions
  const handleAutoFill = async () => {
    try {
      setLoadingProfile(true);
      const [appProfile, skillsList] = await Promise.all([
        getApplicationProfile(),
        getStudentSkills(),
      ]);

      if (appProfile) {
        // Group skills by category
        const langList: string[] = [];
        const webList: string[] = [];
        const dbList: string[] = [];
        const toolList: string[] = [];

        skillsList.forEach((s) => {
          if (s.skill_category === "Programming Language") langList.push(s.skill_name);
          else if (s.skill_category === "Frontend" || s.skill_category === "Backend" || s.skill_category === "Cloud") webList.push(s.skill_name);
          else if (s.skill_category === "Database") dbList.push(s.skill_name);
          else toolList.push(s.skill_name);
        });

        setData((prev) => ({
          ...prev,
          fullName: appProfile.full_name || prev.fullName,
          rollNumber: appProfile.college_roll_number || prev.rollNumber,
          email: appProfile.personal_email || appProfile.college_email || prev.email,
          phone: appProfile.phone || prev.phone,
          linkedin: appProfile.linkedin_url || prev.linkedin,
          github: appProfile.github_url || prev.github,
          portfolio: appProfile.portfolio_url || prev.portfolio,
          education: [
            {
              id: "edu-1",
              institution: appProfile.college_name || "B.V. Raju Institute of Technology (BVRIT), Narsapur",
              degree: `${appProfile.degree || "B.Tech"} in ${appProfile.department || "Computer Science and Engineering"}`,
              department: appProfile.department || "Computer Science and Engineering",
              graduationYear: `Class of ${appProfile.graduation_year || 2026}`,
              cgpa: appProfile.cgpa ? `${appProfile.cgpa.toFixed(2)} / 10.00` : "8.45 / 10.00",
              location: "Narsapur, Medak, Telangana",
            },
            ...(prev.education.slice(1)),
          ],
          skills: {
            languages: langList.length > 0 ? langList.join(", ") : prev.skills.languages,
            webCloud: webList.length > 0 ? webList.join(", ") : prev.skills.webCloud,
            databases: dbList.length > 0 ? dbList.join(", ") : prev.skills.databases,
            toolsFundamentals: toolList.length > 0 ? toolList.join(", ") : prev.skills.toolsFundamentals,
          },
        }));
      }
    } catch (err) {
      console.error("Failed to auto-fill resume from profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Calculate ATS Score & Readiness
  const calculateAtsScore = (): { score: number; checklist: { label: string; passed: boolean; tip: string }[] } => {
    const checklist = [
      {
        label: "Contact Header Complete",
        passed: Boolean(data.fullName && data.email && data.phone && (data.linkedin || data.github)),
        tip: "Include Email, Phone, and LinkedIn URL for automated recruiter reachouts.",
      },
      {
        label: "Professional Summary Included",
        passed: Boolean(data.summary && data.summary.length >= 80),
        tip: "A 2-3 line summary packed with role keywords increases parser ranking.",
      },
      {
        label: "BVRIT Degree & Valid CGPA",
        passed: Boolean(data.education.length > 0 && data.education[0].cgpa),
        tip: "Clear degree and CGPA (e.g. 8.45 / 10.00) prevents education parsing failures.",
      },
      {
        label: "Standard Categorized Skills",
        passed: Boolean(data.skills.languages && data.skills.webCloud && data.skills.databases),
        tip: "Categorized skills help ATS engines match specific recruiter search filters.",
      },
      {
        label: "Strong Action Verbs in Projects",
        passed: data.projects.some((p) =>
          p.bullets.some((b) => /^(engineered|developed|architected|implemented|built|designed|constructed)/i.test(b.trim()))
        ),
        tip: "Begin project bullets with past-tense action verbs like Engineered, Developed, or Architected.",
      },
      {
        label: "Quantifiable Metrics & Impact",
        passed: data.projects.some((p) =>
          p.bullets.some((b) => /%|\d+x|\d+ms|\d+\+|\d+k/i.test(b))
        ),
        tip: "Include measurable metrics (e.g., 'reduced latency by 32%', 'served 3,500+ users').",
      },
      {
        label: "Single-Column ATS Layout",
        passed: true,
        tip: "Single-column format ensures 100% compliance across Workday, Taleo, and Greenhouse.",
      },
    ];

    const passedCount = checklist.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checklist.length) * 100);
    return { score, checklist };
  };

  const { score: atsScore, checklist: atsChecklist } = calculateAtsScore();

  // Print / Save to PDF
  const handlePrint = () => {
    window.print();
  };

  // Plain Text Copy for Job Applications
  const handleCopyPlainText = async () => {
    let txt = `${data.fullName.toUpperCase()}\n`;
    txt += `${data.title}\n`;
    txt += `${data.email} | ${data.phone} | ${data.location}\n`;
    if (data.linkedin) txt += `LinkedIn: ${data.linkedin} | `;
    if (data.github) txt += `GitHub: ${data.github}\n\n`;

    txt += `PROFESSIONAL SUMMARY\n${data.summary}\n\n`;

    txt += `EDUCATION\n`;
    data.education.forEach((edu) => {
      txt += `${edu.institution} — ${edu.degree}\n`;
      txt += `${edu.department} | CGPA: ${edu.cgpa} | ${edu.graduationYear}\n\n`;
    });

    txt += `TECHNICAL SKILLS\n`;
    txt += `• Programming Languages: ${data.skills.languages}\n`;
    txt += `• Web & Cloud: ${data.skills.webCloud}\n`;
    txt += `• Databases: ${data.skills.databases}\n`;
    txt += `• Developer Tools: ${data.skills.toolsFundamentals}\n\n`;

    txt += `PROJECTS\n`;
    data.projects.forEach((p) => {
      txt += `${p.title} (${p.techStack})\n`;
      p.bullets.forEach((b) => (txt += `• ${b}\n`));
      txt += `\n`;
    });

    if (data.experience.length > 0) {
      txt += `EXPERIENCE\n`;
      data.experience.forEach((e) => {
        txt += `${e.role} — ${e.company} (${e.duration})\n`;
        e.bullets.forEach((b) => (txt += `• ${b}\n`));
        txt += `\n`;
      });
    }

    if (data.certifications.length > 0) {
      txt += `ACHIEVEMENTS & CERTIFICATIONS\n`;
      data.certifications.forEach((c) => (txt += `• ${c}\n`));
    }

    try {
      await navigator.clipboard.writeText(txt);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <DashboardShell role="student">
      {/* Hide surrounding UI during Print */}
      <div className="print:hidden space-y-6">
        {/* EXECUTIVE RESUME BUILDER HEADER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  ATS Resume Studio
                </span>
                <span className="text-xs text-slate-500 font-semibold">100% Parser Compliant</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                ATS-Friendly Resume Maker
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Build clean, single-column resumes strictly structured to pass Applicant Tracking Systems (ATS) used by top tech companies and campus recruiters.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFill}
                disabled={loadingProfile}
                leftIcon={<RefreshCw className={`h-4 w-4 ${loadingProfile ? "animate-spin" : ""}`} />}
                className="font-semibold text-xs border-slate-300 dark:border-slate-700"
              >
                Auto-fill from Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPlainText}
                leftIcon={copiedText ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                className="font-semibold text-xs border-slate-300 dark:border-slate-700"
              >
                {copiedText ? "Copied!" : "Copy Plain Text"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="h-4 w-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs"
              >
                Print / PDF
              </Button>
            </div>
          </div>
        </div>

        {/* ATS Readiness Gauge */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-indigo-500/40 flex flex-col items-center justify-center shrink-0 shadow-lg">
                <span className="text-xl font-black text-amber-400">{atsScore}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">ATS MATCH</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {atsScore >= 90 ? "🚀 Exceptional ATS Rank (Top 5%)" : atsScore >= 75 ? "⚡ Strong ATS Compatibility" : "⚠️ Needs ATS Optimization"}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Workday &amp; Taleo Validated
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1">
                  Automated keyword alignment for Amazon, Microsoft, and Cognizant candidate tracking parsers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Template:</span>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 p-1">
                {(["classic", "modern", "compact"] as TemplateType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                      template === t
                        ? "bg-blue-600 text-white shadow-md font-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-indigo-900/60">
            {atsChecklist.slice(0, 4).map((item) => (
              <div
                key={item.label}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  item.passed
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                }`}
              >
                {item.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                )}
                <span className="truncate font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Interface: Left = Form Editor, Right = Live ATS Resume Paper */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================ */}
        {/* LEFT COLUMN: SECTIONED EDITORS (Hidden in Print) */}
        {/* ================================================================ */}
        <div className="lg:col-span-5 print:hidden space-y-4">
          <Card className="shadow-xs border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Resume Sections</span>
                <span className="text-xs text-slate-400 font-normal">Click to expand</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {/* 1. Header & Contact */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveEditorSection(activeEditorSection === "header" ? ("" as any) : "header")
                  }
                  className="w-full p-3.5 text-left text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 min-h-[44px]"
                >
                  <span>1. Contact &amp; Personal Info</span>
                  {activeEditorSection === "header" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {activeEditorSection === "header" && (
                  <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                    <Input
                      label="Full Name"
                      value={data.fullName}
                      onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    />
                    <Input
                      label="Target Role / Headline"
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                      />
                      <Input
                        label="Phone"
                        value={data.phone}
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Location"
                        value={data.location}
                        onChange={(e) => setData({ ...data, location: e.target.value })}
                      />
                      <Input
                        label="College Roll No"
                        value={data.rollNumber}
                        onChange={(e) => setData({ ...data, rollNumber: e.target.value })}
                      />
                    </div>
                    <Input
                      label="LinkedIn URL"
                      value={data.linkedin}
                      onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                    />
                    <Input
                      label="GitHub URL"
                      value={data.github}
                      onChange={(e) => setData({ ...data, github: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* 2. Professional Summary */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveEditorSection(activeEditorSection === "summary" ? ("" as any) : "summary")
                  }
                  className="w-full p-3.5 text-left text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 min-h-[44px]"
                >
                  <span>2. Professional Summary</span>
                  {activeEditorSection === "summary" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {activeEditorSection === "summary" && (
                  <div className="p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Summary Paragraph (2–3 sentences)
                    </label>
                    <textarea
                      rows={4}
                      value={data.summary}
                      onChange={(e) => setData({ ...data, summary: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* 3. Education */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveEditorSection(activeEditorSection === "education" ? ("" as any) : "education")
                  }
                  className="w-full p-3.5 text-left text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 min-h-[44px]"
                >
                  <span>3. Education &amp; CGPA</span>
                  {activeEditorSection === "education" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {activeEditorSection === "education" && (
                  <div className="p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                    {data.education.map((edu, idx) => (
                      <div key={edu.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
                        <Input
                          label="Institution / College"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[idx].institution = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Degree & Branch"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...data.education];
                              updated[idx].degree = e.target.value;
                              setData({ ...data, education: updated });
                            }}
                          />
                          <Input
                            label="Cumulative CGPA / %"
                            value={edu.cgpa}
                            onChange={(e) => {
                              const updated = [...data.education];
                              updated[idx].cgpa = e.target.value;
                              setData({ ...data, education: updated });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Skills */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveEditorSection(activeEditorSection === "skills" ? ("" as any) : "skills")
                  }
                  className="w-full p-3.5 text-left text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 min-h-[44px]"
                >
                  <span>4. Categorized Technical Skills</span>
                  {activeEditorSection === "skills" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {activeEditorSection === "skills" && (
                  <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                    <Input
                      label="Programming Languages"
                      value={data.skills.languages}
                      onChange={(e) => setData({ ...data, skills: { ...data.skills, languages: e.target.value } })}
                    />
                    <Input
                      label="Web &amp; Cloud Frameworks"
                      value={data.skills.webCloud}
                      onChange={(e) => setData({ ...data, skills: { ...data.skills, webCloud: e.target.value } })}
                    />
                    <Input
                      label="Databases &amp; Caching"
                      value={data.skills.databases}
                      onChange={(e) => setData({ ...data, skills: { ...data.skills, databases: e.target.value } })}
                    />
                    <Input
                      label="Developer Tools &amp; Core CS"
                      value={data.skills.toolsFundamentals}
                      onChange={(e) => setData({ ...data, skills: { ...data.skills, toolsFundamentals: e.target.value } })}
                    />
                  </div>
                )}
              </div>

              {/* 5. Projects */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveEditorSection(activeEditorSection === "projects" ? ("" as any) : "projects")
                  }
                  className="w-full p-3.5 text-left text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 min-h-[44px]"
                >
                  <span>5. Key Projects ({data.projects.length})</span>
                  {activeEditorSection === "projects" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {activeEditorSection === "projects" && (
                  <div className="p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                    {data.projects.map((proj, pIdx) => (
                      <div key={proj.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
                        <Input
                          label="Project Title"
                          value={proj.title}
                          onChange={(e) => {
                            const copy = [...data.projects];
                            copy[pIdx].title = e.target.value;
                            setData({ ...data, projects: copy });
                          }}
                        />
                        <Input
                          label="Tech Stack"
                          value={proj.techStack}
                          onChange={(e) => {
                            const copy = [...data.projects];
                            copy[pIdx].techStack = e.target.value;
                            setData({ ...data, projects: copy });
                          }}
                        />
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500">Bullets (Action Verb + Result)</label>
                          {proj.bullets.map((b, bIdx) => (
                            <input
                              key={bIdx}
                              type="text"
                              value={b}
                              onChange={(e) => {
                                const copy = [...data.projects];
                                copy[pIdx].bullets[bIdx] = e.target.value;
                                setData({ ...data, projects: copy });
                              }}
                              className="w-full p-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-1"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================================================================ */}
        {/* RIGHT COLUMN: HIGH-CONTRAST ATS RESUME PREVIEW */}
        {/* ================================================================ */}
        <div className="lg:col-span-7">
          <div
            id="resume-paper"
            className="w-full max-w-[800px] mx-auto bg-white text-black p-8 sm:p-10 shadow-lg border border-slate-300 dark:border-slate-700 rounded-sm font-sans selection:bg-slate-200"
            style={{ minHeight: "1050px" }}
          >
            {/* ATS HEADER */}
            <div className="text-center pb-4 border-b border-black">
              <h1 className="text-2xl font-black tracking-tight uppercase text-black">
                {data.fullName}
              </h1>
              <div className="text-xs font-semibold text-gray-800 mt-1">
                {data.title}
              </div>
              <div className="text-[11px] text-gray-700 mt-1.5 flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 font-mono">
                <span>{data.email}</span>
                <span>•</span>
                <span>{data.phone}</span>
                <span>•</span>
                <span>{data.location}</span>
                {data.rollNumber && (
                  <>
                    <span>•</span>
                    <span>Roll: {data.rollNumber}</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-gray-600 mt-1 flex items-center justify-center flex-wrap gap-x-3">
                {data.linkedin && <span>{data.linkedin.replace(/^https?:\/\//, "")}</span>}
                {data.github && <span>{data.github.replace(/^https?:\/\//, "")}</span>}
                {data.portfolio && <span>{data.portfolio.replace(/^https?:\/\//, "")}</span>}
              </div>
            </div>

            {/* ATS SUMMARY */}
            {data.summary && (
              <div className="pt-3 pb-2 border-b border-gray-300">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1">
                  Professional Summary
                </h2>
                <p className="text-[11px] text-gray-800 leading-relaxed text-justify">
                  {data.summary}
                </p>
              </div>
            )}

            {/* ATS TECHNICAL SKILLS */}
            <div className="pt-3 pb-2 border-b border-gray-300">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1">
                Technical Skills
              </h2>
              <div className="text-[11px] text-gray-800 space-y-1">
                <div>
                  <span className="font-bold">Programming Languages:</span> {data.skills.languages}
                </div>
                <div>
                  <span className="font-bold">Web &amp; Cloud Frameworks:</span> {data.skills.webCloud}
                </div>
                <div>
                  <span className="font-bold">Databases &amp; Systems:</span> {data.skills.databases}
                </div>
                <div>
                  <span className="font-bold">Developer Tools &amp; Concepts:</span> {data.skills.toolsFundamentals}
                </div>
              </div>
            </div>

            {/* ATS EDUCATION */}
            <div className="pt-3 pb-2 border-b border-gray-300">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start text-[11px]">
                    <div>
                      <div className="font-bold text-black">{edu.institution}</div>
                      <div className="text-gray-800">
                        {edu.degree} — {edu.department}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-black">{edu.cgpa}</div>
                      <div className="text-gray-600 text-[10px]">{edu.graduationYear}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS PROJECTS */}
            <div className="pt-3 pb-2 border-b border-gray-300">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                Key Technical Projects
              </h2>
              <div className="space-y-3">
                {data.projects.map((p) => (
                  <div key={p.id} className="text-[11px]">
                    <div className="flex justify-between items-baseline font-bold text-black">
                      <span>{p.title}</span>
                      <span className="text-[10px] text-gray-600 font-normal italic">
                        {p.techStack}
                      </span>
                    </div>
                    <ul className="list-disc list-outside pl-4 mt-1 space-y-0.5 text-gray-800">
                      {p.bullets.map((b, i) => (
                        <li key={i} className="text-justify leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS EXPERIENCE */}
            {data.experience.length > 0 && (
              <div className="pt-3 pb-2 border-b border-gray-300">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Work Experience
                </h2>
                <div className="space-y-3">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="text-[11px]">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-black">
                          {exp.role} — <span className="font-semibold">{exp.company}</span>
                        </span>
                        <span className="text-[10px] text-gray-600 font-mono">{exp.duration}</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 mt-1 space-y-0.5 text-gray-800">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="text-justify leading-snug">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATS CERTIFICATIONS & ACHIEVEMENTS */}
            {data.certifications.length > 0 && (
              <div className="pt-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                  Achievements &amp; Honors
                </h2>
                <ul className="list-disc list-outside pl-4 space-y-0.5 text-[11px] text-gray-800">
                  {data.certifications.map((c, i) => (
                    <li key={i} className="leading-snug">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strict Print Media Styling for 100% ATS PDF Output */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header,
          nav,
          aside,
          button,
          .print\\:hidden {
            display: none !important;
          }
          #resume-paper {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 0.3in 0.4in !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </DashboardShell>
  );
}
