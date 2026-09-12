/**
 * CampusHub TPO — Placement Drive Management Types
 * 
 * Includes 11 drive lifecycle statuses, multi-round stage tracking,
 * 4-tier student eligibility criteria, and dashboard analytics contracts.
 */

export type DriveStatus =
  | "Draft"
  | "Upcoming"
  | "Registration Open"
  | "Registration Closed"
  | "Shortlisting"
  | "Online Assessment"
  | "Technical Interview"
  | "HR Interview"
  | "Results Announced"
  | "Completed"
  | "Cancelled";

export const ALL_DRIVE_STATUSES: DriveStatus[] = [
  "Draft",
  "Upcoming",
  "Registration Open",
  "Registration Closed",
  "Shortlisting",
  "Online Assessment",
  "Technical Interview",
  "HR Interview",
  "Results Announced",
  "Completed",
  "Cancelled",
];

export type RoundStatus = "Upcoming" | "In Progress" | "Completed";

export interface DriveRound {
  id: string;
  roundNumber: number;
  name: string; // e.g. "Registration", "Online Assessment", "Technical Interview Round 1", "HR Interview", "Final Selection"
  scheduledAt?: string;
  locationOrLink?: string;
  instructions?: string;
  status: RoundStatus;
  shortlistedCount: number;
  shortlistedStudentIds: string[];
}

export interface PlacementDrive {
  id: string;
  company: string;
  logoUrl?: string;
  role: string;
  packageCtc: string; // e.g. "₹44.14 LPA"
  stipend?: string; // e.g. "₹80,000 / month"
  eligibleDepartments: string[]; // e.g. ["CSE", "CSM", "CSD", "AIDS", "ECE"]
  eligibleYears: number[]; // e.g. [3, 4]
  minCgpa: number; // e.g. 7.5
  requiredSkills: string[];
  preferredSkills: string[];
  location: string;
  workMode: "On-site" | "Hybrid" | "Remote";
  registrationDeadline: string;
  driveDate?: string;
  attachments: Array<{ name: string; url: string }>;
  status: DriveStatus;
  currentRoundIndex: number;
  rounds: DriveRound[];
  totalEligibleStudents: number;
  registeredStudentIds: string[];
  selectedStudentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type MatchTier =
  | "Strong Match"
  | "Potential Match"
  | "Requirements Not Fully Matched"
  | "Unable to Determine";

export interface StudentMatchEvaluation {
  tier: MatchTier;
  score: number; // 0 - 100
  criteriaBreakdown: {
    departmentMatch: boolean;
    yearMatch: boolean;
    cgpaMatch: boolean;
    skillsMatchPercentage: number;
  };
  matchingSkills: string[];
  missingSkills: string[];
  explanation: string;
  recommendations: string[];
}

export interface TpoDashboardMetrics {
  activeDrives: number;
  upcomingDeadlinesThisWeek: number;
  totalEligibleStudents: number;
  registeredStudents: number;
  assessmentCount: number;
  interviewsThisWeek: number;
  selectedCount: number;
}

export interface StudentDriveStageView {
  driveId: string;
  company: string;
  role: string;
  packageCtc: string;
  driveStatus: DriveStatus;
  currentRoundName: string;
  currentRoundIndex: number;
  totalRounds: number;
  rounds: Array<{
    id: string;
    roundNumber: number;
    name: string;
    status: RoundStatus;
    scheduledAt?: string;
    isStudentCleared?: boolean;
    isStudentInvited?: boolean;
  }>;
  match: StudentMatchEvaluation;
  studentStatus: "Not Registered" | "Registered" | "In Assessment" | "Interview Scheduled" | "Selected" | "Not Shortlisted";
}
