/**
 * CampusHub TPO — 4-Tier Student Eligibility & Match Engine
 * 
 * Evaluates student profiles against placement drives into 4 tiers:
 * 1. "Strong Match"
 * 2. "Potential Match"
 * 3. "Requirements Not Fully Matched"
 * 4. "Unable to Determine"
 * 
 * STRICT POLICY:
 * - Never hides drives from students.
 * - Clearly distinguishes criteria (CGPA cutoff, Department, Graduation Year, Skills).
 * - Gives constructive suggestions on bridging gaps.
 */

import { PlacementDrive, StudentMatchEvaluation, MatchTier } from "./types";

export interface StudentProfileInput {
  department?: string | null;
  year?: number | null;
  cgpa?: number | null;
  skills?: string[];
}

export function evaluateStudentDriveMatch(
  student: StudentProfileInput,
  drive: PlacementDrive
): StudentMatchEvaluation {
  const studentDept = (student.department || "").toUpperCase().trim();
  const studentYear = student.year ?? null;
  const studentCgpa = student.cgpa ?? null;
  const studentSkills = new Set((student.skills || []).map((s) => s.toLowerCase().trim()));

  // 1. Missing vital information check
  if (studentCgpa === null || studentCgpa === undefined || !studentDept) {
    return {
      tier: "Unable to Determine",
      score: 40,
      criteriaBreakdown: {
        departmentMatch: false,
        yearMatch: false,
        cgpaMatch: false,
        skillsMatchPercentage: 0,
      },
      matchingSkills: [],
      missingSkills: drive.requiredSkills.slice(0, 3),
      explanation: "Complete your department and CGPA details in your profile to check exact eligibility.",
      recommendations: ["Update your CGPA in Profile Settings", "Verify your department and academic year"],
    };
  }

  // 2. Department check
  const normalizedEligibleDepts = drive.eligibleDepartments.map((d) => d.toUpperCase().trim());
  const departmentMatch =
    normalizedEligibleDepts.length === 0 ||
    normalizedEligibleDepts.includes("ALL") ||
    normalizedEligibleDepts.some((d) => studentDept.includes(d) || d.includes(studentDept));

  // 3. Year check
  const yearMatch =
    drive.eligibleYears.length === 0 ||
    (studentYear !== null && drive.eligibleYears.includes(studentYear));

  // 4. CGPA check
  const cgpaMatch = studentCgpa >= drive.minCgpa;
  const cgpaNearMiss = studentCgpa >= drive.minCgpa - 0.4 && studentCgpa < drive.minCgpa;

  // 5. Skills matching
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  drive.requiredSkills.forEach((req) => {
    const lower = req.toLowerCase().trim();
    if (studentSkills.has(lower) || Array.from(studentSkills).some((s) => s.includes(lower) || lower.includes(s))) {
      matchingSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const totalRequired = drive.requiredSkills.length;
  const skillsRatio = totalRequired > 0 ? matchingSkills.length / totalRequired : 1.0;
  const skillsMatchPercentage = Math.round(skillsRatio * 100);

  // 6. Compute composite score
  let score = 0;
  if (departmentMatch) score += 30;
  if (yearMatch) score += 20;
  if (cgpaMatch) {
    score += 25;
  } else if (cgpaNearMiss) {
    score += 15;
  }
  score += Math.round(skillsRatio * 25);

  // 7. Assign 4-Tier classification
  let tier: MatchTier;
  let explanation = "";
  const recommendations: string[] = [];

  if (!departmentMatch || !yearMatch || (!cgpaMatch && !cgpaNearMiss)) {
    tier = "Requirements Not Fully Matched";
    const unmet: string[] = [];
    if (!departmentMatch) unmet.push(`Department ${studentDept} is outside target branches (${drive.eligibleDepartments.join(", ")})`);
    if (!yearMatch) unmet.push(`Year ${studentYear} does not match targeted graduation cohorts (${drive.eligibleYears.join(", ")})`);
    if (!cgpaMatch) unmet.push(`Current CGPA ${studentCgpa.toFixed(2)} is below the ${drive.minCgpa.toFixed(1)} cutoff`);
    
    explanation = `Criteria not fully met: ${unmet.join("; ")}. You can still view all drive details for preparation reference.`;
    if (missingSkills.length > 0) {
      recommendations.push(`Familiarize yourself with demanded skills: ${missingSkills.slice(0, 3).join(", ")}`);
    }
  } else if (departmentMatch && yearMatch && cgpaMatch && skillsRatio >= 0.5) {
    tier = "Strong Match";
    explanation = `Outstanding alignment! You clear all academic prerequisites (CGPA ${studentCgpa.toFixed(2)} >= ${drive.minCgpa.toFixed(1)}, ${studentDept}) and possess ${matchingSkills.length} key required skills.`;
    recommendations.push("Ensure your ATS resume is updated with relevant projects", "Review the online assessment syllabus");
  } else {
    tier = "Potential Match";
    explanation = `You satisfy core academic eligibility (Department & Year). Strengthening ${missingSkills.slice(0, 2).join(" & ") || "additional project bullets"} will boost your shortlisting chances.`;
    if (missingSkills.length > 0) {
      recommendations.push(`Review core concepts in ${missingSkills[0]} before the online assessment`);
    }
    if (cgpaNearMiss) {
      recommendations.push("Confirm with the placement coordinator if relaxation applies for high test scorers");
    }
  }

  return {
    tier,
    score: Math.min(100, Math.max(10, score)),
    criteriaBreakdown: {
      departmentMatch,
      yearMatch,
      cgpaMatch,
      skillsMatchPercentage,
    },
    matchingSkills,
    missingSkills,
    explanation,
    recommendations,
  };
}
