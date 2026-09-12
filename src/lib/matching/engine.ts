import {
  StudentMatchingProfile,
  OpportunityMatchingCriteria,
  MatchingResult,
  MatchCategory,
} from "./types";

const DISCLAIMER_TEXT =
  "Please verify the official opportunity requirements before applying.";

/**
 * Extracts CGPA number from eligibility text if present (e.g. "CGPA >= 7.5" -> 7.5)
 */
export function parseCgpaRequirement(eligibilityText: string): number | null {
  if (!eligibilityText) return null;
  const matchAfter = eligibilityText.match(/(?:cgpa|gpa)\s*(?:>=|>|:|=|\s)?\s*([0-9](?:\.[0-9]{1,2})?)/i);
  if (matchAfter && matchAfter[1]) {
    const val = parseFloat(matchAfter[1]);
    if (!isNaN(val) && val >= 4.0 && val <= 10.0) {
      return val;
    }
  }
  const matchBefore = eligibilityText.match(/([0-9](?:\.[0-9]{1,2})?)\s*(?:cgpa|gpa)/i);
  if (matchBefore && matchBefore[1]) {
    const val = parseFloat(matchBefore[1]);
    if (!isNaN(val) && val >= 4.0 && val <= 10.0) {
      return val;
    }
  }
  return null;
}

/**
 * Deterministic Matching Engine
 * Compares student criteria with opportunity requirements.
 * Adheres strictly to factual matching, no random invented numbers, and strict disclaimer rules.
 */
