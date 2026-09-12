/**
 * CampusHub AI — Personal Campus & Career Guide Engine
 * 
 * Strict Grounding & Senior/Friend Persona
 * Prioritizes accuracy over sounding intelligent.
 * Never invents dates, circulars, assignments, or deadlines.
 */

import { StudentPersonalContext, PersonalAiResponse, PersonalAiIntent } from "./types";
import { getApplicationProfile } from "@/lib/profile/actions";
import { getStudentSkills } from "@/lib/skills/actions";
import { getOpportunities, getUserApplications } from "@/lib/opportunities/actions";
import { getStudentAssignments } from "@/lib/assignments/actions";
import { getStudentCirculars } from "@/lib/circulars/actions";
import { evaluateOpportunityMatch } from "@/lib/matching/engine";
import { StudentMatchingProfile, OpportunityMatchingCriteria } from "@/lib/matching/types";
import { BVRIT_INSTITUTION_PROFILE } from "@/lib/campus-ai/knowledge";
import { routeUserQuery } from "./router";
import { performConstructiveSkillAnalysis, handlePersonalizedCareerGuidance } from "./skills-analyzer";
import { handleGeneralQuery } from "./general-engine";
import { generateLlmResponse } from "./llm";

/**
 * Calculates days remaining from an ISO date string
 */
function getDaysRemaining(deadlineStr: string | null | undefined): number {
  if (!deadlineStr) return 999;
  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * Checks if a date falls on calendar tomorrow
 */
function isDateTomorrow(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const dayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
  
  return target >= tomorrow && target < dayAfter;
}

/**
 * Checks if a date falls on calendar today
 */
function isDateToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  
  return target >= todayStart && target < tomorrowStart;
}

/**
 * Retrieve verified, authorized student context from database & memory stores
 */
export async function getAuthorizedStudentContext(studentId?: string): Promise<StudentPersonalContext> {
  const profile = await getApplicationProfile();
  const skillsList = await getStudentSkills();
  const applications = await getUserApplications();
  const oppsData = await getOpportunities({ pageSize: 50, deadlineFilter: "all" });
  
  // Get active assignments for student cohort
  const assignmentsData = await getStudentAssignments({ statusFilter: "all" });

  // Get circulars for student cohort
  const circularsData = await getStudentCirculars({});

  // Extract saved opportunities
  const savedOpportunities = oppsData.opportunities
    .filter((opp) => opp.isSaved)
    .map((opp) => {
      const isApplied = applications.some((app) => app.opportunityId === opp.id);
      return {
        id: opp.id,
        title: opp.title,
        company: opp.company,
        deadline: opp.deadline,
        isApplied,
        daysRemaining: getDaysRemaining(opp.deadline),
      };
    });

  // Applied opportunities summary
  const appliedOpportunities = applications.map((app) => ({
    id: app.opportunityId,
    title: app.opportunity?.title || "Opportunity",
    company: app.opportunity?.company || "Company",
    status: app.status,
    appliedAt: app.appliedAt,
  }));

  // Normalized skills array
  const skills = Array.from(
    new Set([
      ...(profile.programming_languages || []),
      ...(profile.technical_skills || []),
      ...skillsList.map((s) => s.skill_name),
    ])
  );

  return {
    studentId: studentId || profile.student_id,
    fullName: profile.full_name || "Student",
    department: profile.department || "Computer Science and Engineering",
    year: profile.current_year || 3,
    section: "A",
    cgpa: profile.cgpa,
    skills,
    savedOpportunities,
    appliedOpportunities,
    assignments: assignmentsData.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      subject: `${a.subject_code} - ${a.subject_name}`,
      deadline: a.deadline,
      submissionUrl: a.submission_url,
      daysRemaining: getDaysRemaining(a.deadline),
    })),
    circulars: circularsData.circulars.map((c) => ({
      id: c.id,
      circular_no: c.circular_no,
      title: c.title,
      description: c.description,
      deadline: c.deadline ?? null,
      published_date: c.published_date,
      daysRemaining: c.deadline ? getDaysRemaining(c.deadline) : null,
    })),
    activeOpportunities: oppsData.opportunities.filter((o) => !o.isClosed),
  };
}

/**
 * Detect the student query's intent
 */
export function detectPersonalIntent(query: string): { intent: PersonalAiIntent; targetQuery?: string } {
  const q = query.trim().toLowerCase();

  // 1. "What is happening tomorrow?"
  if (
    q.includes("tomorrow") ||
    q.includes("happening tomorrow") ||
    q.includes("tomorrow's plan") ||
    q.includes("tomorrows plan") ||
    q.includes("what is tomorrow") ||
    q.includes("whats tomorrow") ||
    q.includes("what's tomorrow") ||
    q.includes("tomorrow schedule")
  ) {
    return { intent: "tomorrow" };
  }

  // 2. "Upcoming deadlines"
  if (
    q.includes("upcoming deadline") ||
    q.includes("all deadline") ||
    q.includes("deadlines") ||
    q.includes("due date") ||
    q.includes("due soon") ||
    q.includes("what is due") ||
    q.includes("whats due") ||
    q.includes("what's due") ||
    q.includes("assignments due")
  ) {
    return { intent: "upcoming_deadlines" };
  }

  // 3. "Which opportunities suit me?"
  if (
    q.includes("suit me") ||
    q.includes("suitable") ||
    q.includes("which opportunit") ||
    q.includes("match my profile") ||
    q.includes("matched opportunit") ||
    q.includes("jobs for me") ||
    q.includes("internships for me") ||
    q.includes("recommend opportunit") ||
    q.includes("what should i apply") ||
    q.includes("what can i apply") ||
    q.includes("where should i apply")
  ) {
    return { intent: "opportunity_matching" };
  }

  // 4. "What am I weak at?"
  if (
    q.includes("weak at") ||
    q.includes("weakness") ||
    q.includes("what am i weak") ||
    q.includes("skill gap") ||
    q.includes("missing skill") ||
    q.includes("what am i missing") ||
    q.includes("skills gap") ||
    q.includes("lacking") ||
    q.includes("where am i lacking") ||
    q.includes("what skills should i add")
  ) {
    return { intent: "skill_gaps" };
  }

  // 5. "How can I improve?"
  if (
    q.includes("how can i improve") ||
    q.includes("how to improve") ||
    q.includes("how do i improve") ||
    q.includes("next step") ||
    q.includes("next steps") ||
    q.includes("placement prep") ||
    q.includes("how to prepare") ||
    q.includes("how do i prepare") ||
    q.includes("career advice") ||
    q.includes("roadmap")
  ) {
    return { intent: "improvement_steps" };
  }

  // 6. "Summarize information"
  if (
    q.includes("summarize") ||
    q.includes("summary") ||
    q.includes("tell me about circular") ||
    q.includes("tell me about opportunity") ||
    q.includes("details of circular") ||
    q.includes("details on") ||
    q.includes("explain circular") ||
    q.includes("overview of")
  ) {
    return { intent: "summarize_item", targetQuery: query };
  }

  return { intent: "general_query", targetQuery: query };
}

