"use server";

import { getCurrentSessionUser } from "@/lib/auth/actions";
import { getOpportunityById, trackApplication } from "@/lib/opportunities/actions";
import { updateStudentMatchingProfile } from "@/lib/matching/actions";
import { createClient } from "@/lib/supabase/server";
import {
  StudentApplicationProfile,
  ApplicationPreparationData,
} from "./types";
import {
  calculateProfileCompleteness,
  generateOpportunityChecklist,
  generateQuickCopyPalette,
  generateAIAlignmentBrief,
} from "./utils";

// In-memory fallback store for development/offline environments
const inMemoryProfiles: Record<string, StudentApplicationProfile> = {
  "demo-student-id": {
    student_id: "demo-student-id",
    full_name: "Alex Johnson",
    college_roll_number: "22CSE042",
    personal_email: "alex.johnson.dev@gmail.com",
    college_email: "alex.j@college.edu",
    phone: "+91 9876543210",
    college_name: "B.V. Raju Institute of Technology (BVRIT), Narsapur",
    degree: "B.Tech",
    department: "Computer Science and Engineering",
    current_year: 3,
    graduation_year: 2026,
    cgpa: 8.42,
    programming_languages: ["Python", "TypeScript", "JavaScript", "Java", "C++"],
    technical_skills: [
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Tailwind CSS",
      "Docker",
      "Git",
      "Data Structures",
      "Algorithms",
      "Problem Solving",
      "AWS",
      "SQL",
    ],
    preferred_roles: ["Software Engineer Intern", "Full Stack Developer", "Frontend Engineer"],
    linkedin_url: "https://linkedin.com/in/alex-johnson-dev",
    github_url: "https://github.com/alexjohnson-tech",
    portfolio_url: "https://alexjohnson.dev",
    resume_url: "https://campushub.edu/resumes/demo-alex-johnson-resume.pdf",
    resume_file_name: "Alex_Johnson_Resume_2026.pdf",
    resume_file_size: 1482000,
    resume_updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Retrieve the current authenticated student's reusable application profile
 */
export async function getApplicationProfile(): Promise<StudentApplicationProfile> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from("student_application_profiles")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();

      if (data && !error) {
        return data as StudentApplicationProfile;
      }
    }
  } catch (err) {
    console.error("Database query failed, falling back to in-memory store:", err);
  }

  // Fallback / in-memory handling
  if (!inMemoryProfiles[studentId]) {
    inMemoryProfiles[studentId] = {
      student_id: studentId,
      full_name: sessionUser?.fullName || "Alex Johnson",
      college_roll_number: "22CSE042",
      personal_email: "alex.johnson.dev@gmail.com",
      college_email: sessionUser?.email || "alex.j@college.edu",
      phone: sessionUser?.profile?.phone || "+91 9876543210",
      college_name: "B.V. Raju Institute of Technology (BVRIT), Narsapur",
      degree: "B.Tech",
      department: sessionUser?.profile?.department_id ? `${sessionUser.profile.department_id} Engineering` : "Computer Science and Engineering",
      current_year: sessionUser?.profile?.year || 3,
      graduation_year: 2026,
      cgpa: sessionUser?.profile?.current_cgpa ?? 8.45,
      programming_languages: ["Python", "TypeScript", "JavaScript", "Java"],
      technical_skills: ["React", "Next.js", "PostgreSQL", "Git"],
      preferred_roles: ["Software Engineer Intern"],
      linkedin_url: "https://linkedin.com/in/alex-johnson-dev",
      github_url: "https://github.com/alexjohnson-tech",
      portfolio_url: "https://alexjohnson.dev",
      resume_url: "https://campushub.edu/resumes/demo-alex-johnson-resume.pdf",
      resume_file_name: "Alex_Johnson_Resume_2026.pdf",
      resume_file_size: 1482000,
      resume_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return inMemoryProfiles[studentId];
}

/**
 * Update the student application profile
 */
export async function updateApplicationProfile(
  data: Partial<StudentApplicationProfile>
): Promise<{ success: boolean; profile?: StudentApplicationProfile; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  // Field validation
  if (data.personal_email && !isValidEmail(data.personal_email)) {
    return { success: false, error: "Please enter a valid personal email address." };
  }
  if (data.college_email && !isValidEmail(data.college_email)) {
    return { success: false, error: "Please enter a valid college email address." };
  }
  if (data.cgpa !== undefined && data.cgpa !== null) {
    if (isNaN(data.cgpa) || data.cgpa < 0 || data.cgpa > 10) {
      return { success: false, error: "CGPA must be a valid number between 0.00 and 10.00." };
    }
  }
  if (data.current_year !== undefined && (data.current_year < 1 || data.current_year > 5)) {
    return { success: false, error: "Current year must be between 1 and 5." };
  }

  const current = await getApplicationProfile();
  const updated: StudentApplicationProfile = {
    ...current,
    ...data,
    student_id: studentId,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      const { error } = await (supabase as any)
        .from("student_application_profiles")
        .upsert({
          student_id: studentId,
          full_name: updated.full_name,
          college_roll_number: updated.college_roll_number,
          personal_email: updated.personal_email,
          college_email: updated.college_email,
          phone: updated.phone,
          college_name: updated.college_name,
          degree: updated.degree,
          department: updated.department,
          current_year: updated.current_year,
          graduation_year: updated.graduation_year,
          cgpa: updated.cgpa,
          programming_languages: updated.programming_languages,
          technical_skills: updated.technical_skills,
          preferred_roles: updated.preferred_roles,
          linkedin_url: updated.linkedin_url,
          github_url: updated.github_url,
          portfolio_url: updated.portfolio_url,
          resume_url: updated.resume_url,
          resume_file_name: updated.resume_file_name,
          resume_file_size: updated.resume_file_size,
          resume_updated_at: updated.resume_updated_at,
          updated_at: updated.updated_at,
        }, { onConflict: "student_id" });

      if (error) {
        console.error("Supabase upsert error on application profile:", error);
      }
    }
  } catch (err) {
    console.error("Live DB update error:", err);
  }

  // Update in-memory
  inMemoryProfiles[studentId] = updated;

  // Also sync matching profile skills & cgpa seamlessly
  try {
    const allSkills = Array.from(
      new Set([...(updated.programming_languages || []), ...(updated.technical_skills || [])])
    );
    await updateStudentMatchingProfile({
      skills: allSkills,
      cgpa: updated.cgpa,
      preferredRoles: updated.preferred_roles,
      department: updated.department,
      year: updated.current_year,
    });
  } catch (err) {
    console.error("Sync to matching preferences failed:", err);
  }

  return { success: true, profile: updated };
}