export function evaluateOpportunityMatch(
  student: StudentMatchingProfile,
  opportunity: OpportunityMatchingCriteria
): MatchingResult {
  // 1. Missing information check (empty profile)
  const hasSkills = Array.isArray(student.skills) && student.skills.length > 0;
  const hasDept = Boolean(student.department && student.department.trim().length > 0);
  const hasYear = typeof student.year === "number" && student.year > 0;

  if (!hasSkills && !hasDept && !hasYear && (student.cgpa === undefined || student.cgpa === null)) {
    return {
      matchCategory: "Unable to Determine",
      matchScore: 0,
      matchingSkills: [],
      missingRequiredSkills: opportunity.required_skills || opportunity.skills || [],
      missingPreferredSkills: opportunity.preferred_skills || [],
      satisfiedRequirements: [],
      unsatisfiedRequirements: [],
      missingInfoRequirements: [
        "Department not specified in profile",
        "Academic year not specified in profile",
        "CGPA not provided in profile",
        "No technical skills listed in profile",
      ],
      aiExplanation:
        "Unable to determine from the available information. Please update your profile with your department, academic year, and technical skills.",
      disclaimer: DISCLAIMER_TEXT,
      status: "unable_to_determine",
      strongMatches: [],
      potentialGaps: ["Profile information incomplete"],
      eligibilityExplanation:
        "Unable to determine from the available information. Please update your profile with your department, academic year, and technical skills.",
    };
  }

  const satisfiedRequirements: string[] = [];
  const unsatisfiedRequirements: string[] = [];
  const missingInfoRequirements: string[] = [];

  let deptSatisfied = false;
  let yearSatisfied = false;
  let cgpaSatisfied = false;

  // 2. Department Eligibility
  const oppDepts =
    opportunity.eligible_departments && opportunity.eligible_departments.length > 0
      ? opportunity.eligible_departments
      : opportunity.department
      ? [opportunity.department]
      : [];

  const studentDeptRaw = (student as any).department;
  const studentDept =
    typeof studentDeptRaw === "string"
      ? studentDeptRaw.trim()
      : studentDeptRaw?.name?.trim() || studentDeptRaw?.code?.trim() || "";

  if (oppDepts.length === 0 || oppDepts.some((d) => d.toLowerCase() === "all" || d.toLowerCase() === "any")) {
    satisfiedRequirements.push("Department: Open to all academic departments");
    deptSatisfied = true;
  } else if (!studentDept) {
    missingInfoRequirements.push(`Department: Opportunity specifies ${oppDepts.join(", ")}, but your department is not listed`);
    deptSatisfied = false;
  } else {
    const isDeptMatched = oppDepts.some(
      (d) =>
        d.toLowerCase() === studentDept.toLowerCase() ||
        (studentDept.toLowerCase().includes(d.toLowerCase()) && d.length >= 2) ||
        (d.toLowerCase().includes(studentDept.toLowerCase()) && studentDept.length >= 2)
    );
    if (isDeptMatched) {
      satisfiedRequirements.push(`Department: ${studentDept} matches eligible departments (${oppDepts.join(", ")})`);
      deptSatisfied = true;
    } else {
      unsatisfiedRequirements.push(`Department: Opportunity specifies ${oppDepts.join(", ")}, but your profile lists ${studentDept}`);
      deptSatisfied = false;
    }
  }

  // 3. Year Eligibility
  const normalizeYear = (y: any): number | null => {
    if (typeof y === "number") return y;
    if (typeof y === "string") {
      const match = y.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return null;
  };

  const oppYears =
    opportunity.eligible_years && opportunity.eligible_years.length > 0
      ? opportunity.eligible_years
      : opportunity.year
      ? [opportunity.year]
      : [];

  const studentYearNum = normalizeYear(student.year);
  const oppYearNums = oppYears.map(normalizeYear).filter((y): y is number => y !== null);

  if (oppYears.length === 0) {
    satisfiedRequirements.push("Academic Year: Open to all academic years");
    yearSatisfied = true;
  } else if (studentYearNum === null) {
    missingInfoRequirements.push(`Academic Year: Targets ${oppYears.map((y) => `Year ${y}`).join(", ")}, but your year is not specified`);
    yearSatisfied = false;
  } else {
    const isYearMatched = oppYearNums.length === 0 || oppYearNums.includes(studentYearNum);
    if (isYearMatched) {
      satisfiedRequirements.push(`Academic Year: Year ${studentYearNum} matches target cohort (${oppYears.map((y) => `Year ${y}`).join(", ")})`);
      yearSatisfied = true;
    } else {
      unsatisfiedRequirements.push(`Academic Year: Targets ${oppYears.map((y) => `Year ${y}`).join(", ")}, but your profile lists Year ${studentYearNum}`);
      yearSatisfied = false;
    }
  }

  // 4. Minimum CGPA Eligibility
  const minCgpa =
    opportunity.min_cgpa !== undefined && opportunity.min_cgpa !== null
      ? opportunity.min_cgpa
      : parseCgpaRequirement(opportunity.eligibility);

  const studentCgpaRaw = (student as any).cgpa ?? (student as any).current_cgpa ?? null;
  const numCgpa =
    typeof studentCgpaRaw === "number"
      ? studentCgpaRaw
      : typeof studentCgpaRaw === "string" && !isNaN(parseFloat(studentCgpaRaw))
      ? parseFloat(studentCgpaRaw)
      : null;

  if (minCgpa === null) {
    satisfiedRequirements.push("CGPA: No minimum CGPA cutoff required");
    cgpaSatisfied = true;
  } else if (numCgpa === null || isNaN(numCgpa)) {
    missingInfoRequirements.push(`Minimum CGPA: Requires ${minCgpa.toFixed(2)}, but your CGPA is not listed in your profile`);
    cgpaSatisfied = false;
  } else if (numCgpa >= minCgpa) {
    satisfiedRequirements.push(`Minimum CGPA: Your CGPA (${numCgpa.toFixed(2)}) meets the minimum requirement of ${minCgpa.toFixed(2)}`);
    cgpaSatisfied = true;
  } else {
    unsatisfiedRequirements.push(`Minimum CGPA: Opportunity requires ${minCgpa.toFixed(2)}, but your profile lists ${numCgpa.toFixed(2)}`);
    cgpaSatisfied = false;
  }

  // 5. Skills Matching (Required vs Preferred)
  const studentSkillsList = student.skills || [];
  const studentSkillNorm = studentSkillsList.map((s) => s.trim().toLowerCase()).filter(Boolean);

  const skillMatches = (target: string): boolean => {
    const cleanTarget = target.trim().toLowerCase();
    
    // 1. Direct or substring match
    if (studentSkillNorm.some((s) => s === cleanTarget || s.includes(cleanTarget) || cleanTarget.includes(s))) {
      return true;
    }

    // 2. Slash/comma alternatives (e.g. "JavaScript / Python / Go" -> matches if student has any one)
    if (cleanTarget.includes("/") || cleanTarget.includes(",")) {
      const parts = cleanTarget.split(/[/,]/).map((p) => p.trim()).filter(Boolean);
      if (parts.some((part) => skillMatches(part))) {
        return true;
      }
    }

    // 3. Synonym / Domain aliases
    const aliases: Record<string, string[]> = {
      "full stack": ["react", "next.js", "node.js", "frontend", "backend", "fullstack"],
      "dsa": ["data structures", "algorithms", "problem solving"],
      "data structures": ["dsa", "algorithms"],
      "algorithms": ["dsa", "data structures", "problem solving"],
      "problem solving": ["dsa", "algorithms", "problem solving"],
      "c/c++": ["c", "c++"],
      "ai/ml": ["ai", "ml", "machine learning", "pytorch", "tensorflow", "deep learning"],
      "ai / machine learning": ["ai", "ml", "machine learning", "pytorch", "tensorflow"],
    };

    const targetAliases = aliases[cleanTarget];
    if (targetAliases && targetAliases.some((alias) => studentSkillNorm.some((s) => s === alias || s.includes(alias) || alias.includes(s)))) {
      return true;
    }

    for (const s of studentSkillNorm) {
      const studentAliases = aliases[s];
      if (studentAliases && studentAliases.some((alias) => alias === cleanTarget || cleanTarget.includes(alias))) {
        return true;
      }
    }

    return false;
  };

  const reqList =
    opportunity.required_skills && opportunity.required_skills.length > 0
      ? opportunity.required_skills
      : opportunity.skills && opportunity.skills.length > 0
      ? opportunity.skills
      : [];

  const prefList = opportunity.preferred_skills || [];

  const matchingSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];

  for (const skill of reqList) {
    if (skillMatches(skill)) {
      matchingSkills.push(skill);
    } else {
      missingRequiredSkills.push(skill);
    }
  }

  for (const skill of prefList) {
    if (skillMatches(skill)) {
      if (!matchingSkills.includes(skill)) {
        matchingSkills.push(skill);
      }
    } else {
      missingPreferredSkills.push(skill);
    }
  }

  // 6. Deterministic Category Decision
  let matchCategory: MatchCategory = "Partial Match";
  let matchScore = 0;

  const totalRequired = reqList.length;
  const matchedRequired = totalRequired - missingRequiredSkills.length;
  const reqRatio = totalRequired > 0 ? matchedRequired / totalRequired : 1.0;

  // Composite score calculation (Skills-heavy weighting: 70% skills, 15% dept, 10% year, 5% CGPA)
  let eligibilityScore = 0;
  if (deptSatisfied) eligibilityScore += 15;
  if (yearSatisfied) eligibilityScore += 10;
  if (cgpaSatisfied || minCgpa === null) eligibilityScore += 5; // CGPA is a baseline metric (5%)

  // Skills dominate the evaluation (70 points total)
  const prefRatio = prefList.length > 0 ? (prefList.length - missingPreferredSkills.length) / prefList.length : 1.0;
  const skillsScore =
    Math.round(reqRatio * 60) +
    Math.round(prefRatio * 10);

  // Accurate composite score from 0 to 100
  matchScore = Math.min(100, Math.max(0, eligibilityScore + skillsScore));

  if (unsatisfiedRequirements.length > 0 && !cgpaSatisfied && minCgpa !== null && unsatisfiedRequirements.length === 1) {
    // Only CGPA unsatisfied but skills match: still allow evaluation based on skills
    if (reqRatio >= 0.75) {
      matchCategory = "Good Match";
    } else {
      matchCategory = "Partial Match";
    }
  } else if (unsatisfiedRequirements.length > 0) {
    matchCategory = "Requirements Not Fully Matched";
  } else if (!hasSkills && reqList.length > 0) {
    matchCategory = "Unable to Determine";
    matchScore = 15;
  } else if (deptSatisfied && yearSatisfied && reqRatio >= 0.75 && matchScore >= 80) {
    matchCategory = "Strong Match";
  } else if (deptSatisfied && yearSatisfied && (reqRatio >= 0.4 || matchScore >= 55)) {
    matchCategory = "Good Match";
  } else {
    matchCategory = "Partial Match";
  }

  // 7. Formulate Short, Factual AI Explanation (Skills-First)
  let aiExplanation = "";
  if (matchScore === 100) {
    aiExplanation = `Outstanding 100% profile match! You satisfy all eligibility prerequisites (Department, Academic Year, and CGPA cutoff) and match 100% of the required and preferred technical skills (${matchingSkills.slice(0, 5).join(", ")}).`;
  } else if (matchCategory === "Strong Match") {
    aiExplanation = `Your technical skill profile strongly aligns with this opportunity. You match ${matchedRequired} of ${totalRequired} required skills (${matchingSkills.slice(0, 4).join(", ")}).`;
    if (missingRequiredSkills.length > 0) {
      aiExplanation += ` Focus on acquiring ${missingRequiredSkills[0]} to close the remaining gap.`;
    }
    if (cgpaSatisfied) {
      aiExplanation += ` Academic baseline (CGPA) meets requirement.`;
    }
  } else if (matchCategory === "Good Match") {
    aiExplanation = `Your profile demonstrates solid skill overlap (${matchedRequired}/${totalRequired} required skills matched).`;
    if (missingRequiredSkills.length > 0) {
      aiExplanation += ` Enhancing ${missingRequiredSkills.slice(0, 2).join(", ")} will substantially increase your readiness.`;
    }
    if (!cgpaSatisfied && minCgpa !== null) {
      aiExplanation += ` Note: Company mentions a preferred CGPA of ${minCgpa.toFixed(2)}.`;
    }
  } else if (matchCategory === "Requirements Not Fully Matched") {
    const reasons = unsatisfiedRequirements.map((r) => r.split(":")[0]).join(", ");
    aiExplanation = `Eligibility constraints noted (${reasons}). While skill alignment is considered, official opportunity criteria may restrict applications for this cohort.`;
  } else if (matchCategory === "Unable to Determine") {
    aiExplanation = "Unable to determine skill alignment. Please update your profile with your verified programming languages and technical skills.";
  } else {
    aiExplanation = `Partial skill alignment (${matchedRequired}/${totalRequired} required skills). Expanding your technical competencies in ${missingRequiredSkills.slice(0, 3).join(", ")} is recommended.`;
  }

  return {
    matchCategory,
    matchScore,
    matchingSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    satisfiedRequirements,
    unsatisfiedRequirements,
    missingInfoRequirements,
    aiExplanation,
    disclaimer: DISCLAIMER_TEXT,

    // Eligibility boolean flag
    isEligible: deptSatisfied && yearSatisfied && (cgpaSatisfied || minCgpa === null) && unsatisfiedRequirements.length === 0,

    // Compatibility aliases
    status:
      matchCategory === "Strong Match"
        ? "strong_match"
        : matchCategory === "Good Match"
        ? "moderate_match"
        : matchCategory === "Unable to Determine"
        ? "unable_to_determine"
        : "low_match",
    strongMatches: matchingSkills,
    potentialGaps: [...missingRequiredSkills, ...unsatisfiedRequirements],
    eligibilityExplanation: aiExplanation,
  };
}

/**
 * AI Wrapper for Match Calculation
 */
export async function performAIOpportunityMatch(
  student: StudentMatchingProfile,
  opportunity: OpportunityMatchingCriteria
): Promise<MatchingResult> {
  // Deterministic calculation first
  const deterministicResult = evaluateOpportunityMatch(student, opportunity);
  return deterministicResult;
}