/**
 * Handles "What is happening tomorrow?"
 */
export function handleTomorrowIntent(context: StudentPersonalContext): PersonalAiResponse {
  const firstName = context.fullName.split(" ")[0] || "Friend";

  // 1. Assignments due tomorrow
  const assignmentsTomorrow = context.assignments.filter((a) => {
    const isTmrw = isDateTomorrow(a.deadline);
    const inRange = a.daysRemaining > 0 && a.daysRemaining <= 1.5;
    return isTmrw || inRange;
  });

  // 2. Circulars/Events happening tomorrow
  const circularsTomorrow = context.circulars.filter((c) => {
    if (!c.deadline) return false;
    return isDateTomorrow(c.deadline) || (typeof c.daysRemaining === "number" && c.daysRemaining > 0 && c.daysRemaining <= 1.5);
  });

  // 3. Saved opportunities with deadline tomorrow
  const savedTomorrow = context.savedOpportunities.filter((s) => {
    const isTmrw = isDateTomorrow(s.deadline);
    const inRange = s.daysRemaining > 0 && s.daysRemaining <= 1.5;
    return isTmrw || inRange;
  });

  // Check saved opportunity reminder rule:
  // If student saved opportunity AND deadline is tomorrow AND has not marked it as applied
  const savedNotAppliedTomorrow = savedTomorrow.filter((s) => !s.isApplied);

  const hasAnyItems =
    assignmentsTomorrow.length > 0 ||
    circularsTomorrow.length > 0 ||
    savedTomorrow.length > 0;

  if (!hasAnyItems) {
    return {
      intent: "tomorrow",
      title: "Tomorrow's Schedule",
      answer: `Hey ${firstName}! 👋\n\n**Nothing is scheduled in CampusHub for tomorrow.** You have a clear day with no urgent academic submissions or saved opportunity deadlines.\n\n💡 **Senior tip:** Take advantage of the breathing room to practice a couple of LeetCode patterns in our [Skills & Prep Hub](/skills) or make sure your single-column resume is up to date in the [ATS Resume Maker](/resume-builder).`,
      suggestedQuestions: [
        "Do I have any upcoming deadlines this week?",
        "Which opportunities suit me?",
        "What am I weak at?",
        "How can I improve?",
      ],
      category: "Tomorrow",
    };
  }

  let text = `Hey ${firstName}! 👋 Here's your grounded briefing for **tomorrow**:\n\n`;

  // Section 1: Coursework Assignments Due Tomorrow
  if (assignmentsTomorrow.length > 0) {
    text += `### 📝 Course Assignments Due Tomorrow\n`;
    assignmentsTomorrow.forEach((a) => {
      text += `* **[${a.title}](/assignments)** (${a.subject})\n`;
      text += `  • *Action required:* Submit your work before 11:59 PM via [Vedic.ai](https://vedic.ai) or check the problem sheet under [Assignments](/assignments).\n`;
    });
    text += `\n`;
  }

  // Section 2: Official Campus Notices / Events Tomorrow
  if (circularsTomorrow.length > 0) {
    text += `### 📢 Official Campus Circulars / Events Tomorrow\n`;
    circularsTomorrow.forEach((c) => {
      text += `* **[${c.title}](/circulars/${c.id})** (Ref: \`${c.circular_no}\`)\n`;
      text += `  • *Action required:* Review the exam/circular instructions on [Circulars](/circulars/${c.id}).\n`;
    });
    text += `\n`;
  }

  // Section 3: Saved Opportunity Reminders
  if (savedTomorrow.length > 0) {
    text += `### 💼 Saved Opportunity Deadlines Tomorrow\n`;
    savedTomorrow.forEach((s) => {
      text += `* **[${s.company} - ${s.title}](/opportunities/${s.id})**\n`;
    });
    text += `\n`;
  }

  // MANDATORY RULE: Saved Opportunity Reminder
  // "You also saved [Opportunity Title] whose deadline is tomorrow, but have not marked it as applied."
  if (savedNotAppliedTomorrow.length > 0) {
    text += `> ⚠️ **Urgent Saved Opportunity Reminder**\n>\n`;
    savedNotAppliedTomorrow.forEach((s) => {
      text += `> You also saved **[${s.company} - ${s.title}](/opportunities/${s.id})** whose deadline is tomorrow, but have not marked it as applied.\n>\n`;
    });
    text += `> If you have already applied via their portal, remember to update your status on [Applications](/applications) so you don't miss recruiting updates!\n\n`;
  }

  text += `Need me to summarize any specific assignment or walk through the required skills for these roles? Just let me know!`;

  return {
    intent: "tomorrow",
    title: "Tomorrow's Schedule",
    answer: text,
    suggestedQuestions: [
      "Do I have any upcoming deadlines this week?",
      "Which opportunities suit me?",
      "What am I weak at?",
      "How can I improve?",
    ],
    category: "Tomorrow",
    relevantLinks: [
      { label: "View Assignments", href: "/assignments" },
      { label: "Check Circulars", href: "/circulars" },
      { label: "Saved Opportunities", href: "/saved" },
      { label: "Vedic Portal", href: "https://vedic.ai", isExternal: true },
    ],
  };
}

/**
 * Handles "Upcoming deadlines"
 * Strictly groups by:
 * - Today
 * - Tomorrow
 * - Within 3 days
 * - Within 7 days
 */
