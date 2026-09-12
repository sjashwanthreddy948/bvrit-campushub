/**
 * CampusHub TPO — Placement Intelligence AI Assistant
 * 
 * Provides natural-language answers to TPO officers based on live placement drives,
 * student registration turnouts across sections, and round milestones.
 */

import { getAllPlacementDrives, calculateTpoMetrics } from "./store";

export interface TpoAiResponse {
  query: string;
  answer: string;
  metrics?: Record<string, number | string>;
  suggestedQuestions: string[];
}

export function queryTpoAssistant(rawQuery: string): TpoAiResponse {
  const q = rawQuery.trim().toLowerCase();
  const drives = getAllPlacementDrives();
  const metrics = calculateTpoMetrics();

  // 1. Metrics & Overview Summary
  if (
    q.includes("overview") ||
    q.includes("metrics") ||
    q.includes("summary") ||
    q.includes("dashboard") ||
    q.includes("how many drives")
  ) {
    let text = `### 📊 Live TPO Placement Operations Summary\n\n`;
    text += `* **Active Drives:** **${metrics.activeDrives}** on-campus companies recruiting.\n`;
    text += `* **Deadlines This Week:** **${metrics.upcomingDeadlinesThisWeek}** drives closing registrations soon.\n`;
    text += `* **Eligible Student Pool:** **${metrics.totalEligibleStudents}** student-drive opportunities across 27 sections.\n`;
    text += `* **Students in Assessment Phase:** **${metrics.assessmentCount}** candidates taking online tests.\n`;
    text += `* **Interviews Scheduled This Week:** **${metrics.interviewsThisWeek}** candidates in Technical & HR rounds.\n`;
    text += `* **Final Selections Confirmed:** **${metrics.selectedCount}** verified campus offers issued.`;

    return {
      query: rawQuery,
      answer: text,
      suggestedQuestions: [
        "Which drives have deadlines this week?",
        "Status of Amazon placement drive",
        "How many students are in interview rounds?",
      ],
    };
  }

  // 2. Upcoming Deadlines This Week
  if (q.includes("deadline") || q.includes("due") || q.includes("closing")) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const urgent = drives.filter((d) => {
      if (!d.registrationDeadline) return false;
      const dl = new Date(d.registrationDeadline);
      return dl >= now && dl <= nextWeek;
    });

    let text = `### ⏰ Upcoming Drive Deadlines (Next 7 Days)\n\n`;
    if (urgent.length === 0) {
      text += `No drives have registration deadlines closing in the next 7 days.`;
    } else {
      urgent.forEach((d) => {
        text += `* **${d.company}** — *${d.role}*\n`;
        text += `  • **Deadline:** ${new Date(d.registrationDeadline).toLocaleDateString()} (${d.packageCtc})\n`;
        text += `  • **Status:** \`${d.status}\` | Eligible: ${d.eligibleDepartments.join(", ")}\n\n`;
      });
    }

    return {
      query: rawQuery,
      answer: text,
      suggestedQuestions: [
        "Status of Amazon placement drive",
        "Overview of all active drives",
      ],
    };
  }

  // 3. Specific Company Query (Amazon, JPMorgan, Qualcomm, Google, Cognizant)
  const matchedDrive = drives.find(
    (d) => q.includes(d.company.toLowerCase()) || q.includes(d.role.toLowerCase())
  );

  if (matchedDrive) {
    const currRound = matchedDrive.rounds[matchedDrive.currentRoundIndex] || matchedDrive.rounds[0];
    let text = `### 🏢 Placement Drive Status: ${matchedDrive.company}\n\n`;
    text += `* **Role:** ${matchedDrive.role}\n`;
    text += `* **Package / CTC:** **${matchedDrive.packageCtc}** ${matchedDrive.stipend ? `(Stipend: ${matchedDrive.stipend})` : ""}\n`;
    text += `* **Current Status:** \`${matchedDrive.status}\`\n`;
    text += `* **Current Round:** Round ${matchedDrive.currentRoundIndex + 1}: *${currRound.name}* (\`${currRound.status}\`)\n`;
    text += `* **Eligible Departments:** ${matchedDrive.eligibleDepartments.join(", ")}\n`;
    text += `* **Min CGPA Cutoff:** ${matchedDrive.minCgpa.toFixed(1)}\n`;
    text += `* **Registered Candidates:** ${matchedDrive.registeredStudentIds.length} students\n`;
    text += `* **Shortlisted in Current Round:** ${currRound.shortlistedCount} students\n\n`;

    text += `#### Stage Progress:\n`;
    matchedDrive.rounds.forEach((r) => {
      const icon = r.status === "Completed" ? "✅" : r.status === "In Progress" ? "🔄" : "⏳";
      text += `* ${icon} **Round ${r.roundNumber}:** ${r.name} — *${r.status}* (${r.shortlistedCount} candidates)\n`;
    });

    return {
      query: rawQuery,
      answer: text,
      suggestedQuestions: [
        "Which drives have deadlines this week?",
        "Overview of all active drives",
      ],
    };
  }

  // 4. Interviews & Assessments
  if (q.includes("interview") || q.includes("assessment") || q.includes("test")) {
    const interviewDrives = drives.filter(
      (d) => d.status === "Technical Interview" || d.status === "HR Interview" || d.status === "Online Assessment"
    );

    let text = `### 🎯 Active Assessments & Interview Rounds\n\n`;
    interviewDrives.forEach((d) => {
      const r = d.rounds[d.currentRoundIndex];
      text += `* **${d.company}** — *${d.role}*\n`;
      text += `  • **Stage:** \`${d.status}\` (${r?.name})\n`;
      text += `  • **Shortlisted Candidates:** ${r?.shortlistedCount || d.registeredStudentIds.length}\n`;
      text += `  • **Scheduled:** ${r?.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString() : "This week"}\n\n`;
    });

    return {
      query: rawQuery,
      answer: text,
      suggestedQuestions: [
        "Status of JPMorgan Chase & Co.",
        "Overview of all active drives",
      ],
    };
  }

  // Default response with suggested TPO prompts
  return {
    query: rawQuery,
    answer: `### 🤖 CampusHub TPO Placement Intelligence\n\nI can assist you with real-time drive statistics, stage progressions, section turnout rates, and student shortlisting.\n\nTry asking:\n* *"Overview of placement operations"* — Complete metrics snapshot.\n* *"Which drives have deadlines this week?"* — Registration urgency tracker.\n* *"Status of Amazon placement drive"* — Stage breakdown and shortlist numbers.\n* *"Show active interviews and assessments"* — Evaluates current candidate rounds.`,
    suggestedQuestions: [
      "Overview of placement operations",
      "Which drives have deadlines this week?",
      "Status of Amazon placement drive",
      "Show active interviews and assessments",
    ],
  };
}
