/**
 * CampusHub — Deterministic Placement Match & Senior Preparation Guidance Engine
 * 
 * Compares authenticated student profiles against official placement activity requirements
 * using strict, reproducible mathematical rules (zero hallucinated percentages).
 * Provides practical, actionable mentorship advice tailored to timeline and activity type.
 */

import {
  PlacementActivity,
  StudentPlacementProfile,
  PlacementActivityMatch,
  PlacementMatchTier,
  PlacementPreparationPlan,
  PreparationPlanSkill,
  ConceptCheckpoint,
  PracticeQuestionItem,
  DocumentOrGearItem,
} from "./types";

export function evaluatePlacementActivityMatch(
  student: StudentPlacementProfile,
  activity: PlacementActivity
): PlacementActivityMatch {
  const matchingRequirements: string[] = [];
  const missingInformation: string[] = [];
  const unmatchedRequirements: string[] = [];
  const areasToImprove: string[] = [];

  const studentDept = (student.department || "").toUpperCase().trim();
  const studentYear = student.year ?? null;
  const studentCgpa = student.cgpa ?? null;
  const studentSkills = new Set((student.skills || []).map((s) => s.toLowerCase().trim()));

  // 1. Missing information check
  if (!studentDept) {
    missingInformation.push("Department not specified in student profile");
  }
  if (studentYear === null || studentYear === undefined) {
    missingInformation.push("Academic year not specified in student profile");
  }
  if (studentCgpa === null || studentCgpa === undefined) {
    missingInformation.push("CGPA not recorded in student profile");
  }
  if ((student.skills || []).length === 0) {
    missingInformation.push("No technical skills listed in student profile");
  }

  // 2. Department check
  const normalizedEligibleDepts = activity.eligibleDepartments.map((d) => d.toUpperCase().trim());
  const departmentMatch =
    normalizedEligibleDepts.length === 0 ||
    normalizedEligibleDepts.includes("ALL") ||
    normalizedEligibleDepts.some((d) => studentDept.includes(d) || d.includes(studentDept));

  if (studentDept) {
    if (departmentMatch) {
      matchingRequirements.push(`${studentDept} department (Eligible: ${activity.eligibleDepartments.join(", ")})`);
    } else {
      unmatchedRequirements.push(`${studentDept} department (Eligible: ${activity.eligibleDepartments.join(", ")})`);
    }
  }

  // 3. Year check
  const yearMatch =
    activity.eligibleYears.length === 0 ||
    (studentYear !== null && activity.eligibleYears.includes(studentYear));

  if (studentYear !== null) {
    if (yearMatch) {
      matchingRequirements.push(`Year ${studentYear} student (Eligible batches: ${activity.eligibleYears.map(y => `${y}th`).join(", ")})`);
    } else {
      unmatchedRequirements.push(`Year ${studentYear} (Activity restricted to: ${activity.eligibleYears.map(y => `${y}th`).join(", ")})`);
    }
  }

  // 4. CGPA check
  let cgpaMatch = false;
  if (studentCgpa !== null) {
    cgpaMatch = studentCgpa >= activity.minCgpa;
    if (cgpaMatch) {
      matchingRequirements.push(`CGPA ${studentCgpa.toFixed(2)} meets minimum cutoff of ${activity.minCgpa.toFixed(1)}`);
    } else {
      unmatchedRequirements.push(`CGPA ${studentCgpa.toFixed(2)} is below minimum cutoff of ${activity.minCgpa.toFixed(1)}`);
    }
  }

  // 5. Skills matching (strictly checking required & preferred skills)
  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const matchedPreferredSkills: string[] = [];

  activity.requiredSkills.forEach((req) => {
    const lower = req.toLowerCase().trim();
    const isMatched =
      studentSkills.has(lower) ||
      Array.from(studentSkills).some((s) => s.includes(lower) || lower.includes(s));

    if (isMatched) {
      matchedRequiredSkills.push(req);
      matchingRequirements.push(req);
    } else {
      missingRequiredSkills.push(req);
      areasToImprove.push(req);
    }
  });

  activity.preferredSkills.forEach((pref) => {
    const lower = pref.toLowerCase().trim();
    const isMatched =
      studentSkills.has(lower) ||
      Array.from(studentSkills).some((s) => s.includes(lower) || lower.includes(s));

    if (isMatched) {
      matchedPreferredSkills.push(pref);
      matchingRequirements.push(`${pref} (Preferred skill)`);
    }
  });

  // Calculate Deterministic Match Score (0 - 100)
  // Weight distribution:
  // - Department: 25%
  // - Academic Year: 20%
  // - CGPA Cutoff: 25%
  // - Required Skills: 25%
  // - Preferred Skills bonus: up to 5%
  let score = 0;
  if (departmentMatch && studentDept) score += 25;
  if (yearMatch && studentYear !== null) score += 20;
  if (cgpaMatch && studentCgpa !== null) {
    score += 25;
  } else if (studentCgpa !== null && studentCgpa >= activity.minCgpa - 0.4) {
    score += 15; // borderline CGPA within 0.4 margin
  }

  const totalRequired = activity.requiredSkills.length;
  const reqSkillRatio = totalRequired > 0 ? matchedRequiredSkills.length / totalRequired : 1.0;
  score += Math.round(reqSkillRatio * 25);

  if (activity.preferredSkills.length > 0 && matchedPreferredSkills.length > 0) {
    score += Math.min(5, Math.round((matchedPreferredSkills.length / activity.preferredSkills.length) * 5));
  }

  score = Math.min(100, Math.max(0, score));

  // Determine Meaningful Match Tier
  let tier: PlacementMatchTier;

  if (missingInformation.length >= 2) {
    tier = "Unable to Determine";
  } else if (!departmentMatch || !yearMatch || (studentCgpa !== null && studentCgpa < activity.minCgpa - 0.5)) {
    tier = "Requirements Not Fully Matched";
  } else if (departmentMatch && yearMatch && cgpaMatch && reqSkillRatio >= 0.75) {
    tier = "Strong Match";
  } else if (departmentMatch && yearMatch && (cgpaMatch || studentCgpa === null) && reqSkillRatio >= 0.4) {
    tier = "Good Match";
  } else {
    tier = "Partial Match";
  }

  // 6. Top Strengths & Focus Areas (Concise, max 2-3 each)
  const topStrengths: string[] = [];
  matchedRequiredSkills.forEach((s) => {
    if (topStrengths.length < 3 && !topStrengths.includes(s)) topStrengths.push(s);
  });
  matchedPreferredSkills.forEach((s) => {
    if (topStrengths.length < 3 && !topStrengths.includes(s)) topStrengths.push(s);
  });
  if (topStrengths.length === 0 && student.skills && student.skills.length > 0) {
    topStrengths.push(student.skills[0]);
  }

  const topFocusAreas: string[] = [];
  missingRequiredSkills.forEach((s) => {
    if (topFocusAreas.length < 3 && !topFocusAreas.includes(s)) topFocusAreas.push(s);
  });
  (activity.importantPreparationSkills || []).forEach((s) => {
    if (topFocusAreas.length < 3 && !topFocusAreas.includes(s)) topFocusAreas.push(s);
  });
  if (topFocusAreas.length === 0 && activity.requiredSkills.length > 0) {
    topFocusAreas.push(activity.requiredSkills[0]);
  }

  const guidanceContext: GuidanceContext = {
    activity,
    student,
    matchedRequiredSkills,
    missingRequiredSkills,
    matchedPreferredSkills,
  };

  // 7. Action-focused Next Step Suggestion
  const nextStepSuggestion = generateNextStepSuggestion(guidanceContext, topStrengths, topFocusAreas);

  // 8. Generate Practical Senior Mentor Preparation Guidance
  const preparationGuidance = generatePreparationGuidance(guidanceContext);

  // 9. Structured Preparation Plan for "🚀 PREPARE ME" View
  const preparationPlan = generatePreparationPlan(guidanceContext, topStrengths, topFocusAreas);

  return {
    tier,
    score,
    topStrengths,
    topFocusAreas,
    nextStepSuggestion,
    matchingRequirements,
    missingInformation,
    unmatchedRequirements,
    areasToImprove,
    preparationGuidance,
    preparationPlan,
    verifiedDisclaimer: "Please verify official placement eligibility requirements before participating.",
  };
}