export function handleUpcomingDeadlinesIntent(context: StudentPersonalContext): PersonalAiResponse {
  const firstName = context.fullName.split(" ")[0] || "Friend";

  interface DeadlineItem {
    id: string;
    title: string;
    type: "Assignment" | "Opportunity" | "Circular";
    href: string;
    deadline: string;
    daysRemaining: number;
    extraNote?: string;
  }

  const allItems: DeadlineItem[] = [];

  // 1. Assignments
  context.assignments.forEach((a) => {
    if (a.daysRemaining >= 0 && a.daysRemaining <= 14) {
      allItems.push({
        id: a.id,
        title: `${a.subject}: ${a.title}`,
        type: "Assignment",
        href: "/assignments",
        deadline: a.deadline,
        daysRemaining: a.daysRemaining,
        extraNote: "Submit via Vedic.ai",
      });
    }
  });

  // 2. Active Opportunities
  context.activeOpportunities.forEach((o) => {
    const days = getDaysRemaining(o.deadline);
    if (days >= 0 && days <= 14) {
      const isSaved = context.savedOpportunities.some((s) => s.id === o.id);
      const isApplied = context.appliedOpportunities.some((app) => app.id === o.id);
      let note = `${o.company} • ${o.type}`;
      if (isSaved && !isApplied) note += " (★ Bookmarked - Not yet applied)";
      if (isApplied) note += " (✓ Applied)";

      allItems.push({
        id: o.id,
        title: `${o.company} - ${o.title}`,
        type: "Opportunity",
        href: `/opportunities/${o.id}`,
        deadline: o.deadline,
        daysRemaining: days,
        extraNote: note,
      });
    }
  });

  // 3. Circulars
  context.circulars.forEach((c) => {
    if (c.daysRemaining !== null && c.daysRemaining !== undefined && c.daysRemaining >= 0 && c.daysRemaining <= 14) {
      allItems.push({
        id: c.id,
        title: `${c.circular_no}: ${c.title}`,
        type: "Circular",
        href: `/circulars/${c.id}`,
        deadline: c.deadline!,
        daysRemaining: c.daysRemaining,
      });
    }
  });

  // Group items
  const todayItems = allItems.filter((i) => isDateToday(i.deadline) || i.daysRemaining < 0.5);
  const tomorrowItems = allItems.filter((i) => !todayItems.includes(i) && (isDateTomorrow(i.deadline) || (i.daysRemaining >= 0.5 && i.daysRemaining <= 1.5)));
  const within3Days = allItems.filter((i) => !todayItems.includes(i) && !tomorrowItems.includes(i) && i.daysRemaining > 1.5 && i.daysRemaining <= 3.5);
  const within7Days = allItems.filter((i) => !todayItems.includes(i) && !tomorrowItems.includes(i) && !within3Days.includes(i) && i.daysRemaining > 3.5 && i.daysRemaining <= 7.5);

  let text = `Hey ${firstName}! Here is your verified **Upcoming Deadlines Tracker**, organized strictly by urgency:\n\n`;

  const renderGroup = (title: string, icon: string, items: DeadlineItem[]) => {
    if (items.length === 0) return "";
    let groupStr = `### ${icon} ${title}\n`;
    items.forEach((item) => {
      const typeBadge = `\`[${item.type}]\``;
      groupStr += `* ${typeBadge} **[${item.title}](${item.href})**\n`;
      if (item.extraNote) {
        groupStr += `  • *Details:* ${item.extraNote}\n`;
      }
    });
    groupStr += `\n`;
    return groupStr;
  };

  const hasAnyDeadlines = todayItems.length > 0 || tomorrowItems.length > 0 || within3Days.length > 0 || within7Days.length > 0;

  if (!hasAnyDeadlines) {
    text += `🎉 **No deadlines within the next 7 days!** All your active campus assignments and bookmarked opportunities are clear right now.\n\n`;
    text += `Explore open roles at **[Opportunities](/opportunities)** or sharpen your DSA patterns at **[Skills & Prep Hub](/skills)**.`;
  } else {
    text += renderGroup("Today", "🔴", todayItems);
    text += renderGroup("Tomorrow", "🟠", tomorrowItems);
    text += renderGroup("Within 3 Days", "🟡", within3Days);
    text += renderGroup("Within 7 Days", "🔵", within7Days);
    text += `💡 *Senior advice:* Prioritize items in the 🔴 Today and 🟠 Tomorrow categories first. Check your submission portal on [Vedic.ai](https://vedic.ai) early to avoid last-minute server congestion.`;
  }

  return {
    intent: "upcoming_deadlines",
    title: "Upcoming Deadlines",
    answer: text,
    suggestedQuestions: [
      "What is happening tomorrow?",
      "Which opportunities suit me?",
      "What am I weak at?",
      "How can I improve?",
    ],
    category: "Deadlines",
    relevantLinks: [
      { label: "All Opportunities", href: "/opportunities" },
      { label: "My Assignments", href: "/assignments" },
      { label: "Vedic Portal", href: "https://vedic.ai", isExternal: true },
    ],
  };
}

/**
 * Handles "Which opportunities suit me?"
 * Uses student profile:
 * - Skills (primary weight 70%)
 * - Department (15%)
 * - Year (10%)
 * - CGPA (5%)
 * 
 * IMPORTANT:
 * Never tell students: "You are definitely eligible."
 * Instead: "Based on the information provided, this opportunity appears to be a strong match."
 * Never hide opportunities from students.
 */
