"use server";

import { getOpportunityById } from "@/lib/opportunities/actions";
import { getStudentMatchingProfile } from "./actions";
import { evaluateOpportunityMatch, parseCgpaRequirement } from "./engine";
import { OpportunityMatchingCriteria, StudentMatchingProfile } from "./types";
import { Profile } from "@/types/database";

import { QUICK_QUESTIONS } from "./constants";

export interface AssistantResponse {
  success: boolean;
  answer: string;
  suggestedQuestions?: string[];
  error?: string;
}

/**
 * Answers questions about an opportunity grounded strictly in student profile & opportunity facts.
 * Never hallucinates missing facts or guarantees outcomes.
 */
export async function answerOpportunityQuestion(
  opportunityId: string,
  question: string,
  customStudentProfile?: Partial<StudentMatchingProfile> | any
): Promise<AssistantResponse> {
  const cleanQ = question.trim();
  if (!cleanQ) {
    return {
      success: false,
      answer: "Please ask a question about this opportunity.",
      error: "Empty question",
    };
  }

  const opp = await getOpportunityById(opportunityId);
  if (!opp) {
    return {
      success: false,
      answer: "Opportunity details could not be found.",
      error: "Opportunity not found",
    };
  }

  const defaultStudent = await getStudentMatchingProfile();
  const student: StudentMatchingProfile = customStudentProfile
    ? {
        ...defaultStudent,
        ...(customStudentProfile as any),
        department:
          typeof (customStudentProfile as any).department === "string"
            ? (customStudentProfile as any).department
            : (customStudentProfile as any).department?.name || defaultStudent.department,
        cgpa: (customStudentProfile as any).cgpa ?? (customStudentProfile as any).current_cgpa ?? defaultStudent.cgpa,
      }
    : defaultStudent;

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
    eligible_departments: opp.eligible_departments || [],
    eligible_years: opp.eligible_years || [],
    min_cgpa: opp.min_cgpa ?? null,
    required_skills: opp.required_skills && opp.required_skills.length > 0 ? opp.required_skills : (opp.skills || []),
    preferred_skills: opp.preferred_skills || [],
  };

  const match = evaluateOpportunityMatch(student, criteria);
  const qLower = cleanQ.toLowerCase();

  // 1. "Am I a good match?" / Match evaluation / Eligibility check
  if (
    (qLower.includes("match") &&
      (qLower.includes("good") || qLower.includes("am i") || qLower.includes("how well") || qLower.includes("fit"))) ||
    qLower.includes("am i eligible") ||
    qLower.includes("can i apply") ||
    qLower.includes("evaluate my profile")
  ) {
    let response = `Your profile is evaluated as a **${match.matchCategory}**.\n\n`;
    response += match.aiExplanation + "\n\n";

    if (match.satisfiedRequirements.length > 0) {
      response += `**Satisfied Criteria:**\n${match.satisfiedRequirements.map((r) => `• ${r}`).join("\n")}\n\n`;
    }

    if (match.unsatisfiedRequirements.length > 0) {
      response += `**Unsatisfied Criteria:**\n${match.unsatisfiedRequirements.map((r) => `• ${r}`).join("\n")}\n\n`;
    }

    if (match.missingInfoRequirements.length > 0) {
      response += `**Missing Profile Details:**\n${match.missingInfoRequirements.map((r) => `• ${r}`).join("\n")}\n\n`;
    }

    response += `*Please verify the official opportunity requirements before applying.*`;
    return { success: true, answer: response };
  }

  // 2. "Which of my skills match?" / Matching skills
  if (
    (qLower.includes("which") && qLower.includes("skill")) ||
    (qLower.includes("matching") && qLower.includes("skill")) ||
    (qLower.includes("skills") && qLower.includes("match")) ||
    qLower.includes("what skills match") ||
    qLower.includes("do i have the skills")
  ) {
    if (match.matchingSkills.length === 0) {
      return {
        success: true,
        answer: `None of the skills currently listed in your profile (${student.skills?.join(", ") || "no skills listed"}) match the official skills requested for this role. Consider updating your profile if you have relevant experience.`,
      };
    }

    return {
      success: true,
      answer: `Matching skills (${match.matchingSkills.length}):\n\n${match.matchingSkills.map((s) => `• **${s}**`).join("\n")}\n\n*Official requirements remain the source of truth.*`,
    };
  }

  // 3. "What skills am I missing?" / Missing skills
  if (
    (qLower.includes("missing") && qLower.includes("skill")) ||
    qLower.includes("gap") ||
    qLower.includes("skills do i need") ||
    qLower.includes("what skills am i missing")
  ) {
    const reqMissing = match.missingRequiredSkills;
    const prefMissing = match.missingPreferredSkills;

    if (reqMissing.length === 0 && prefMissing.length === 0) {
      return {
        success: true,
        answer: `Great news! You currently match all listed required and preferred skills for this opportunity based on your profile.`,
      };
    }

    let res = "";
    if (reqMissing.length > 0) {
      res += `**Missing Required Skills (${reqMissing.length}):**\n${reqMissing.map((s) => `• ${s}`).join("\n")}\n\n`;
    } else {
      res += `You have listed all required skills for this role.\n\n`;
    }

    if (prefMissing.length > 0) {
      res += `**Missing Preferred Skills (${prefMissing.length}):**\n${prefMissing.map((s) => `• ${s} (Preferred)`).join("\n")}\n\n`;
    }

    res += `*Tip: If you have practical project or coursework experience in any of these areas, be sure to highlight it in your resume.*`;
    return { success: true, answer: res };
  }

  // 4. "Summarize this opportunity" / Summary
  if (
    qLower.includes("summarize") ||
    qLower.includes("summary") ||
    qLower.includes("overview") ||
    qLower.includes("about this") ||
    qLower.includes("what is this opportunity")
  ) {
    let summary = `• **Role:** ${opp.title}\n`;
    summary += `• **Company:** ${opp.company}\n`;
    summary += `• **Type:** ${opp.type.toUpperCase()}\n`;
    summary += `• **Location:** ${opp.location} (${opp.work_mode})\n`;
    if (opp.stipend || opp.package) {
      summary += `• **Compensation:** ${opp.stipend || opp.package}\n`;
    }
    summary += `• **Official Description:** ${opp.description}\n`;
    return { success: true, answer: summary };
  }

  // 5. "What is the deadline?" / Deadline
  if (
    qLower.includes("deadline") ||
    qLower.includes("last date") ||
    qLower.includes("due date") ||
    qLower.includes("when does it close") ||
    qLower.includes("when to apply")
  ) {
    if (!opp.deadline) {
      return {
        success: true,
        answer: "The application deadline is not specified in the official opportunity listing.",
      };
    }

    const d = new Date(opp.deadline);
    if (isNaN(d.getTime())) {
      return {
        success: true,
        answer: "The application deadline is not specified in the official opportunity listing.",
      };
    }

    const formattedDate = d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const statusText = opp.isClosed
      ? "This opportunity is marked as **Closed**."
      : opp.daysRemaining === 0
      ? "Deadline is **Today**! Submit promptly."
      : opp.daysRemaining === 1
      ? "Deadline is **Tomorrow**!"
      : `Application closes in **${opp.daysRemaining} days**.`;

    return {
      success: true,
      answer: `• **Deadline:** ${formattedDate}\n\n${statusText}`,
    };
  }

  // 6. "What are the eligibility requirements?" / Eligibility
  if (
    qLower.includes("eligibility") ||
    qLower.includes("criteria") ||
    qLower.includes("requirement") ||
    qLower.includes("cgpa required") ||
    qLower.includes("who can apply")
  ) {
    let elig = `**Official Eligibility Requirements:**\n${opp.eligibility}\n\n`;

    if (opp.eligible_departments && opp.eligible_departments.length > 0) {
      elig += `• **Eligible Departments:** ${opp.eligible_departments.join(", ")}\n`;
    } else {
      elig += `• **Eligible Departments:** Open to all departments\n`;
    }

    if (opp.eligible_years && opp.eligible_years.length > 0) {
      elig += `• **Target Academic Years:** ${opp.eligible_years.map((y) => `Year ${y}`).join(", ")}\n`;
    } else {
      elig += `• **Target Academic Years:** Open to all years\n`;
    }

    const minCgpa = opp.min_cgpa ?? parseCgpaRequirement(opp.eligibility);
    if (minCgpa !== null) {
      elig += `• **Minimum CGPA:** ${minCgpa.toFixed(2)}\n`;
    } else {
      elig += `• **Minimum CGPA:** Not specified\n`;
    }

    elig += `\n*Please verify the official opportunity requirements before applying.*`;
    return { success: true, answer: elig };
  }

  // 7. Compensation / Stipend / Package
  if (qLower.includes("stipend") || qLower.includes("salary") || qLower.includes("package") || qLower.includes("ctc") || qLower.includes("pay")) {
    const comp = opp.stipend || opp.package;
    if (comp) {
      return {
        success: true,
        answer: `The listed compensation for this role is **${comp}**.`,
      };
    }
    return {
      success: true,
      answer: "Compensation details are not specified in the official opportunity listing.",
    };
  }

  // 8. Location / Work mode
  if (qLower.includes("location") || qLower.includes("remote") || qLower.includes("where") || qLower.includes("work mode") || qLower.includes("on-site")) {
    return {
      success: true,
      answer: `This role is **${opp.work_mode}** based in **${opp.location}**.`,
    };
  }

  // 9. Generic query fallback
  return {
    success: true,
    answer: `Based on the official opportunity listing for **${opp.title}** at **${opp.company}**:\n\n${opp.description}\n\n*If you are looking for specific details not mentioned in the listing, it is not specified.*`,
  };
}