interface GuidanceContext {
  activity: PlacementActivity;
  student: StudentPlacementProfile;
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
}

function generatePreparationGuidance(ctx: GuidanceContext): string {
  const { activity, matchedRequiredSkills, missingRequiredSkills } = ctx;

  const activityDate = new Date(activity.date);
  const today = new Date();
  const todayDateStr = today.toISOString().slice(0, 10);
  const isToday = activity.date === todayDateStr;

  const diffMs = activityDate.getTime() - today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const matchedSummary = matchedRequiredSkills.slice(0, 3).join(", ");
  const missingSummary = missingRequiredSkills.slice(0, 2).join(" & ");

  // SCENARIO 1: Activity is happening TODAY
  if (isToday) {
    switch (activity.activityType) {
      case "Company Visit / Placement Drive":
        return `Since this drive is today, don't try to learn a completely new technology. Focus on revising your strongest skills first. Based on the listed requirements, revise ${matchedSummary || "your primary programming fundamentals"}, common DSA patterns, and SQL queries. Keep your college ID and hard copies of your ATS resume ready at the venue.`;

      case "Online Assessment":
        return `Since the assessment is scheduled for today, prioritize speed, accuracy, and edge-case handling. Run a quick 20-minute warmup on two familiar algorithms (${matchedSummary || "Arrays / HashMaps"}). Test your webcam and microphone, ensure a stable internet connection, and log in to ${activity.venue || "the portal"} 15 minutes before the ${activity.startTime} start time.`;

      case "Technical Interview":
        return `Since your technical interview is today, concentrate on articulating your problem-solving thought process. Review your listed resume projects, system architectures, and core ${matchedSummary || "coding"} concepts. Remember to speak aloud while coding, clarify assumptions upfront, and analyze time/space complexities.`;

      case "HR Interview":
        return `For today's HR discussion, review ${activity.companyName}'s recent milestones, engineering culture, and products. Structure your behavioral answers using the STAR method (Situation, Task, Action, Result) and have 2 thoughtful questions ready to ask the interview panel.`;

      case "Group Discussion":
        return `For today's Group Discussion, listen actively, establish clear viewpoints early, and back your points with real industry examples. Focus on encouraging team consensus rather than aggressive interrupting.`;

      case "Registration Deadline":
        return `Today is the final registration deadline for ${activity.companyName} (${activity.role}). Review the official eligibility criteria, verify that your profile CGPA and contact info are accurate, and submit your application before the window closes.`;

      case "Pre-Placement Talk":
        return `The pre-placement talk is happening today at ${activity.startTime}. Attend attentively to note key recruitment evaluation criteria, work culture, and CTC breakdown directly from ${activity.companyName}'s leadership team.`;

      default:
        return `This activity is scheduled for today at ${activity.startTime}. Focus on calm revision of your core strengths (${matchedSummary || "fundamentals"}), verify the venue details (${activity.venue}), and arrive punctually.`;
    }
  }

  // SCENARIO 2: Activity is upcoming in 1 to 3 days (Imminent)
  if (daysRemaining <= 3) {
    if (missingSummary) {
      return `With only ${daysRemaining === 1 ? "tomorrow" : `${daysRemaining} days`} remaining before this ${activity.activityType.toLowerCase()}, prioritize revising high-frequency interview questions in ${matchedSummary || "your core skills"} while skimming key syntax and concepts of ${missingSummary}. Dedicate tonight to timed problem-solving.`;
    }
    return `You have ${daysRemaining === 1 ? "tomorrow" : `${daysRemaining} days`} until ${activity.companyName}'s ${activity.activityType.toLowerCase()}. Your profile strongly covers the required skills (${matchedSummary}). Practice 3-4 standard coding interview questions and review standard database and OOP principles.`;
  }

  // SCENARIO 3: Activity is further out (e.g. Next week or later)
  if (missingSummary) {
    return `You have enough time (${daysRemaining} days) to strengthen one major preparation gap. Prioritizing ${missingSummary} is worth the effort because it is listed as an official requirement by ${activity.companyName} and builds naturally on your existing knowledge in ${matchedSummary || "programming"}.`;
  }

  return `You have ${daysRemaining} days until this activity. Your skill profile already matches the primary requirements (${matchedSummary}). Focus on mock technical interviews, practicing complex data structures, and deepening your understanding of ${activity.preferredSkills.slice(0, 2).join(" & ") || "system design fundamentals"}.`;
}