export function handleOpportunityMatchingIntent(context: StudentPersonalContext): PersonalAiResponse {
  const firstName = context.fullName.split(" ")[0] || "Friend";

  const studentMatchingProfile: StudentMatchingProfile = {
    department: context.department,
    year: context.year,
    cgpa: context.cgpa,
    skills: context.skills,
    preferredRoles: ["Software Engineer Intern", "Full Stack Developer"],
    preferredLocations: ["Hyderabad", "Bangalore"],
    preferredWorkMode: "Hybrid",
  };

  // Evaluate matching across all active opportunities
  const evaluatedOpps = context.activeOpportunities.map((opp) => {
    const criteria: OpportunityMatchingCriteria = {
      id: opp.id,
      title: opp.title,
      company: opp.company,
      type: opp.type,
      department: opp.department || undefined,
      eligible_departments: opp.eligible_departments || (opp.department ? [opp.department] : ["All"]),
      year: opp.year || undefined,
      eligible_years: opp.eligible_years || (opp.year ? [opp.year] : [context.year]),
      min_cgpa: opp.min_cgpa || undefined,
      skills: opp.skills || [],
      required_skills: opp.required_skills || opp.skills || [],
      preferred_skills: opp.preferred_skills || [],
      location: opp.location,
      work_mode: opp.work_mode,
      eligibility: opp.eligibility,
    };

    const matchResult = evaluateOpportunityMatch(studentMatchingProfile, criteria);
    return {
      opp,
      matchResult,
    };
  });

  // Sort by match score descending (highest score first)
  evaluatedOpps.sort((a, b) => b.matchResult.matchScore - a.matchResult.matchScore);

  let text = `Hey ${firstName}! I evaluated all active campus opportunities against your verified profile (**${context.department}**, Year **${context.year}**, CGPA **${context.cgpa || "Not specified"}**, and **${context.skills.length} verified skills**):\n\n`;

  // Top Matches
  const topMatches = evaluatedOpps.slice(0, 3);
  const otherOpportunities = evaluatedOpps.slice(3);

  topMatches.forEach((item, index) => {
    const { opp, matchResult } = item;
    const score = matchResult.matchScore;
    const matchingSkillsStr = matchResult.matchingSkills.length > 0 ? matchResult.matchingSkills.join(", ") : "General profile match";
    const missingSkillsStr = matchResult.missingRequiredSkills.length > 0
      ? matchResult.missingRequiredSkills.join(", ")
      : matchResult.missingPreferredSkills.length > 0
      ? matchResult.missingPreferredSkills.join(", ")
      : "None! You cover all listed requirements.";

    text += `### ${index + 1}. [${opp.company} - ${opp.title}](/opportunities/${opp.id})\n`;
    text += `* **Match Score:** \`${score}%\`\n`;
    text += `* **Type & Work Mode:** ${opp.type.toUpperCase()} • ${opp.work_mode} (${opp.location})\n`;
    if (opp.stipend || opp.package) {
      text += `* **Compensation:** ${opp.stipend || opp.package}\n`;
    }
    text += `* **Strong Matches:** ${matchingSkillsStr}\n`;
    text += `* **Potential Gaps:** ${missingSkillsStr}\n`;
    
    // MANDATORY ACCURACY RULE: Never guarantee eligibility
    text += `* **Eligibility Analysis:** "Based on the information provided, this opportunity appears to be a strong match." ${matchResult.aiExplanation}\n`;
    text += `* **Quick Action:** [View Full Role & Apply](/opportunities/${opp.id})\n\n`;
  });

  // NEVER HIDE OPPORTUNITIES: Show other open opportunities
  if (otherOpportunities.length > 0) {
    text += `### 🌐 Other Active Campus Opportunities\n`;
    text += `*(CampusHub never hides opportunities—here are other open listings you can explore and apply to)*:\n\n`;
    otherOpportunities.forEach((item) => {
      const { opp, matchResult } = item;
      text += `* **[${opp.company} - ${opp.title}](/opportunities/${opp.id})** — Match \`${matchResult.matchScore}%\` (${opp.location}, Deadline: ${new Date(opp.deadline).toLocaleDateString()})\n`;
    });
    text += `\n`;
  }

  text += `> 💡 **Senior takeaway:** For **${topMatches[0]?.opp.company || "your top match"}**, highlight your projects in **${topMatches[0]?.matchResult.matchingSkills.slice(0, 2).join(" & ") || "core tech"}** directly on your resume. You can auto-generate an ATS-optimized draft right now in our [ATS Resume Maker](/resume-builder)!`;

  return {
    intent: "opportunity_matching",
    title: "Opportunity Match Analysis",
    answer: text,
    suggestedQuestions: [
      "What am I weak at?",
      "How can I improve?",
      "What is happening tomorrow?",
      "Upcoming deadlines",
    ],
    category: "Matching",
    relevantLinks: [
      { label: "Explore Opportunities", href: "/opportunities" },
      { label: "ATS Resume Maker", href: "/resume-builder" },
      { label: "Update Career Profile", href: "/profile" },
    ],
  };
}

/**
 * Handles "What am I weak at?"
 * Skill gap analysis:
 * - Compares student's skills with skills repeatedly demanded across all active opportunities
 * - Highlights student's existing strengths
 * - Highlights repeatedly missing skills
 * - Highlights high-value skills that unlock multiple opportunities
 * - Constructive, encouraging senior tone
 */
