/**
 * WhatsApp Share & Reminder Utilities for CampusHub
 * STRICT POLICY:
 * - Generates clean, user-initiated WhatsApp share and reminder URLs.
 * - Formats high-clarity messages with emojis, bold headers, and direct links.
 * - Allows the faculty member or student to preview, copy, or launch WhatsApp.
 */

export interface OpportunityShareParams {
  title: string;
  company: string;
  type?: string;
  eligibility?: string;
  deadline?: string;
  stipend?: string | null;
  package?: string | null;
  location?: string;
  work_mode?: string;
  skills?: string[] | string;
  url?: string;
}

export interface CircularShareParams {
  title: string;
  deadline?: string | null;
  url?: string;
}

export interface AssignmentShareParams {
  title: string;
  subject_code?: string;
  subject_name?: string;
  faculty_name?: string;
  deadline?: string;
  max_marks?: number;
  description?: string;
  submissionUrl?: string;
  attachment_url?: string | null;
  campushubUrl?: string;
}

/**
 * Formats a clean date string for sharing
 */
export function formatShareDate(dateStr?: string | null): string {
  if (!dateStr) return "Not specified";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculates deadline urgency label for reminder text
 */
export function getDeadlineUrgencyLabel(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "⚠️ Overdue";
  if (diffDays === 0) return "🔴 Closing Today!";
  if (diffDays === 1) return "🟠 Due Tomorrow!";
  if (diffDays <= 3) return `🟡 Due in ${diffDays} days`;
  if (diffDays <= 7) return `🔵 Due in ${diffDays} days`;
  return `Due in ${diffDays} days`;
}

/**
 * Generate rich WhatsApp Reminder text for an Opportunity
 */
export function generateOpportunityReminderText(params: OpportunityShareParams): string {
  const typeLabel = params.type
    ? params.type.charAt(0).toUpperCase() + params.type.slice(1)
    : "Opportunity";

  const compensation = params.stipend || params.package;
  const locationInfo = params.location
    ? `${params.location}${params.work_mode ? ` (${params.work_mode})` : ""}`
    : params.work_mode || "";

  const skillsStr = Array.isArray(params.skills)
    ? params.skills.join(", ")
    : params.skills || "";

  const urgency = getDeadlineUrgencyLabel(params.deadline);
  const deadlineText = params.deadline
    ? `${formatShareDate(params.deadline)}${urgency ? ` — ${urgency}` : ""}`
    : "See details in link";

  const lines = [
    `📢 *CampusHub Reminder: Opportunity Deadline Alert!*`,
    ``,
    `💼 *${params.company}* — *${params.title}*`,
    `🏷️ *Type:* ${typeLabel}${locationInfo ? ` • ${locationInfo}` : ""}`,
  ];

  if (compensation) {
    lines.push(`💰 *Compensation:* ${compensation}`);
  }

  if (params.eligibility) {
    lines.push(`🎯 *Eligibility:* ${params.eligibility}`);
  }

  if (skillsStr) {
    lines.push(`🛠️ *Required Skills:* ${skillsStr}`);
  }

  lines.push(`⏰ *Application Deadline:* ${deadlineText}`);
  lines.push(``);
  lines.push(`🔗 *View Details & Apply via CampusHub:*`);
  lines.push(params.url || "https://campushub.edu/opportunities");
  lines.push(``);
  lines.push(`⚠️ *Action Required:* Please review the eligibility criteria and complete your application before the deadline!`);

  return lines.join("\n");
}

/**
 * Generate concise WhatsApp text for an Opportunity (backward compatibility)
 */
export function generateOpportunityShareText(params: OpportunityShareParams): string {
  return generateOpportunityReminderText(params);
}

/**
 * Generate rich WhatsApp Reminder text for an Assignment
 */
export function generateAssignmentReminderText(params: AssignmentShareParams): string {
  const subject = params.subject_code
    ? `${params.subject_code}${params.subject_name ? ` — ${params.subject_name}` : ""}`
    : params.subject_name || "Coursework";

  const urgency = getDeadlineUrgencyLabel(params.deadline);
  const deadlineText = params.deadline
    ? `${formatShareDate(params.deadline)}${urgency ? ` — ${urgency}` : ""}`
    : "See instructions";

  const lines = [
    `📚 *CampusHub Academic Reminder: Assignment Due!*`,
    ``,
    `📖 *Course:* ${subject}`,
    `📝 *Assignment:* *${params.title}*`,
  ];

  if (params.faculty_name) {
    lines.push(`👨‍🏫 *Instructor:* ${params.faculty_name}`);
  }

  if (params.max_marks) {
    lines.push(`🎯 *Max Marks:* ${params.max_marks} Marks`);
  }

  lines.push(`⏰ *Submission Deadline:* ${deadlineText}`);

  if (params.description) {
    const brief = params.description.length > 140
      ? params.description.slice(0, 137) + "..."
      : params.description;
    lines.push(``);
    lines.push(`📌 *Task Brief:* ${brief}`);
  }

  lines.push(``);
  lines.push(`🔗 *Submit on Vedic.ai:*`);
  lines.push(params.submissionUrl || "https://vedicai.student.edwisely.com/");

  if (params.attachment_url) {
    lines.push(``);
    lines.push(`📄 *Problem Sheet:* ${params.attachment_url}`);
  }

  lines.push(``);
  lines.push(`⚠️ *Action Required:* Ensure your submission is uploaded on Vedic.ai before the deadline to avoid late submission penalties!`);

  return lines.join("\n");
}

/**
 * Generate concise WhatsApp text for an Assignment Reminder (backward compatibility)
 */
export function generateAssignmentShareText(params: AssignmentShareParams): string {
  return generateAssignmentReminderText(params);
}

/**
 * Generate concise WhatsApp text for a Circular
 */
export function generateCircularShareText(params: CircularShareParams): string {
  const lines = [
    `📢 *CampusHub Notice: Official Circular*`,
    ``,
    `*${params.title}*`,
    ``,
    `⏰ *Date/Deadline:* ${params.deadline ? formatShareDate(params.deadline) : "As per official notice"}`,
    ``,
    `🔗 *View Official Notice:*`,
    params.url || "https://campushub.edu/circulars",
  ];

  return lines.join("\n");
}

/**
 * Constructs a universal WhatsApp Web & Mobile share intent URL
 * Tested on Android, iOS, Windows, and macOS (WhatsApp Desktop and WhatsApp Web).
 */
export function createWhatsAppShareUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  // wa.me format is the official standard supported universally
  return `https://wa.me/?text=${encoded}`;
}