function generateNextStepSuggestion(
  ctx: GuidanceContext,
  topStrengths: string[],
  topFocusAreas: string[]
): string {
  const { activity } = ctx;
  const today = new Date();
  const todayDateStr = today.toISOString().slice(0, 10);
  const isToday = activity.date === todayDateStr;

  const activityDate = new Date(activity.date);
  const diffMs = activityDate.getTime() - today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (activity.activityType === "Registration Deadline") {
    return "Review the official eligibility criteria, double-check your resume contact details and CGPA, and submit your registration before today's cutoff.";
  }

  if (isToday) {
    const focusText = topFocusAreas.slice(0, 2).join(" and ");
    const strengthsText = topStrengths.slice(0, 2).join(" and ");
    if (focusText && strengthsText) {
      return `Based on the listed requirements and the time remaining today, focus on revising ${focusText} patterns and your strongest foundations in ${strengthsText}.`;
    }
    return `Based on today's schedule, spend your remaining time reviewing ${focusText || strengthsText || "core technical fundamentals"} and verifying your interview documents.`;
  }

  if (daysRemaining <= 3) {
    const focusText = topFocusAreas.slice(0, 2).join(" and ");
    return `Spend the next ${daysRemaining === 1 ? "24 hours" : `${daysRemaining} days`} practicing timed problem solving in ${focusText || "high-yield interview topics"} while reviewing your core technical strengths.`;
  }

  const focusText = topFocusAreas.slice(0, 2).join(" and ");
  return `Build a targeted roadmap for ${focusText || "core drive requirements"} and complete 2 mock technical interviews before the drive.`;
}