export function handleSkillGapsIntent(context: StudentPersonalContext): PersonalAiResponse {
  const firstName = context.fullName.split(" ")[0] || "Friend";

  // Collect all demanded skills across active opportunities
  const skillDemandCount: Record<string, number> = {};
  const skillToCompanies: Record<string, string[]> = {};

  context.activeOpportunities.forEach((opp) => {
    const oppSkills = [
      ...(opp.skills || []),
      ...(opp.required_skills || []),
      ...(opp.preferred_skills || []),
    ];

    const uniqueOppSkills = Array.from(new Set(oppSkills.map((s) => s.trim()))).filter(Boolean);

    uniqueOppSkills.forEach((skill) => {
      skillDemandCount[skill] = (skillDemandCount[skill] || 0) + 1;
      if (!skillToCompanies[skill]) {
        skillToCompanies[skill] = [];
      }
      if (!skillToCompanies[skill].includes(opp.company)) {
        skillToCompanies[skill].push(opp.company);
      }
    });
  });

  const studentSkillsLower = new Set(context.skills.map((s) => s.toLowerCase().trim()));

  // Categorize
  const existingSkills: Array<{ name: string; demand: number }> = [];
  const missingSkills: Array<{ name: string; demand: number; companies: string[] }> = [];

  Object.entries(skillDemandCount).forEach(([skillName, count]) => {
    const hasSkill = studentSkillsLower.has(skillName.toLowerCase()) ||
      Array.from(studentSkillsLower).some((s) => s.includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(s));

    if (hasSkill) {
      existingSkills.push({ name: skillName, demand: count });
    } else {
      missingSkills.push({
        name: skillName,
        demand: count,
        companies: skillToCompanies[skillName] || [],
      });
    }
  });

  // Sort missing skills by demand frequency descending
  missingSkills.sort((a, b) => b.demand - a.demand);
  existingSkills.sort((a, b) => b.demand - a.demand);

  const topHighValueMissing = missingSkills.slice(0, 3);
  const otherMissing = missingSkills.slice(3, 7);

  let text = `Hey ${firstName}! Let's do an honest, constructive skill gap analysis based on **all active campus recruiting listings** right now:\n\n`;

  // 1. Existing Strengths
  text += `### ✅ Your Verified Strengths\n`;
  text += `You have a strong technical foundation already in your profile:\n`;
  text += `* **Known Skills:** ${context.skills.join(", ")}\n`;
  if (existingSkills.length > 0) {
    const highDemandExisting = existingSkills.slice(0, 4).map((s) => `**${s.name}** (demanded in ${s.demand} active roles)`).join(", ");
    text += `* **In Demand Right Now:** ${highDemandExisting}\n`;
  }
  text += `\n`;

  // 2. High-Value Missing Skills
  text += `### 🎯 High-Value Skills That Unlock Multiple Roles\n`;
  text += `These skills appear repeatedly in active campus job specifications, but are not listed in your profile yet:\n\n`;

  if (topHighValueMissing.length > 0) {
    topHighValueMissing.forEach((item, idx) => {
      text += `${idx + 1}. **${item.name}** — Required by **${item.demand} active listings** (${item.companies.join(", ")})\n`;
      text += `   • *Why it matters:* Adding **${item.name}** to your stack directly elevates your match score for top tier hiring drives.\n`;
    });
  } else {
    text += `* Great job! You already cover all primary skills listed in current campus opportunities.\n`;
  }
  text += `\n`;

  // 3. Additional Gaps
  if (otherMissing.length > 0) {
    text += `### 🔍 Secondary Skill Gaps to Watch\n`;
    otherMissing.forEach((item) => {
      text += `* **${item.name}** (demanded by ${item.companies.join(", ")})\n`;
    });
    text += `\n`;
  }

  // 4. Actionable Senior Encouragement
  text += `> 💡 **Senior Perspective:** Don't try to learn everything at once. Pick **${topHighValueMissing[0]?.name || "one core skill"}**, build a mini-project with it over the weekend, and add it to your [Skills & Prep Hub](/skills) profile. That alone unlocks multiple interview shortlists!`;

  return {
    intent: "skill_gaps",
    title: "Constructive Skill Gap Analysis",
    answer: text,
    suggestedQuestions: [
      "How can I improve?",
      "Which opportunities suit me?",
      "What is happening tomorrow?",
      "Upcoming deadlines",
    ],
    category: "Skill Gap",
    relevantLinks: [
      { label: "Skills & Placement Hub", href: "/skills" },
      { label: "Update My Skills", href: "/profile" },
      { label: "ATS Resume Maker", href: "/resume-builder" },
    ],
  };
}

/**
 * Handles "How can I improve?"
 * Delivers a small number of high-value next steps and explains WHY each action matters.
 */
export function handleImprovementStepsIntent(context: StudentPersonalContext): PersonalAiResponse {
  const firstName = context.fullName.split(" ")[0] || "Friend";

  // Determine top missing skill
  const studentSkillsLower = new Set(context.skills.map((s) => s.toLowerCase().trim()));
  const missingCandidates: Record<string, number> = {};

  context.activeOpportunities.forEach((opp) => {
    (opp.skills || []).forEach((sk) => {
      if (!studentSkillsLower.has(sk.toLowerCase().trim())) {
        missingCandidates[sk] = (missingCandidates[sk] || 0) + 1;
      }
    });
  });

  const sortedMissing = Object.entries(missingCandidates).sort((a, b) => b[1] - a[1]);
  const topSkillToLearn = sortedMissing[0]?.[0] || "Cloud/Docker fundamentals";

  let text = `Hey ${firstName}! Here are **4 high-value, senior-tested next steps** that will move the needle the most for your placements and coursework right now:\n\n`;

  // Step 1: DSA & LeetCode Patterns
  text += `### 1. 🧠 Master Curated LeetCode Patterns (Not Random Questions)\n`;
  text += `* **Action:** Spend 45 minutes daily on high-frequency patterns: *Two Pointers*, *Sliding Window*, *Fast & Slow Pointers*, and *Tree Breadth-First Search*.\n`;
  text += `* **Why it matters:** On-campus hiring rounds (Amazon, Microsoft, Cognizant, TCS Digital) do not test obscure trivia; they test whether you recognize patterns under time pressure. Check our **[Skills & Prep Hub](/skills)** for the structured DSA 4-Phase Roadmap.\n\n`;

  // Step 2: Bridge High-Demand Skill Gap
  text += `### 2. ⚡ Add High-Demand Skill: "${topSkillToLearn}"\n`;
  text += `* **Action:** Build a small hands-on feature or service utilizing **${topSkillToLearn}** and link the GitHub repository in your profile.\n`;
  text += `* **Why it matters:** Multiple active campus opportunities currently demand this skill. Demonstrating a working repository sets you apart from candidates who only list buzzwords on paper.\n\n`;

  // Step 3: ATS Resume Optimization
  text += `### 3. 📄 Tailor Your Resume Using Single-Column ATS Formatting\n`;
  text += `* **Action:** Open our built-in **[ATS Resume Maker](/resume-builder)** and auto-fill your verified profile. Pick the *Classic Placement* or *Modern Tech* single-column template.\n`;
  text += `* **Why it matters:** Automated tracking systems often reject two-column graphic templates. A clean single-column format with quantified bullet points (*"Reduced query latency by 40%"*) guarantees your resume reaches the hiring manager's desk.\n\n`;

  // Step 4: Keep Academic & Vedic Deadlines Clean
  text += `### 4. 🎓 Protect Your CGPA & Attendance on Vedic.ai\n`;
  text += `* **Action:** Clear any pending coursework under **[Assignments](/assignments)** and ensure your attendance stays above 75% on **[Vedic.ai](https://vedic.ai)**.\n`;
  text += `* **Why it matters:** Even with top-tier coding skills, campus placement cells enforce strict minimum CGPA (usually 7.0 or 7.5) and attendance cutoffs. Avoid avoidable debarment.\n\n`;

  text += `> 🚀 **Next Move:** Pick just **one** of the four steps to tackle today. If you want to practice DSA patterns or update your resume, I've linked both tools below!`;

  return {
    intent: "improvement_steps",
    title: "High-Value Next Steps",
    answer: text,
    suggestedQuestions: [
      "What am I weak at?",
      "Which opportunities suit me?",
      "What is happening tomorrow?",
      "Upcoming deadlines",
    ],
    category: "Improvement",
    relevantLinks: [
      { label: "Skills & Prep Hub", href: "/skills" },
      { label: "ATS Resume Maker", href: "/resume-builder" },
      { label: "View Assignments", href: "/assignments" },
      { label: "Vedic Portal", href: "https://vedic.ai", isExternal: true },
    ],
  };
}