/**
 * Validates and stores an uploaded resume document
 * Supported: .pdf, .doc, .docx (Max 5MB)
 */
export async function uploadResume(
  formData: FormData
): Promise<{ success: boolean; resumeUrl?: string; fileName?: string; fileSize?: number; error?: string }> {
  const file = formData.get("resume") as File | null;
  if (!file) {
    return { success: false, error: "No file was provided for upload." };
  }

  // 1. Validate File Size (5MB limit)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 5MB maximum limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  // 2. Validate File Extension / Format
  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));

  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const hasValidMime = file.type ? allowedMimes.includes(file.type) : true;

  if (!hasValidExt || !hasValidMime) {
    return {
      success: false,
      error: "Invalid document format. Only PDF, DOC, and DOCX files are permitted.",
    };
  }

  // 3. Create simulated secure document storage URL
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const docUrl = `/uploads/resumes/${Date.now()}_${sanitizedName}`;

  // 4. Update profile with new resume metadata
  await updateApplicationProfile({
    resume_url: docUrl,
    resume_file_name: file.name,
    resume_file_size: file.size,
    resume_updated_at: new Date().toISOString(),
  });

  return {
    success: true,
    resumeUrl: docUrl,
    fileName: file.name,
    fileSize: file.size,
  };
}

/**
 * Remove student's uploaded resume
 */
export async function deleteResume(): Promise<{ success: boolean; error?: string }> {
  await updateApplicationProfile({
    resume_url: null,
    resume_file_name: null,
    resume_file_size: null,
    resume_updated_at: null,
  });

  return { success: true };
}

/**
 * Compiles comprehensive preparation data for an opportunity
 */
export async function prepareApplicationData(
  opportunityId: string
): Promise<ApplicationPreparationData | null> {
  const opportunity = await getOpportunityById(opportunityId);
  if (!opportunity) {
    return null;
  }

  const profile = await getApplicationProfile();
  const profileCompleteness = calculateProfileCompleteness(profile);
  const checklist = generateOpportunityChecklist(profile, opportunity);
  const quickCopyItems = generateQuickCopyPalette(profile);
  const aiBrief = generateAIAlignmentBrief(profile, opportunity);

  return {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    company: opportunity.company,
    applicationUrl: opportunity.application_url,
    deadline: opportunity.deadline,
    profileCompleteness,
    checklist,
    quickCopyItems,
    hasResume: Boolean(profile.resume_url),
    resumeFileName: profile.resume_file_name,
    resumeUrl: profile.resume_url,
    aiBrief,
  };
}

/**
 * Explicitly records application tracking in CampusHub when confirmed by student
 */
export async function confirmAndTrackApplication(
  opportunityId: string
): Promise<{ success: boolean; message: string }> {
  return await trackApplication(opportunityId);
}
