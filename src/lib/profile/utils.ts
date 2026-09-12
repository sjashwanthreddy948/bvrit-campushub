import {
  StudentApplicationProfile,
  ProfileCompleteness,
  ChecklistItem,
  QuickCopyItem,
  AIAlignmentBrief,
} from "./types";

interface FieldDefinition {
  key: keyof StudentApplicationProfile;
  label: string;
  section: "personal" | "academic" | "career" | "resume";
  importance: "critical" | "recommended";
  check: (p: Partial<StudentApplicationProfile>) => boolean;
}

const PROFILE_FIELDS: FieldDefinition[] = [
  // Personal
  {
    key: "full_name",
    label: "Full Name",
    section: "personal",
    importance: "critical",
    check: (p) => Boolean(p.full_name && p.full_name.trim().length > 0),
  },
  {
    key: "college_roll_number",
    label: "College Roll Number",
    section: "personal",
    importance: "critical",
    check: (p) => Boolean(p.college_roll_number && p.college_roll_number.trim().length > 0),
  },
  {
    key: "personal_email",
    label: "Personal Email",
    section: "personal",
    importance: "critical",
    check: (p) => Boolean(p.personal_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.personal_email.trim())),
  },
  {
    key: "college_email",
    label: "College Email",
    section: "personal",
    importance: "critical",
    check: (p) => Boolean(p.college_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.college_email.trim())),
  },
  {
    key: "phone",
    label: "Phone Number",
    section: "personal",
    importance: "critical",
    check: (p) => Boolean(p.phone && p.phone.trim().length >= 8),
  },

  // Academic
  {
    key: "college_name",
    label: "College Name",
    section: "academic",
    importance: "critical",
    check: (p) => Boolean(p.college_name && p.college_name.trim().length > 0),
  },
  {
    key: "degree",
    label: "Degree",
    section: "academic",
    importance: "critical",
    check: (p) => Boolean(p.degree && p.degree.trim().length > 0),
  },
  {
    key: "department",
    label: "Department / Branch",
    section: "academic",
    importance: "critical",
    check: (p) => Boolean(p.department && p.department.trim().length > 0),
  },
  {
    key: "current_year",
    label: "Current Year",
    section: "academic",
    importance: "critical",
    check: (p) => typeof p.current_year === "number" && p.current_year >= 1 && p.current_year <= 5,
  },
  {
    key: "graduation_year",
    label: "Graduation Year",
    section: "academic",
    importance: "recommended",
    check: (p) => typeof p.graduation_year === "number" && p.graduation_year > 2000,
  },
  {
    key: "cgpa",
    label: "Current CGPA",
    section: "academic",
    importance: "recommended",
    check: (p) => typeof p.cgpa === "number" && p.cgpa >= 0 && p.cgpa <= 10,
  },

  // Career
  {
    key: "programming_languages",
    label: "Programming Languages",
    section: "career",
    importance: "recommended",
    check: (p) => Array.isArray(p.programming_languages) && p.programming_languages.length > 0,
  },
  {
    key: "technical_skills",
    label: "Technical Skills",
    section: "career",
    importance: "recommended",
    check: (p) => Array.isArray(p.technical_skills) && p.technical_skills.length > 0,
  },
  {
    key: "preferred_roles",
    label: "Preferred Roles",
    section: "career",
    importance: "recommended",
    check: (p) => Array.isArray(p.preferred_roles) && p.preferred_roles.length > 0,
  },
  {
    key: "linkedin_url",
    label: "LinkedIn Profile URL",
    section: "career",
    importance: "recommended",
    check: (p) => Boolean(p.linkedin_url && p.linkedin_url.trim().length > 0),
  },
  {
    key: "github_url",
    label: "GitHub Profile URL",
    section: "career",
    importance: "recommended",
    check: (p) => Boolean(p.github_url && p.github_url.trim().length > 0),
  },
  {
    key: "portfolio_url",
    label: "Portfolio / Website URL",
    section: "career",
    importance: "recommended",
    check: (p) => Boolean(p.portfolio_url && p.portfolio_url.trim().length > 0),
  },

  // Documents
  {
    key: "resume_url",
    label: "Uploaded Resume (PDF/DOCX)",
    section: "resume",
    importance: "critical",
    check: (p) => Boolean(p.resume_url && p.resume_url.trim().length > 0),
  },
];

/**
 * Calculates profile completeness score and lists missing items
 */
export function calculateProfileCompleteness(
  profile: Partial<StudentApplicationProfile> | null | undefined
): ProfileCompleteness {
  if (!profile) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: PROFILE_FIELDS.length,
      missingFields: PROFILE_FIELDS.map((f) => ({
        key: f.key,
        label: f.label,
        section: f.section,
        importance: f.importance,
      })),
      isComplete: false,
    };
  }

  let completed = 0;
  const missing: ProfileCompleteness["missingFields"] = [];

  for (const field of PROFILE_FIELDS) {
    if (field.check(profile)) {
      completed++;
    } else {
      missing.push({
        key: field.key,
        label: field.label,
        section: field.section,
        importance: field.importance,
      });
    }
  }

  const percentage = Math.round((completed / PROFILE_FIELDS.length) * 100);
  const criticalMissing = missing.filter((m) => m.importance === "critical");

  return {
    percentage,
    completedCount: completed,
    totalCount: PROFILE_FIELDS.length,
    missingFields: missing,
    isComplete: criticalMissing.length === 0,
  };
}