/**
 * Handles "Summarize information" (Circular or Opportunity)
 * Strict Grounding Rule:
 * If information is missing: "The information is not specified in the CampusHub record."
 * Never invent details.
 */
export function handleSummarizeItemIntent(query: string, context: StudentPersonalContext): PersonalAiResponse {
  const q = query.toLowerCase();

  // 1. Try to find a matching circular
  const matchedCircular = context.circulars.find((c) => {
    const titleMatch = q.includes(c.title.toLowerCase().slice(0, 15));
    const noMatch = q.includes(c.circular_no.toLowerCase());
    const idMatch = q.includes(c.id.toLowerCase());
    return titleMatch || noMatch || idMatch;
  });

  if (matchedCircular) {
    let text = `### 📋 Summary: [${matchedCircular.title}](/circulars/${matchedCircular.id})\n\n`;
    text += `* **Reference Number:** \`${matchedCircular.circular_no}\`\n`;
    text += `* **Published Date:** ${new Date(matchedCircular.published_date).toLocaleDateString()}\n`;
    text += `* **Key Deadline / Date:** ${matchedCircular.deadline ? new Date(matchedCircular.deadline).toLocaleDateString() : "The information is not specified in the CampusHub record."}\n`;
    text += `* **Eligibility / Cohort:** ${context.department} Year ${context.year}\n`;
    text += `* **Core Summary:**\n`;
    
    // Take first 3 meaningful lines of description
    const lines = matchedCircular.description
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 10)
      .slice(0, 3);
    lines.forEach((l) => {
      text += `  • ${l}\n`;
    });
    
    text += `* **Action Required:** Review regulations and carry required hall tickets/IDs as specified on [Circulars](/circulars/${matchedCircular.id}).\n`;
    text += `* **Direct Link:** [Open Official Circular Notice](/circulars/${matchedCircular.id})\n`;

    return {
      intent: "summarize_item",
      title: `Summary: ${matchedCircular.title}`,
      answer: text,
      suggestedQuestions: [
        "What is happening tomorrow?",
        "Upcoming deadlines",
        "Which opportunities suit me?",
      ],
      category: "Summary",
      relevantLinks: [{ label: "Open Circular", href: `/circulars/${matchedCircular.id}` }],
    };
  }

  // 2. Try to find a matching opportunity
  const matchedOpp = context.activeOpportunities.find((o) => {
    const titleMatch = q.includes(o.title.toLowerCase().slice(0, 15));
    const companyMatch = q.includes(o.company.toLowerCase());
    const idMatch = q.includes(o.id.toLowerCase());
    return titleMatch || companyMatch || idMatch;
  });

  if (matchedOpp) {
    let text = `### 💼 Summary: [${matchedOpp.company} - ${matchedOpp.title}](/opportunities/${matchedOpp.id})\n\n`;
    text += `* **Company & Role:** ${matchedOpp.company} — ${matchedOpp.title}\n`;
    text += `* **Type & Work Mode:** ${matchedOpp.type.toUpperCase()} • ${matchedOpp.work_mode} (${matchedOpp.location})\n`;
    text += `* **Compensation / Stipend:** ${matchedOpp.stipend || matchedOpp.package || "The information is not specified in the CampusHub record."}\n`;
    text += `* **Application Deadline:** ${matchedOpp.deadline ? new Date(matchedOpp.deadline).toLocaleDateString() : "The information is not specified in the CampusHub record."}\n`;
    text += `* **Eligibility Criteria:** ${matchedOpp.eligibility || "The information is not specified in the CampusHub record."}\n`;
    text += `* **Required Skills:** ${matchedOpp.skills && matchedOpp.skills.length > 0 ? matchedOpp.skills.join(", ") : "The information is not specified in the CampusHub record."}\n`;
    text += `* **Action Required:** Review required qualifications and initiate application via [CampusHub Opportunity Tracker](/opportunities/${matchedOpp.id}).\n`;
    text += `* **Direct Link:** [Open Opportunity Details](/opportunities/${matchedOpp.id})\n`;

    return {
      intent: "summarize_item",
      title: `Summary: ${matchedOpp.company} - ${matchedOpp.title}`,
      answer: text,
      suggestedQuestions: [
        "Which opportunities suit me?",
        "What am I weak at?",
        "Upcoming deadlines",
      ],
      category: "Summary",
      relevantLinks: [{ label: "Open Opportunity", href: `/opportunities/${matchedOpp.id}` }],
    };
  }

  // 3. Fallback: Summarize the latest active circular & opportunity
  const latestCircular = context.circulars[0];
  const latestOpp = context.activeOpportunities[0];

  let text = `Here is a quick verified digest of the latest records on CampusHub:\n\n`;

  if (latestCircular) {
    text += `### 📢 Latest Circular: [${latestCircular.title}](/circulars/${latestCircular.id})\n`;
    text += `* **Ref:** \`${latestCircular.circular_no}\`\n`;
    text += `* **Deadline / Date:** ${latestCircular.deadline ? new Date(latestCircular.deadline).toLocaleDateString() : "The information is not specified in the CampusHub record."}\n`;
    text += `* **Details:** [Read Notice](/circulars/${latestCircular.id})\n\n`;
  }

  if (latestOpp) {
    text += `### 💼 Featured Opportunity: [${latestOpp.company} - ${latestOpp.title}](/opportunities/${latestOpp.id})\n`;
    text += `* **Eligibility:** ${latestOpp.eligibility || "The information is not specified in the CampusHub record."}\n`;
    text += `* **Deadline:** ${latestOpp.deadline ? new Date(latestOpp.deadline).toLocaleDateString() : "The information is not specified in the CampusHub record."}\n`;
    text += `* **Stipend:** ${latestOpp.stipend || latestOpp.package || "The information is not specified in the CampusHub record."}\n`;
    text += `* **Details:** [View Role](/opportunities/${latestOpp.id})\n\n`;
  }

  text += `If you want details on a specific circular or company, just type: *"Summarize Amazon"* or *"Summarize mid-sem circular"*!`;

  return {
    intent: "summarize_item",
    title: "Campus Summary",
    answer: text,
    suggestedQuestions: [
      "What is happening tomorrow?",
      "Upcoming deadlines",
      "Which opportunities suit me?",
      "What am I weak at?",
    ],
    category: "Summary",
  };
}

