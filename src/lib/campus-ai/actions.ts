"use server";

import { getCurrentSessionUser } from "@/lib/auth/actions";
import { UserRole } from "@/types/database";
import { queryCampusAi, CampusAiAnswer } from "./engine";
import {
  BVRIT_INSTITUTION_PROFILE,
  BVRIT_QUICK_CATEGORIES,
  BVRIT_DEPARTMENTS,
  BVRIT_KEY_CONTACTS,
} from "./knowledge";

export interface AskCampusAiResponse extends CampusAiAnswer {
  success: boolean;
  error?: string;
}

/**
 * Server action to query the CampusHub AI regarding BVRIT Narsapur
 */
export async function askCampusAi(
  question: string,
  userRoleOverride?: UserRole
): Promise<AskCampusAiResponse> {
  try {
    const sessionUser = await getCurrentSessionUser();
    const effectiveRole: UserRole = userRoleOverride || sessionUser?.role || "student";

    const userContext = {
      department:
        typeof sessionUser?.profile?.department === "string"
          ? sessionUser.profile.department
          : (sessionUser?.profile?.department as any)?.code || (sessionUser?.profile?.department as any)?.name,
      year: sessionUser?.profile?.year ?? undefined,
      section: sessionUser?.profile?.section ?? undefined,
    };

    const result = await queryCampusAi(question, effectiveRole, userContext);
    return {
      success: true,
      ...result,
    };
  } catch (err: any) {
    console.error("Error running Campus AI query:", err);
    return {
      success: false,
      answer: "We encountered an issue processing your question about BVRIT Narsapur. Please try again shortly.",
      category: "Error",
      sourceTopics: [],
      suggestedFollowUps: [
        "Tell me about BVRIT placements",
        "Show college bus routes",
        "Who is the Principal?",
      ],
      error: err?.message || "Internal server error",
    };
  }
}

/**
 * Get category metadata for exploration cards
 */
export async function getCampusQuickCategories() {
  return BVRIT_QUICK_CATEGORIES;
}

/**
 * Get institutional overview details
 */
export async function getCampusInstitutionProfile() {
  return BVRIT_INSTITUTION_PROFILE;
}

/**
 * Get list of departments for quick lookup
 */
export async function getCampusDepartmentsList() {
  return BVRIT_DEPARTMENTS.map((d) => ({
    code: d.code,
    name: d.name,
    degree: d.degree,
    hod: d.hod,
    intake: d.intake,
  }));
}

/**
 * Get emergency numbers
 */
export async function getCampusEmergencyContacts() {
  return BVRIT_KEY_CONTACTS.filter(
    (c) =>
      c.designation.includes("Ambulance") ||
      c.designation.includes("Anti-Ragging") ||
      c.designation.includes("Women") ||
      c.designation.includes("Principal")
  );
}