/**
 * Generates the fast one-tap quick-copy items for application forms
 */
export function generateQuickCopyPalette(
  profile: Partial<StudentApplicationProfile> | null | undefined
): QuickCopyItem[] {
  if (!profile) return [];

  const items: QuickCopyItem[] = [];

  if (profile.personal_email?.trim()) {
    items.push({
      key: "personal_email",
      label: "Personal Email",
      value: profile.personal_email.trim(),
      type: "email",
    });
  }

  if (profile.college_email?.trim()) {
    items.push({
      key: "college_email",
      label: "College Email",
      value: profile.college_email.trim(),
      type: "email",
    });
  }

  if (profile.phone?.trim()) {
    items.push({
      key: "phone",
      label: "Phone Number",
      value: profile.phone.trim(),
      type: "phone",
    });
  }

  if (profile.college_roll_number?.trim()) {
    items.push({
      key: "college_roll_number",
      label: "Roll Number",
      value: profile.college_roll_number.trim(),
      type: "text",
    });
  }

  if (profile.college_name?.trim()) {
    items.push({
      key: "college_name",
      label: "College Name",
      value: profile.college_name.trim(),
      type: "text",
    });
  }

  if (profile.cgpa !== null && profile.cgpa !== undefined && !isNaN(profile.cgpa)) {
    items.push({
      key: "cgpa",
      label: "Current CGPA",
      value: profile.cgpa.toFixed(2),
      type: "text",
    });
  }

  if (profile.linkedin_url?.trim()) {
    items.push({
      key: "linkedin_url",
      label: "LinkedIn URL",
      value: profile.linkedin_url.trim(),
      type: "url",
    });
  }

  if (profile.github_url?.trim()) {
    items.push({
      key: "github_url",
      label: "GitHub URL",
      value: profile.github_url.trim(),
      type: "url",
    });
  }

  if (profile.portfolio_url?.trim()) {
    items.push({
      key: "portfolio_url",
      label: "Portfolio URL",
      value: profile.portfolio_url.trim(),
      type: "url",
    });
  }

  return items;
}

/**
 * Builds a deterministic checklist against the target opportunity requirements
 */
