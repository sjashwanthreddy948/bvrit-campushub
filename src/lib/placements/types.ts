/**
 * CampusHub — Today's Placement Activity Types & Contracts
 * 
 * Defines official company placement activities, multi-type scheduling,
 * deterministic student match evaluation, and preparation guidance.
 */

export type PlacementActivityType =
  | "Company Visit / Placement Drive"
  | "Registration Deadline"
  | "Online Assessment"
  | "Group Discussion"
  | "Technical Interview"
  | "HR Interview"
  | "Final Results"
  | "Pre-Placement Talk";

export const ALL_ACTIVITY_TYPES: PlacementActivityType[] = [
  "Company Visit / Placement Drive",
  "Registration Deadline",
  "Online Assessment",
  "Group Discussion",
  "Technical Interview",
  "HR Interview",
  "Final Results",
  "Pre-Placement Talk",
];

export type PlacementActivityStatus =
  | "Draft"
  | "Published"
  | "Updated"
  | "Cancelled"
  | "Completed";

export const ALL_ACTIVITY_STATUSES: PlacementActivityStatus[] = [
  "Draft",
  "Published",
  "Updated",
  "Cancelled",
  "Completed",
];

export interface PlacementActivity {
  id: string;
  // Company Information
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;

  // Opportunity Information
  role: string;
  employmentType: "Full-Time" | "Internship" | "Internship + PPO";
  packageCtc?: string; // e.g. "₹14.50 LPA"
  stipend?: string; // e.g. "₹65,000 / month"
  location: string;
  workMode: "On-site" | "Hybrid" | "Remote";

  // Official Eligibility Criteria
  eligibleDepartments: string[]; // e.g. ["CSE", "CSM", "CSD", "AIDS", "ECE"]
  eligibleYears: number[]; // e.g. [3, 4]
  minCgpa: number; // e.g. 7.5
  otherRequirements?: string;

  // Skills: Strictly separated
  requiredSkills: string[]; // Official required skills
  preferredSkills: string[]; // Official preferred skills
  importantPreparationSkills: string[]; // Preparation skills

  // Activity Schedule
  activityType: PlacementActivityType;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime?: string; // e.g. "01:00 PM"
  venue: string; // e.g. "Main Auditorium & Lab 3" or "Online"
  meetingLink?: string; // e.g. "https://meet.google.com/..."
  selectionRounds: string[]; // e.g. ["OA Test", "Tech Round 1", "HR Round"]
  instructions: string; // Official instructions from TPO
  attachments: Array<{ name: string; url: string }>;
  registrationLink?: string;
  driveId?: string; // Link to associated PlacementDrive if applicable

  // Management
  status: PlacementActivityStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PlacementMatchTier =
  | "Strong Match"
  | "Good Match"
  | "Partial Match"
  | "Requirements Not Fully Matched"
  | "Unable to Determine";

export interface StudentPlacementProfile {
  name: string;
  department?: string | null;
  year?: number | null;
  cgpa?: number | null;
  skills?: string[];
}

export interface PreparationPlanSkill {
  skill: string;
  category: "Strength" | "Prerequisite" | "Preferred";
  guidance: string;
}

export interface ConceptCheckpoint {
  topic: string;
  keyTakeaway: string;
}

export interface PracticeQuestionItem {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface DocumentOrGearItem {
  name: string;
  required: boolean;
  note: string;
}

export interface PlacementPreparationPlan {
  timeContext: "today" | "imminent" | "upcoming";
  summary: string;
  skillsToReview: PreparationPlanSkill[];
  conceptCheckpoints: ConceptCheckpoint[];
  practiceQuestions: PracticeQuestionItem[];
  documentsAndGear: DocumentOrGearItem[];
  officialRulesNotice: string;
}

export interface PlacementActivityMatch {
  tier: PlacementMatchTier;
  score: number; // 0 - 100 deterministic
  topStrengths: string[]; // Top 2-3 matching skills (e.g. ["Python", "SQL"])
  topFocusAreas: string[]; // Top 2-3 focus/missing skills (e.g. ["DSA", "OOP"])
  nextStepSuggestion: string; // Action-focused recommendation
  matchingRequirements: string[]; // e.g. ["✓ CSE department", "✓ 3rd year", "✓ Python", "✓ SQL"]
  missingInformation: string[]; // e.g. ["⚠ CGPA not found in profile"]
  unmatchedRequirements: string[]; // e.g. ["✕ Department EEE outside target branches"]
  areasToImprove: string[]; // e.g. ["Data Structures and Algorithms", "System Design"]
  preparationGuidance: string; // Mentor guidance tailored to activity type and timeline
  preparationPlan?: PlacementPreparationPlan; // Detailed structured plan for PREPARE ME view
  verifiedDisclaimer: string; // "Please verify official placement eligibility requirements before participating."
}

export interface PlacementActivityWithMatch extends PlacementActivity {
  match?: PlacementActivityMatch;
}

export interface TodaysPlacementAwarenessResult {
  todayActivities: PlacementActivityWithMatch[];
  nextUpcomingActivity: PlacementActivityWithMatch | null;
  totalTodayCount: number;
}