export interface CoordinatorSectionReminderParams {
  opportunity: {
    id: string;
    title: string;
    company: string;
    type: string;
    deadline: string;
    daysRemaining: number;
    eligibility: string;
    stipend?: string | null;
    package?: string | null;
    work_mode?: string;
    location?: string;
  };
  sectionKey: string;
  breakdown: {
    appliedCount: number;
    notAppliedCount: number;
    totalStudents: number;
    participationRate: number;
  };
  origin?: string;
}

/**
 * Generate targeted WhatsApp Reminder text from Placement Coordinator for a specific Section & Opportunity
 */
export function buildCoordinatorSectionWhatsAppReminder(params: CoordinatorSectionReminderParams): string {
  const { opportunity, sectionKey, breakdown, origin = "https://campushub.edu" } = params;

  const typeLabel = opportunity.type.toUpperCase();
  const deadlineStr = new Date(opportunity.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const lines = [
    `📢 *Campus Placement Cell Notice*`,
    `To: *B.Tech Students & Class Representatives — ${sectionKey}*`,
    `🏛️ *BVRIT Training & Placement Cell (TPO)*`,
    ``,
    `💼 *${opportunity.company}* — *${opportunity.title}* (${typeLabel})`,
    `📍 *Work Mode:* ${opportunity.work_mode || "On-site"} (${opportunity.location || "Campus"})`,
  ];

  if (opportunity.stipend || opportunity.package) {
    lines.push(`💰 *Package / Stipend:* ${opportunity.stipend || opportunity.package}`);
  }

  lines.push(`🎯 *Eligibility:* ${opportunity.eligibility}`);
  lines.push(`⏰ *Application Deadline:* ${deadlineStr} (${opportunity.daysRemaining <= 1 ? "🚨 CLOSING TOMORROW!" : `In ${opportunity.daysRemaining} days`})`);
  lines.push(``);
  lines.push(`📊 *Section Participation Status (${sectionKey}):*`);
  lines.push(`• Applied / Registered: ${breakdown.appliedCount} students (${breakdown.participationRate}%)`);
  lines.push(`• ⚠️ Not Yet Applied: ${breakdown.notAppliedCount} students pending`);
  lines.push(``);
  lines.push(`⚠️ *URGENT INSTRUCTION FOR ${sectionKey}:*`);
  lines.push(`Class Representative (CR) of ${sectionKey}, please broadcast this to your class group immediately. Unapplied students must submit before the deadline.`);
  lines.push(``);
  lines.push(`🔗 *View Details & Submit Application:*`);
  lines.push(`${origin}/opportunities/${opportunity.id}`);
  lines.push(``);
  lines.push(`— Dr. Lakshmi, Training & Placement Officer (BVRIT Narsapur)`);

  return lines.join("\n");
}

export interface CoordinatorBroadcastReminderParams {
  opportunity: {
    id: string;
    title: string;
    company: string;
    type: string;
    deadline: string;
    daysRemaining: number;
    eligibility: string;
    stipend?: string | null;
    package?: string | null;
    work_mode?: string;
    location?: string;
  };
  totalEligible: number;
  totalApplied: number;
  totalNotApplied: number;
  overallParticipationRate: number;
  origin?: string;
}

/**
 * Generate broadcast WhatsApp Reminder text for ALL eligible sections and branches
 */
export function buildCoordinatorBroadcastWhatsAppReminder(params: CoordinatorBroadcastReminderParams): string {
  const {
    opportunity,
    totalEligible,
    totalApplied,
    totalNotApplied,
    overallParticipationRate,
    origin = "https://campushub.edu",
  } = params;

  const typeLabel = opportunity.type.toUpperCase();
  const deadlineStr = new Date(opportunity.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const lines = [
    `📢 *CAMPUS RECRUITMENT DRIVE ALERT*`,
    `To: *All Eligible Students & Class Representatives (CRs)*`,
    `🏛️ *BVRIT Training & Placement Cell (TPO)*`,
    ``,
    `💼 *${opportunity.company}* — *${opportunity.title}* (${typeLabel})`,
    `📍 *Work Mode:* ${opportunity.work_mode || "On-site"} (${opportunity.location || "Campus"})`,
  ];

  if (opportunity.stipend || opportunity.package) {
    lines.push(`💰 *Package / Stipend:* ${opportunity.stipend || opportunity.package}`);
  }

  lines.push(`🎯 *Eligible Branches:* CSE (A-I), CSM (A-C), CSD (A-B), AIDS (A-B), DS (A-B), ECE (A-C), EEE, MECH, CIVIL (A-C), PHE`);
  lines.push(`📋 *Eligibility Criteria:* ${opportunity.eligibility}`);
  lines.push(`⏰ *Application Deadline:* ${deadlineStr} (${opportunity.daysRemaining <= 1 ? "🚨 CLOSING TOMORROW!" : `In ${opportunity.daysRemaining} days`})`);
  lines.push(``);
  lines.push(`📊 *Campus-wide Participation Overview:*`);
  lines.push(`• Total Registered: ${totalApplied} / ${totalEligible} students (${overallParticipationRate}%)`);
  lines.push(`• Pending Applications: ${totalNotApplied} students yet to apply`);
  lines.push(``);
  lines.push(`⚠️ *INSTRUCTIONS FOR CLASS REPRESENTATIVES (CRs):*`);
  lines.push(`Please broadcast this message immediately to your respective class WhatsApp groups. All eligible unapplied candidates must finish registration before the portal closes.`);
  lines.push(``);
  lines.push(`🔗 *Official Registration & Job Description Link:*`);
  lines.push(`${origin}/opportunities/${opportunity.id}`);
  lines.push(``);
  lines.push(`— Dr. Lakshmi, Training & Placement Officer (BVRIT Narsapur)`);

  return lines.join("\n");
}