export function generateOpportunityChecklist(
  profile: Partial<StudentApplicationProfile> | null | undefined,
  opportunity: {
    eligibility?: string;
    skills?: string[];
    type?: string;
  }
): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];

  // 1. Resume check (Always critical for external job/internship applications)
  const hasResume = Boolean(profile?.resume_url && profile.resume_url.trim().length > 0);
  checklist.push({
    key: "resume",
    label: "Resume / CV Document",
    status: hasResume ? "ready" : "missing",
    message: hasResume
      ? `Ready: ${profile?.resume_file_name || "Resume document uploaded"}`
      : "Resume is missing. External application portals usually require a PDF/DOCX file.",
    isRequired: true,
    valuePreview: profile?.resume_file_name || undefined,
  });

  // 2. Personal Contact details
  const hasEmail = Boolean(profile?.personal_email || profile?.college_email);
  const hasPhone = Boolean(profile?.phone && profile.phone.trim().length >= 8);
  if (hasEmail && hasPhone) {
    checklist.push({
      key: "contact_info",
      label: "Contact Information",
      status: "ready",
      message: `Verified: ${profile?.personal_email || profile?.college_email} | ${profile?.phone}`,
      isRequired: true,
      valuePreview: profile?.personal_email || profile?.college_email,
    });
  } else {
    checklist.push({
      key: "contact_info",
      label: "Contact Information",
      status: "missing",
      message: "Please provide both an email address and phone number in your profile.",
      isRequired: true,
    });
  }

  // 3. Academic Details & Roll Number
  const hasAcademic = Boolean(profile?.college_name && profile?.college_roll_number);
  checklist.push({
    key: "academic_credentials",
    label: "Institutional Credentials",
    status: hasAcademic ? "ready" : "warning",
    message: hasAcademic
      ? `${profile?.college_name} (Roll: ${profile?.college_roll_number})`
      : "College name or roll number is not set in your application profile.",
    isRequired: true,
    valuePreview: profile?.college_roll_number,
  });

  // 4. CGPA Requirement Check (extract minimum CGPA if stated in eligibility)
  const eligibility = opportunity.eligibility || "";
  const cgpaMatch = eligibility.match(/(?:cgpa|gpa)\s*(?:>=|>|of|above|minimum)?\s*(\d(?:\.\d+)?)/i);
  if (cgpaMatch) {
    const requiredCgpa = parseFloat(cgpaMatch[1]);
    const studentCgpa = profile?.cgpa ?? null;
    if (studentCgpa === null || isNaN(studentCgpa)) {
      checklist.push({
        key: "cgpa_requirement",
        label: `Minimum CGPA (${requiredCgpa})`,
        status: "warning",
        message: `Opportunity specifies minimum CGPA ${requiredCgpa}, but your profile does not specify a CGPA.`,
        isRequired: false,
      });
    } else if (studentCgpa >= requiredCgpa) {
      checklist.push({
        key: "cgpa_requirement",
        label: `Minimum CGPA (${requiredCgpa})`,
        status: "ready",
        message: `Your CGPA (${studentCgpa.toFixed(2)}) meets the stated requirement of ${requiredCgpa}.`,
        isRequired: true,
        valuePreview: studentCgpa.toFixed(2),
      });
    } else {
      checklist.push({
        key: "cgpa_requirement",
        label: `Minimum CGPA (${requiredCgpa})`,
        status: "warning",
        message: `Your CGPA (${studentCgpa.toFixed(2)}) is below the stated cutoff of ${requiredCgpa}.`,
        isRequired: false,
        valuePreview: studentCgpa.toFixed(2),
      });
    }
  } else if (profile?.cgpa !== null && profile?.cgpa !== undefined) {
    // Stated CGPA is ready to copy
    checklist.push({
      key: "cgpa_available",
      label: "Academic Standing (CGPA)",
      status: "ready",
      message: `CGPA ${profile.cgpa.toFixed(2)} is ready for quick-copy.`,
      isRequired: false,
      valuePreview: profile.cgpa.toFixed(2),
    });
  }

  // 5. Professional / Online Links (GitHub/Portfolio)
  const isTechOpportunity =
    opportunity.type === "internship" ||
    opportunity.type === "job" ||
    opportunity.type === "hackathon";
  const hasOnlineProfiles = Boolean(profile?.github_url || profile?.portfolio_url || profile?.linkedin_url);

  if (isTechOpportunity) {
    checklist.push({
      key: "online_portfolio",
      label: "Project Links & Profiles",
      status: hasOnlineProfiles ? "ready" : "warning",
      message: hasOnlineProfiles
        ? "GitHub/LinkedIn/Portfolio links are ready to copy to the application form."
        : "Adding your GitHub, LinkedIn, or personal portfolio URL significantly improves application visibility.",
      isRequired: false,
      valuePreview: profile?.github_url || profile?.linkedin_url || profile?.portfolio_url || undefined,
    });
  }

  return checklist;
}

/**
 * Generates an AI Alignment Brief comparing student profile and opportunity details
 */
export function generateAIAlignmentBrief(
  profile: Partial<StudentApplicationProfile> | null | undefined,
  opportunity: {
    title: string;
    company: string;
    skills?: string[];
    eligibility?: string;
    deadline?: string;
  }
): AIAlignmentBrief {
  // Combine all student skills
  const studentSkills = new Set<string>();
  (profile?.programming_languages || []).forEach((s) => studentSkills.add(s.trim().toLowerCase()));
  (profile?.technical_skills || []).forEach((s) => studentSkills.add(s.trim().toLowerCase()));

  const oppSkills = opportunity.skills || [];
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of oppSkills) {
    const clean = skill.trim().toLowerCase();
    if (!clean) continue;

    let matched = false;
    for (const sSkill of studentSkills) {
      if (sSkill.includes(clean) || clean.includes(sSkill)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Deadline notice
  let deadlineNotice = "Not specified in the opportunity.";
  if (opportunity.deadline) {
    const d = new Date(opportunity.deadline);
    if (!isNaN(d.getTime())) {
      deadlineNotice = d.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  // Summary
  const relevantProfileSummary =
    `Candidate: ${profile?.full_name || "Student"} | Branch: ${profile?.department || "N/A"}, Year ${profile?.current_year || "N/A"}` +
    (profile?.cgpa ? ` (CGPA: ${profile.cgpa.toFixed(2)})` : "") +
    (profile?.resume_file_name ? ` | Resume: ${profile.resume_file_name}` : " | No resume uploaded");

  // Practical guidance notes
  const guidanceNotes: string[] = [
    "CampusHub helps you organize your materials. You will complete your actual submission directly on the official employer/host site.",
    "Use the Quick Copy Palette to paste your details accurately into external form fields.",
  ];

  if (missingSkills.length > 0) {
    guidanceNotes.push(
      `Consider highlighting transferable problem-solving or project experience related to ${missingSkills.slice(0, 3).join(", ")} in any custom text fields.`
    );
  }

  if (!profile?.resume_url) {
    guidanceNotes.push("Make sure to upload your resume before submitting on the employer site.");
  }

  return {
    relevantProfileSummary,
    matchingSkills,
    missingSkills,
    deadlineNotice,
    guidanceNotes,
  };
}
