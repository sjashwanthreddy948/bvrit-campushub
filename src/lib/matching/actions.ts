"use server";

import { getCurrentSessionUser } from "@/lib/auth/actions";
import { getOpportunityById } from "@/lib/opportunities/actions";
import {
  StudentMatchingProfile,
  OpportunityMatchingCriteria,
  MatchingResult,
} from "./types";
import { performAIOpportunityMatch } from "./engine";

// In-memory student preferences store (keyed by student ID)
let inMemoryStudentProfiles: Record<string, StudentMatchingProfile> = {
  "demo-student-id": {
    department: "CSE",
    year: 3,
    skills: [
      "Python",
      "Java",
      "C++",
      "JavaScript",
      "TypeScript",
      "Data Structures",
      "Algorithms",
      "Problem Solving",
      "SQL",
      "PostgreSQL",
      "React",
      "Next.js",
      "Node.js",
      "AWS",
      "Git",
      "Docker",
      "Full Stack",
    ],
    cgpa: 8.42,
    preferredRoles: ["Software Engineer", "Full Stack Developer", "Cloud Engineer"],
    preferredLocations: ["Bangalore", "Hyderabad", "Remote"],
    preferredWorkMode: "Hybrid",
  },
};

/**
 * Get current student's matching profile
 */
export async function getStudentMatchingProfile(): Promise<StudentMatchingProfile> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  if (!inMemoryStudentProfiles[studentId]) {
    inMemoryStudentProfiles[studentId] = {
      department: "CSE",
      year: 3,
      skills: [
        "Python",
        "Java",
        "C++",
        "JavaScript",
        "TypeScript",
        "Data Structures",
        "Algorithms",
        "Problem Solving",
        "SQL",
        "PostgreSQL",
        "React",
        "Next.js",
        "Node.js",
        "AWS",
        "Git",
        "Docker",
        "Full Stack",
      ],
      cgpa: 8.42,
      preferredRoles: ["Software Engineer", "Full Stack Developer", "Cloud Engineer"],
      preferredLocations: ["Bangalore", "Hyderabad"],
      preferredWorkMode: "Hybrid",
    };
  }

  return inMemoryStudentProfiles[studentId];
}

/**
 * Update current student's matching profile & preferences
 */
export async function updateStudentMatchingProfile(
  data: Partial<StudentMatchingProfile>
): Promise<{ success: boolean; profile: StudentMatchingProfile }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  const current = await getStudentMatchingProfile();
  const updated: StudentMatchingProfile = {
    ...current,
    ...data,
    // Department and Year are verified institutional fields but can be overridden in matching preferences if provided
    department: data.department || current.department,
    year: data.year ?? current.year,
  };

  inMemoryStudentProfiles[studentId] = updated;

  return { success: true, profile: updated };
}

/**
 * Calculate AI-assisted opportunity match for an opportunity
 * PRIVACY GUARANTEE: Never sends student name, email, phone, or ID to the matching engine.
 */
export async function calculateOpportunityMatch(
  opportunityId: string
): Promise<{ success: boolean; result?: MatchingResult; error?: string }> {
  try {
    const opp = await getOpportunityById(opportunityId);
    if (!opp) {
      return { success: false, error: "Opportunity not found." };
    }

    const studentProfile = await getStudentMatchingProfile();

    // Map opportunity criteria
    const criteria: OpportunityMatchingCriteria = {
      id: opp.id,
      title: opp.title,
      company: opp.company,
      type: opp.type,
      department: opp.department || null,
      year: opp.year ?? null,
      skills: Array.isArray(opp.skills) ? opp.skills : [],
      eligibility: opp.eligibility,
      location: opp.location,
      work_mode: opp.work_mode,
      eligible_departments: opp.eligible_departments || (opp.department ? [opp.department] : []),
      eligible_years: opp.eligible_years || (opp.year ? [opp.year] : []),
      min_cgpa: opp.min_cgpa ?? null,
      required_skills: opp.required_skills && opp.required_skills.length > 0 ? opp.required_skills : (opp.skills || []),
      preferred_skills: opp.preferred_skills || [],
    };

    // Execute matching with privacy preservation
    const result = await performAIOpportunityMatch(studentProfile, criteria);

    return { success: true, result };
  } catch (err: any) {
    console.error("Opportunity matching error:", err);
    return {
      success: false,
      error: "Unable to calculate match. Please try again later.",
    };
  }
}