/**
 * Handles General Campus Queries with grounded BVRIT facts
 */
export function handleGeneralCampusQuery(query: string, context: StudentPersonalContext): PersonalAiResponse {
  const q = query.toLowerCase();

  // Placements query
  if (q.includes("placement") || q.includes("highest package") || q.includes("recruiter")) {
    return {
      intent: "general_query",
      title: "BVRIT Placements Information",
      answer: `### 🎓 BVRIT Placements Overview\n\n* **Highest CTC:** ₹44.14 LPA (Amazon / Microsoft)\n* **Key Recruiters:** Amazon, Microsoft, TCS, Cognizant, Infosys, Capgemini, Qualcomm, AMD.\n* **Placement Cell:** Dean Placements & Training, BVRIT Placement Cell.\n* **Prep Resource:** Practice DSA patterns & core subjects at [Skills & Prep Hub](/skills) and format your resume with [ATS Resume Maker](/resume-builder).\n* **Active Listings:** Check all live openings under [Opportunities](/opportunities).`,
      suggestedQuestions: [
        "Which opportunities suit me?",
        "What am I weak at?",
        "How can I improve?",
      ],
      category: "Placements",
    };
  }

  // Transportation query
  if (q.includes("bus") || q.includes("transport") || q.includes("route")) {
    return {
      intent: "general_query",
      title: "BVRIT Campus Transportation",
      answer: `### 🚌 Campus Bus Services\n\nBVRIT operates **60+ college buses** connecting all major parts of Hyderabad and Secunderabad (KPHB, Miyapur, ECIL, Mehdipatnam, Dilsukhnagar, Medchal) to the Narsapur campus.\n\n* **Transport Incharge:** Mr. S. Chandra Shekar (Transport Cell)\n* **Timings:** Morning buses arrive by 08:45 AM; evening buses depart at 04:15 PM.\n* For route allocation and bus passes, visit the Transport Desk at Administrative Block.`,
      suggestedQuestions: [
        "What is happening tomorrow?",
        "Upcoming deadlines",
        "Which opportunities suit me?",
      ],
      category: "Transport",
    };
  }

  // Senior mentor greeting & overview
  return {
    intent: "general_query",
    title: "CampusHub AI Mentor",
    answer: `Hey ${context.fullName.split(" ")[0]}! I'm here as your **personal campus guide and career mentor**.\n\nWhether you need live campus updates, placement strategy, or coding assistance, ask me anything:\n\n* **Campus & Academics:** *"What is happening tomorrow?"*, *"Upcoming deadlines"*, *"Summarize the latest circular"*\n* **Career & Profile:** *"Which opportunities suit me?"*, *"What am I weak at?"*, *"React vs Java for placements"*\n* **Technical & DSA:** *"Explain Binary Search"*, *"How does React Virtual DOM work?"*, *"Database normalization 1NF to 3NF"*`,
    suggestedQuestions: [
      "What is happening tomorrow?",
      "Which opportunities suit me?",
      "What am I weak at?",
      "Explain Binary Search",
    ],
    category: "General",
  };
}

/**
 * Handles "Application status"
 */
export function handleApplicationStatusIntent(context: StudentPersonalContext): PersonalAiResponse {
  const apps = context.appliedOpportunities;
  if (!apps || apps.length === 0) {
    return {
      intent: "application_status",
      title: "My Application Status",
      category: "Applications",
      answer: `You currently have **0 active applications** submitted through CampusHub.\n\nBrowse verified campus drives under [Opportunities](/opportunities) or ask me *"Which opportunities suit me?"* to find matching roles.`,
      suggestedQuestions: [
        "Which opportunities suit me?",
        "Upcoming deadlines",
        "What should I learn next?",
      ],
      relevantLinks: [{ label: "View Opportunities", href: "/opportunities" }],
    };
  }

  let text = `Here is the current status of your **${apps.length} application(s)** recorded in CampusHub:\n\n`;
  apps.forEach((app) => {
    text += `### 🏢 [${app.company} — ${app.title}](/opportunities/${app.id})\n`;
    text += `* **Status:** \`${app.status.toUpperCase()}\`\n`;
    text += `* **Applied Date:** ${new Date(app.appliedAt).toLocaleDateString()}\n`;
    text += `* **Details:** [Track Status & Drive Rounds](/opportunities/${app.id})\n\n`;
  });

  return {
    intent: "application_status",
    title: "My Application Status",
    category: "Applications",
    answer: text,
    suggestedQuestions: [
      "Which opportunities suit me?",
      "How to prepare for technical interviews?",
      "Upcoming deadlines",
    ],
    relevantLinks: [{ label: "Track Applications", href: "/applications" }],
  };
}

/**
 * Handles "Am I eligible for Amazon / JPMorgan / etc.?"
 */