function generatePreparationPlan(
  ctx: GuidanceContext,
  topStrengths: string[],
  topFocusAreas: string[]
): PlacementPreparationPlan {
  const { activity } = ctx;
  const today = new Date();
  const todayDateStr = today.toISOString().slice(0, 10);
  const isToday = activity.date === todayDateStr;

  const activityDate = new Date(activity.date);
  const diffMs = activityDate.getTime() - today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const timeContext: "today" | "imminent" | "upcoming" = isToday
    ? "today"
    : daysRemaining <= 3
    ? "imminent"
    : "upcoming";

  const summary = isToday
    ? "Today is drive day. Strictly focus on rapid revision, algorithmic recall, and logistical readiness. Do not attempt to learn any large new framework today."
    : daysRemaining <= 3
    ? `Targeted sprint plan for the next ${daysRemaining === 1 ? "24 hours" : `${daysRemaining} days`}. Focus on high-frequency question patterns and mock interview practice.`
    : "Strategic preparation roadmap to master required technical topics and strengthen your placement profile.";

  // Skills to review
  const skillsToReview: PreparationPlanSkill[] = [];
  topStrengths.forEach((s) => {
    skillsToReview.push({
      skill: s,
      category: "Strength",
      guidance: isToday
        ? "Quickly review common syntax, standard library methods, and your best project examples."
        : "Maintain high speed with 2-3 medium difficulty coding problems.",
    });
  });

  topFocusAreas.forEach((f) => {
    skillsToReview.push({
      skill: f,
      category: "Prerequisite",
      guidance: isToday
        ? "Brush up high-level definitions, standard complexity, and common edge cases only. Avoid deep dives today."
        : "Dedicate 2 hours to practicing standard patterns and implementation syntax.",
    });
  });

  // Concept checkpoints tailored to role
  const isCloudOrNetwork =
    activity.role.toLowerCase().includes("cloud") ||
    activity.role.toLowerCase().includes("support") ||
    activity.requiredSkills.some((s) => {
      const l = s.toLowerCase();
      return l.includes("linux") || l.includes("network") || l.includes("aws");
    });

  const conceptCheckpoints: ConceptCheckpoint[] = isCloudOrNetwork
    ? [
        {
          topic: "OSI & TCP/IP Protocol Suite",
          keyTakeaway: "Know packet encapsulation, TCP 3-way handshake, UDP vs TCP differences, and DNS query resolution flow.",
        },
        {
          topic: "Linux CLI Troubleshooting & Administration",
          keyTakeaway: "Review essential diagnostic tools: top/htop, netstat, grep, chmod/chown, and systemctl status.",
        },
        {
          topic: "HTTP Status Codes & REST Architecture",
          keyTakeaway: "Understand status codes: 200, 201, 301, 400, 401 vs 403, 404, 500, 502, and stateless design.",
        },
        {
          topic: "Basic Cloud Services & Security Architecture",
          keyTakeaway: "Explain compute (EC2/VM), object storage (S3/Blob), and security groups vs network ACLs.",
        },
      ]
    : [
        {
          topic: "Arrays & HashMaps (Two-Pointer & Sliding Window)",
          keyTakeaway: "High-frequency in round 1 OA. Always check array bounds, empty inputs, and duplicate element handling.",
        },
        {
          topic: "Binary Trees & BST (Inorder, BFS/DFS, Heights)",
          keyTakeaway: "Standard interview topic. State your recursive base cases out loud and analyze space complexity for call stack.",
        },
        {
          topic: "SQL Queries & Relational Joins",
          keyTakeaway: "Review INNER vs LEFT JOIN, GROUP BY with HAVING, and the performance impact of indexing.",
        },
        {
          topic: "Object-Oriented Design & Clean Code",
          keyTakeaway: "Be ready to explain Polymorphism, Inheritance, and Encapsulation with a concrete project example.",
        },
      ];

  // Curated Practice Questions
  const practiceQuestions: PracticeQuestionItem[] = isCloudOrNetwork
    ? [
        {
          question: "Explain what happens step-by-step when you type google.com in a browser",
          category: "Networking & DNS",
          difficulty: "Medium",
        },
        {
          question: "How would you diagnose high CPU utilization and port conflicts on a Linux server?",
          category: "Operating Systems & Linux",
          difficulty: "Medium",
        },
        {
          question: "Explain the difference between horizontal and vertical scaling in cloud systems",
          category: "Cloud Architecture",
          difficulty: "Easy",
        },
      ]
    : [
        {
          question: "Two Sum & Subarray Sum Equals K (Frequency Map approach)",
          category: "DSA / Arrays & HashMaps",
          difficulty: "Medium",
        },
        {
          question: "Binary Tree Level Order Traversal & Validate BST",
          category: "Trees & Recursion",
          difficulty: "Medium",
        },
        {
          question: "Find 2nd Highest Salary & Department Top Earners using SQL",
          category: "Database & SQL",
          difficulty: "Medium",
        },
      ];

  // Documents & Equipment Checklist
  const isOnline =
    activity.venue.toLowerCase().includes("online") ||
    activity.venue.toLowerCase().includes("hackerrank") ||
    activity.venue.toLowerCase().includes("teams") ||
    activity.venue.toLowerCase().includes("meet");

  const documentsAndGear: DocumentOrGearItem[] = [
    {
      name: "College ID Card (Physical Original)",
      required: true,
      note: "Mandatory at registration and attendance verification desk.",
    },
    {
      name: "ATS-Formatted Resume (2 physical printouts)",
      required: true,
      note: "Updated with current CGPA, contact details, and listed skills.",
    },
    {
      name: "Government Photo ID (Aadhaar / Passport / Driving License)",
      required: true,
      note: "Required for company HR background verification.",
    },
    {
      name: "Laptop & Power Adapter (100% Charged)",
      required: activity.activityType.includes("Drive") || activity.activityType.includes("Assessment"),
      note: "Test Google Chrome, webcam, and proctoring permissions beforehand.",
    },
    {
      name: "Wired Headphones with Microphone",
      required: isOnline,
      note: "Low latency audio for interviews. Avoid Bluetooth battery drain.",
    },
  ];

  return {
    timeContext,
    summary,
    skillsToReview,
    conceptCheckpoints,
    practiceQuestions,
    documentsAndGear,
    officialRulesNotice:
      activity.instructions || "Report to the venue or online meeting link 15 minutes prior to the scheduled start time.",
  };
}