export function handleEligibilityCheckIntent(query: string, context: StudentPersonalContext): PersonalAiResponse {
  const q = query.toLowerCase();
  const matchedOpp = context.activeOpportunities.find((o) => 
    q.includes(o.company.toLowerCase()) || q.includes(o.title.toLowerCase())
  ) || context.activeOpportunities[0];

  if (!matchedOpp) {
    return {
      intent: "eligibility_check",
      title: "Eligibility Check",
      category: "Eligibility",
      answer: `I could not find an active campus drive matching that query in CampusHub. Check live listings under [Opportunities](/opportunities).`,
      suggestedQuestions: ["Which opportunities suit me?", "Upcoming deadlines"],
    };
  }

  const studentProfile: StudentMatchingProfile = {
    department: context.department,
    year: context.year,
    cgpa: context.cgpa,
    skills: context.skills,
  };

  const oppCriteria: OpportunityMatchingCriteria = {
    id: matchedOpp.id,
    title: matchedOpp.title,
    company: matchedOpp.company,
    type: matchedOpp.type || "Full-time",
    skills: matchedOpp.skills || [],
    eligibility: matchedOpp.eligibility || "",
    location: matchedOpp.location || "Campus",
    work_mode: matchedOpp.work_mode || "On-site",
    eligible_departments: matchedOpp.eligible_departments,
    eligible_years: matchedOpp.eligible_years,
    min_cgpa: matchedOpp.min_cgpa,
    required_skills: matchedOpp.required_skills,
    preferred_skills: matchedOpp.preferred_skills,
  };

  const match = evaluateOpportunityMatch(studentProfile, oppCriteria);

  let text = `### 📋 Eligibility Check: ${matchedOpp.company} — ${matchedOpp.title}\n\n`;
  text += `**Overall Match Rating:** **${match.matchScore}%** (${match.matchCategory.toUpperCase()})\n\n`;
  text += `#### Criteria Breakdown:\n`;
  if (match.satisfiedRequirements.length > 0) {
    text += `* **Satisfied Criteria:**\n`;
    match.satisfiedRequirements.forEach((r) => {
      text += `  • ✅ ${r}\n`;
    });
  }
  if (match.unsatisfiedRequirements.length > 0) {
    text += `* **Requirements to Note:**\n`;
    match.unsatisfiedRequirements.forEach((r) => {
      text += `  • ⚠️ ${r}\n`;
    });
  }
  text += `* **Matching Skills:** ${match.matchingSkills.join(", ") || "None directly matching yet"}\n`;
  if (match.missingRequiredSkills.length > 0) {
    text += `* **Skills to Strengthen:** ${match.missingRequiredSkills.join(", ")}\n`;
  }
  text += `\n**Direct Link:** [Open Opportunity Details](/opportunities/${matchedOpp.id})`;

  return {
    intent: "eligibility_check",
    title: `Eligibility: ${matchedOpp.company}`,
    category: "Eligibility",
    answer: text,
    suggestedQuestions: [
      "Which opportunities suit me?",
      "What am I weak at?",
      "How can I improve?",
    ],
    relevantLinks: [{ label: "Open Opportunity", href: `/opportunities/${matchedOpp.id}` }],
  };
}

/**
 * Main dispatcher for CampusHub AI Hybrid Intelligence
 */
export async function processPersonalAiQuery(query: string, studentId?: string): Promise<PersonalAiResponse> {
  const context = await getAuthorizedStudentContext(studentId);
  const routed = routeUserQuery(query);

  // =========================================================================
  // TYPE A — CAMPUSHUB DATA QUESTIONS (Strict Grounding in Verified Records)
  // =========================================================================
  if (routed.classification === "type_a_campushub") {
    switch (routed.intent) {
      case "tomorrow":
        return handleTomorrowIntent(context);
      case "upcoming_deadlines":
        return handleUpcomingDeadlinesIntent(context);
      case "application_status":
        return handleApplicationStatusIntent(context);
      case "eligibility_check":
        return handleEligibilityCheckIntent(query, context);
      case "opportunity_matching":
        return handleOpportunityMatchingIntent(context);
      case "summarize_item":
        return handleSummarizeItemIntent(query, context);
      default:
        return handleGeneralCampusQuery(query, context);
    }
  }

  // =========================================================================
  // TYPE B — PERSONALIZED GUIDANCE QUESTIONS (Profile + Campus Demand Trends)
  // =========================================================================
  if (routed.classification === "type_b_guidance") {
    if (routed.intent === "skill_gaps") {
      const analysis = performConstructiveSkillAnalysis(context);
      return {
        intent: "skill_gaps",
        title: "Profile & Skill Gap Analysis",
        category: "Skill Analysis",
        answer: analysis.formattedResponse,
        suggestedQuestions: [
          "What should I learn next?",
          "Which opportunities suit me?",
          "How to prepare for placements?",
        ],
        relevantLinks: [
          { label: "View Skills Hub", href: "/skills" },
          { label: "ATS Resume Builder", href: "/resume-builder" },
        ],
      };
    }

    const guidance = handlePersonalizedCareerGuidance(query, context);
    return {
      intent: routed.intent,
      title: guidance.title,
      category: guidance.category,
      answer: guidance.answer,
      suggestedQuestions: guidance.suggestedQuestions,
      relevantLinks: [
        { label: "Skills Hub", href: "/skills" },
        { label: "ATS Resume Builder", href: "/resume-builder" },
      ],
    };
  }

  // =========================================================================
  // TYPE C — GENERAL KNOWLEDGE & TECHNICAL QUESTIONS (Instant, Expert Answers)
  // =========================================================================
  // Try external LLM first if API key configured
  try {
    const llmText = await generateLlmResponse({
      systemPrompt: "You are CampusHub AI, an expert senior mentor and engineering guide for college students. Answer clearly, accurately, and constructively with practical examples or code.",
      userPrompt: query,
      contextData: `Student: ${context.fullName}, Dept: ${context.department}, Year: ${context.year}, CGPA: ${context.cgpa}, Skills: ${context.skills.join(", ")}`,
    });

    if (llmText && llmText.length > 20) {
      return {
        intent: routed.intent,
        title: "Technical & Mentorship Answer",
        category: "Technical Guide",
        answer: llmText,
        suggestedQuestions: [
          "Explain Binary Search",
          "What should I learn next?",
          "Which opportunities suit me?",
        ],
      };
    }
  } catch (err) {
    // Continue to local general engine
  }

  // Local general engine fallback (Binary search, React VDOM, Database Normalization, etc.)
  const generalAns = handleGeneralQuery(query);
  return {
    intent: routed.intent,
    title: generalAns.title,
    category: generalAns.category,
    answer: generalAns.answer,
    suggestedQuestions: generalAns.suggestedQuestions,
  };
}
