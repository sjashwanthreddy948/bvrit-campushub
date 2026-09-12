/**
 * CampusHub TPO — Placement Drive Data Store & Multi-Round Management
 * 
 * Manages placement drives, 11 lifecycle statuses, multi-round stage tracking,
 * student registrations, and metrics across the 27 college sections.
 */

import {
  PlacementDrive,
  DriveStatus,
  DriveRound,
  TpoDashboardMetrics,
  StudentDriveStageView,
} from "./types";
import { evaluateStudentDriveMatch, StudentProfileInput } from "./matching";

// Realistic initial placement drives for BVRIT
const INITIAL_DRIVES: PlacementDrive[] = [
  {
    id: "drive-amazon-2026",
    company: "Amazon",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    role: "Software Development Engineer (SDE)",
    packageCtc: "₹44.14 LPA",
    stipend: "₹80,000 / month",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "ECE"],
    eligibleYears: [3, 4],
    minCgpa: 7.5,
    requiredSkills: ["DSA", "Java", "Python", "Problem Solving", "System Design"],
    preferredSkills: ["AWS", "Docker", "Distributed Systems"],
    location: "Hyderabad, Telangana",
    workMode: "Hybrid",
    registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
    driveDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      { name: "Amazon_Campus_JD_2026.pdf", url: "https://example.com/jd-amazon.pdf" },
      { name: "Online_Assessment_Guidelines.pdf", url: "https://example.com/guidelines.pdf" },
    ],
    status: "Online Assessment",
    currentRoundIndex: 1, // Round 2: Online Assessment
    rounds: [
      {
        id: "rnd-amz-1",
        roundNumber: 1,
        name: "Registration & Resume Screening",
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "CampusHub Portal",
        instructions: "Verify single-column ATS resume and clearance of 7.5 CGPA criteria.",
        status: "Completed",
        shortlistedCount: 142,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-102", "stu-105", "stu-110"],
      },
      {
        id: "rnd-amz-2",
        roundNumber: 2,
        name: "Online Assessment (OA - Hackerrank)",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "HackerRank Proctored Platform",
        instructions: "2 Coding Questions (DSA) + 20 Work Styles Survey questions. 90 minutes duration.",
        status: "In Progress",
        shortlistedCount: 142,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-102", "stu-105", "stu-110"],
      },
      {
        id: "rnd-amz-3",
        roundNumber: 3,
        name: "Technical Interview Round 1 (DSA & Problem Solving)",
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Amazon Chime / Video Call",
        instructions: "Live coding on shared editor. Focus on Trees, Graphs, and Dynamic Programming.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-amz-4",
        roundNumber: 4,
        name: "Technical & Bar Raiser Round",
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Amazon Chime",
        instructions: "Leadership Principles (STAR format) + System Architecture questions.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-amz-5",
        roundNumber: 5,
        name: "Final Selection & Offer Letter",
        scheduledAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "CampusHub Placement Office",
        instructions: "Issuance of formal intent letter and internship onboarding schedule.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
    ],
    totalEligibleStudents: 380,
    registeredStudentIds: ["stu-alex", "stu-101", "stu-102", "stu-105", "stu-110", "stu-115"],
    selectedStudentIds: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "drive-jpmorgan-2026",
    company: "JPMorgan Chase & Co.",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/J_P_Morgan_Chase_Logo_2008_1.svg",
    role: "Software Engineer — Code for Good",
    packageCtc: "₹19.50 LPA",
    stipend: "₹65,000 / month",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "ECE", "EEE"],
    eligibleYears: [3, 4],
    minCgpa: 7.0,
    requiredSkills: ["Java", "Python", "SQL", "OOP", "REST APIs"],
    preferredSkills: ["Spring Boot", "React", "Cloud"],
    location: "Bengaluru / Hyderabad",
    workMode: "Hybrid",
    registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    driveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      { name: "JPMC_CFG_Guidelines.pdf", url: "https://example.com/jpmc.pdf" },
    ],
    status: "Technical Interview",
    currentRoundIndex: 2, // Round 3: Technical Interview
    rounds: [
      {
        id: "rnd-jpm-1",
        roundNumber: 1,
        name: "Coding Challenge (HireVue)",
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "HireVue Platform",
        instructions: "2 coding questions + 2 video behavioral questions.",
        status: "Completed",
        shortlistedCount: 185,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-103", "stu-108"],
      },
      {
        id: "rnd-jpm-2",
        roundNumber: 2,
        name: "Code for Good Hackathon / Project Review",
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Virtual Hackathon Hub",
        instructions: "Team prototype evaluation with JPMorgan senior technologists.",
        status: "Completed",
        shortlistedCount: 64,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-108"],
      },
      {
        id: "rnd-jpm-3",
        roundNumber: 3,
        name: "SuperDay: Technical & Values Interview",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Zoom / JPMorgan Interview Room",
        instructions: "45-minute technical evaluation covering Java/Python, database queries, and teamwork.",
        status: "In Progress",
        shortlistedCount: 64,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-108"],
      },
      {
        id: "rnd-jpm-4",
        roundNumber: 4,
        name: "HR Interview & Background Verification",
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Placement Office Room 204",
        instructions: "Location preference, role assignment, and background documentation check.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
    ],
    totalEligibleStudents: 410,
    registeredStudentIds: ["stu-alex", "stu-101", "stu-103", "stu-108", "stu-120"],
    selectedStudentIds: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "drive-qualcomm-2026",
    company: "Qualcomm",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/77/Qualcomm-Logo.svg",
    role: "Associate Engineer — Embedded Systems & Software",
    packageCtc: "₹21.00 LPA",
    stipend: "₹55,000 / month",
    eligibleDepartments: ["CSE", "ECE", "EEE"],
    eligibleYears: [3, 4],
    minCgpa: 8.0,
    requiredSkills: ["C", "C++", "Data Structures", "Operating Systems", "Computer Architecture"],
    preferredSkills: ["Linux Kernel", "Device Drivers", "Verilog"],
    location: "Hyderabad, Telangana",
    workMode: "On-site",
    registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // this week
    driveDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      { name: "Qualcomm_Embedded_Curriculum.pdf", url: "https://example.com/qualcomm.pdf" },
    ],
    status: "Registration Open",
    currentRoundIndex: 0,
    rounds: [
      {
        id: "rnd-qc-1",
        roundNumber: 1,
        name: "Campus Registration & CGPA Shortlisting",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "CampusHub TPO Portal",
        instructions: "Ensure CGPA >= 8.0 with no standing backlogs.",
        status: "In Progress",
        shortlistedCount: 110,
        shortlistedStudentIds: ["stu-alex", "stu-105", "stu-112"],
      },
      {
        id: "rnd-qc-2",
        roundNumber: 2,
        name: "Written Test (Technical & Aptitude)",
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "BVRIT Main Auditorium / Online Lab",
        instructions: "60 MCQ questions on C, pointers, bit manipulation, and OS concepts.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-qc-3",
        roundNumber: 3,
        name: "Technical Interview Round (Hardware & Firmware)",
        scheduledAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "TPO Boardroom A",
        instructions: "Whiteboard coding and memory layout analysis.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-qc-4",
        roundNumber: 4,
        name: "HR Discussion & Offer Confirmation",
        scheduledAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "TPO Boardroom B",
        instructions: "Culture fit and offer dispatch.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
    ],
    totalEligibleStudents: 290,
    registeredStudentIds: ["stu-alex", "stu-105", "stu-112"],
    selectedStudentIds: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "drive-google-2026",
    company: "Google",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    role: "Software Engineering Intern 2026",
    packageCtc: "₹42.00 LPA",
    stipend: "₹1,15,000 / month",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "ECE"],
    eligibleYears: [3],
    minCgpa: 8.0,
    requiredSkills: ["DSA", "C++", "Java", "Python", "Algorithms"],
    preferredSkills: ["Competitive Programming", "System Architecture"],
    location: "Bengaluru / Hyderabad",
    workMode: "Hybrid",
    registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow!
    driveDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      { name: "Google_Internship_Brochure.pdf", url: "https://example.com/google.pdf" },
    ],
    status: "Shortlisting",
    currentRoundIndex: 1,
    rounds: [
      {
        id: "rnd-gg-1",
        roundNumber: 1,
        name: "Application & Profile Screening",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Google Careers / CampusHub",
        instructions: "Resume review focusing on competitive coding rank and algorithmic projects.",
        status: "In Progress",
        shortlistedCount: 88,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-107"],
      },
      {
        id: "rnd-gg-2",
        roundNumber: 2,
        name: "Technical Interview Round 1 (Live Coding)",
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Google Meet + Google Docs",
        instructions: "45 minutes live problem solving with Google software engineer.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-gg-3",
        roundNumber: 3,
        name: "Technical Interview Round 2 (Data Structures)",
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Google Meet",
        instructions: "Advanced graph traversal, greedy patterns, and dynamic programming.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-gg-4",
        roundNumber: 4,
        name: "Host Matching & Committee Review",
        scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        locationOrLink: "Google Hiring Portal",
        instructions: "Hiring committee packet evaluation and team matching.",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
    ],
    totalEligibleStudents: 220,
    registeredStudentIds: ["stu-alex", "stu-101", "stu-107"],
    selectedStudentIds: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "drive-cognizant-2026",
    company: "Cognizant",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Cognizant_logo_2022.svg",
    role: "Digital Specialist Engineer (GenC Next)",
    packageCtc: "₹6.75 LPA",
    eligibleDepartments: ["CSE", "CSM", "CSD", "AIDS", "DS", "PHE", "EEE", "ECE", "MECH", "CIVIL"],
    eligibleYears: [4],
    minCgpa: 6.5,
    requiredSkills: ["Java", "Python", "SQL", "Cloud Basics"],
    preferredSkills: ["React", "Spring"],
    location: "Pan India",
    workMode: "Hybrid",
    registrationDeadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    driveDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [],
    status: "Results Announced",
    currentRoundIndex: 3,
    rounds: [
      {
        id: "rnd-cog-1",
        roundNumber: 1,
        name: "Aptitude & Skill Assessment",
        status: "Completed",
        shortlistedCount: 310,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-102", "stu-103", "stu-104"],
      },
      {
        id: "rnd-cog-2",
        roundNumber: 2,
        name: "Technical Interview",
        status: "Completed",
        shortlistedCount: 92,
        shortlistedStudentIds: ["stu-alex", "stu-101", "stu-102"],
      },
      {
        id: "rnd-cog-3",
        roundNumber: 3,
        name: "HR & Document Verification",
        status: "Completed",
        shortlistedCount: 45,
        shortlistedStudentIds: ["stu-alex", "stu-101"],
      },
      {
        id: "rnd-cog-4",
        roundNumber: 4,
        name: "Final Offer Dispatch",
        status: "Completed",
        shortlistedCount: 45,
        shortlistedStudentIds: ["stu-alex", "stu-101"],
      },
    ],
    totalEligibleStudents: 540,
    registeredStudentIds: ["stu-alex", "stu-101", "stu-102", "stu-103", "stu-104"],
    selectedStudentIds: ["stu-alex", "stu-101"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "drive-micron-2026",
    company: "Micron Technology",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Micron_Technology_logo.svg",
    role: "Associate Firmware Engineer",
    packageCtc: "₹16.50 LPA",
    stipend: "₹45,000 / month",
    eligibleDepartments: ["CSE", "ECE", "EEE"],
    eligibleYears: [3, 4],
    minCgpa: 7.5,
    requiredSkills: ["C", "C++", "Microcontrollers", "RTOS", "Data Structures"],
    preferredSkills: ["NAND Flash", "PCIe", "Python Scripting"],
    location: "Hyderabad, Telangana",
    workMode: "On-site",
    registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [],
    status: "Upcoming",
    currentRoundIndex: 0,
    rounds: [
      {
        id: "rnd-mic-1",
        roundNumber: 1,
        name: "Registration & Resume Gate",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-mic-2",
        roundNumber: 2,
        name: "Online Technical Test (C & Hardware)",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: "rnd-mic-3",
        roundNumber: 3,
        name: "Technical Interview & Firmware Problem Solving",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
    ],
    totalEligibleStudents: 310,
    registeredStudentIds: [],
    selectedStudentIds: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Global in-memory instance
let placementDrives: PlacementDrive[] = [...INITIAL_DRIVES];

/**
 * Retrieve all placement drives
 */
export function getAllPlacementDrives(): PlacementDrive[] {
  return [...placementDrives];
}

/**
 * Retrieve drive by ID
 */
export function getPlacementDriveById(id: string): PlacementDrive | null {
  const exact = placementDrives.find((d) => d.id === id);
  if (exact) return exact;

  // Support opp-* id mapping to active campus placement drives
  if (id === "opp-1") return placementDrives.find((d) => d.company.includes("Amazon")) || null;
  if (id === "opp-2") return placementDrives.find((d) => d.company.includes("Google")) || null;
  if (id === "opp-3") return placementDrives.find((d) => d.company.includes("JPMorgan")) || null;
  if (id === "opp-4") return placementDrives.find((d) => d.company.includes("Qualcomm")) || null;
  if (id === "opp-5") return placementDrives.find((d) => d.company.includes("Cognizant")) || null;

  return null;
}

/**
 * Create a new placement drive
 */
export function createPlacementDrive(data: Omit<PlacementDrive, "id" | "createdAt" | "updatedAt">): PlacementDrive {
  const newDrive: PlacementDrive = {
    ...data,
    id: `drive-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  placementDrives.unshift(newDrive);
  return newDrive;
}

/**
 * Update an existing placement drive
 */
export function updatePlacementDrive(id: string, updates: Partial<PlacementDrive>): PlacementDrive | null {
  const index = placementDrives.findIndex((d) => d.id === id);
  if (index === -1) return null;

  placementDrives[index] = {
    ...placementDrives[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return placementDrives[index];
}

/**
 * Update drive status (11 status transition support)
 */
export function updatePlacementDriveStatus(id: string, newStatus: DriveStatus): PlacementDrive | null {
  return updatePlacementDrive(id, { status: newStatus });
}

/**
 * Advance drive round and update shortlisting
 */
export function advanceDriveRound(
  driveId: string,
  targetRoundIndex: number,
  shortlistedStudentIds?: string[],
  nextStatus?: DriveStatus
): PlacementDrive | null {
  const drive = getPlacementDriveById(driveId);
  if (!drive) return null;

  const updatedRounds = [...drive.rounds];

  // Mark previous rounds completed
  for (let i = 0; i < targetRoundIndex; i++) {
    if (updatedRounds[i]) {
      updatedRounds[i] = { ...updatedRounds[i], status: "Completed" };
    }
  }

  // Update target round
  if (updatedRounds[targetRoundIndex]) {
    updatedRounds[targetRoundIndex] = {
      ...updatedRounds[targetRoundIndex],
      status: "In Progress",
      shortlistedStudentIds: shortlistedStudentIds || updatedRounds[targetRoundIndex].shortlistedStudentIds,
      shortlistedCount: shortlistedStudentIds ? shortlistedStudentIds.length : updatedRounds[targetRoundIndex].shortlistedCount,
    };
  }

  // Infer drive status if not provided
  let inferredStatus = nextStatus;
  if (!inferredStatus) {
    const roundName = updatedRounds[targetRoundIndex]?.name.toLowerCase() || "";
    if (roundName.includes("assessment") || roundName.includes("test") || roundName.includes("oa")) {
      inferredStatus = "Online Assessment";
    } else if (roundName.includes("tech") || roundName.includes("technical")) {
      inferredStatus = "Technical Interview";
    } else if (roundName.includes("hr") || roundName.includes("culture")) {
      inferredStatus = "HR Interview";
    } else if (roundName.includes("final") || roundName.includes("selection") || roundName.includes("offer")) {
      inferredStatus = "Results Announced";
    } else {
      inferredStatus = "Shortlisting";
    }
  }

  return updatePlacementDrive(driveId, {
    currentRoundIndex: targetRoundIndex,
    rounds: updatedRounds,
    status: inferredStatus,
  });
}

/**
 * Calculate accurate TPO Dashboard metrics across all placement drives & 27 sections
 */
export function calculateTpoMetrics(): TpoDashboardMetrics {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let activeDrives = 0;
  let upcomingDeadlinesThisWeek = 0;
  let totalEligibleStudents = 0;
  let registeredStudents = 0;
  let assessmentCount = 0;
  let interviewsThisWeek = 0;
  let selectedCount = 0;

  const eligibleSet = new Set<string>();

  placementDrives.forEach((drive) => {
    // Active if not completed, draft, or cancelled
    if (!["Draft", "Completed", "Cancelled"].includes(drive.status)) {
      activeDrives++;
    }

    // Deadlines this week
    if (drive.registrationDeadline) {
      const deadline = new Date(drive.registrationDeadline);
      if (deadline >= now && deadline <= weekFromNow) {
        upcomingDeadlinesThisWeek++;
      }
    }

    // Total eligible
    totalEligibleStudents += drive.totalEligibleStudents;

    // Registered students
    registeredStudents += drive.registeredStudentIds.length;

    // Assessments
    if (drive.status === "Online Assessment") {
      assessmentCount += drive.rounds[drive.currentRoundIndex]?.shortlistedCount || drive.registeredStudentIds.length;
    }

    // Interviews this week
    if (drive.status === "Technical Interview" || drive.status === "HR Interview") {
      interviewsThisWeek += drive.rounds[drive.currentRoundIndex]?.shortlistedCount || 15;
    }

    // Selected count
    selectedCount += drive.selectedStudentIds.length;
    if (drive.status === "Results Announced" || drive.status === "Completed") {
      const finalRound = drive.rounds[drive.rounds.length - 1];
      if (finalRound && finalRound.shortlistedCount > 0 && drive.selectedStudentIds.length === 0) {
        selectedCount += finalRound.shortlistedCount;
      }
    }
  });

  return {
    activeDrives,
    upcomingDeadlinesThisWeek,
    totalEligibleStudents,
    registeredStudents,
    assessmentCount,
    interviewsThisWeek,
    selectedCount,
  };
}

/**
 * Return student-specific view of drive progress (authorized individual data without peer leaks)
 */
export function getStudentDriveStageView(
  driveId: string,
  studentId: string = "stu-alex",
  studentProfile?: StudentProfileInput
): StudentDriveStageView | null {
  const drive = getPlacementDriveById(driveId);
  if (!drive) return null;

  const isRegistered = drive.registeredStudentIds.includes(studentId);
  const isSelected = drive.selectedStudentIds.includes(studentId);

  const currentRound = drive.rounds[drive.currentRoundIndex] || drive.rounds[0];
  const isInvitedToCurrent = currentRound?.shortlistedStudentIds.includes(studentId);

  // Student specific status string
  let studentStatus: StudentDriveStageView["studentStatus"] = "Not Registered";
  if (isSelected) {
    studentStatus = "Selected";
  } else if (drive.status === "Online Assessment" && isInvitedToCurrent) {
    studentStatus = "In Assessment";
  } else if ((drive.status === "Technical Interview" || drive.status === "HR Interview") && isInvitedToCurrent) {
    studentStatus = "Interview Scheduled";
  } else if (isRegistered) {
    studentStatus = "Registered";
  } else if (drive.status === "Results Announced" && !isSelected && isRegistered) {
    studentStatus = "Not Shortlisted";
  }

  // 4-Tier Match
  const defaultProfile: StudentProfileInput = studentProfile || {
    department: "CSE",
    year: 3,
    cgpa: 8.42,
    skills: ["Python", "DSA", "Java", "SQL", "React", "AWS", "Algorithms", "Data Structures", "Problem Solving", "C++"],
  };

  const match = evaluateStudentDriveMatch(defaultProfile, drive);

  const studentRounds = drive.rounds.map((r, idx) => ({
    id: r.id,
    roundNumber: r.roundNumber,
    name: r.name,
    status: r.status,
    scheduledAt: r.scheduledAt,
    isStudentCleared: idx < drive.currentRoundIndex && r.shortlistedStudentIds.includes(studentId),
    isStudentInvited: r.shortlistedStudentIds.includes(studentId),
  }));

  return {
    driveId: drive.id,
    company: drive.company,
    role: drive.role,
    packageCtc: drive.packageCtc,
    driveStatus: drive.status,
    currentRoundName: currentRound?.name || "Preliminary",
    currentRoundIndex: drive.currentRoundIndex,
    totalRounds: drive.rounds.length,
    rounds: studentRounds,
    match,
    studentStatus,
  };
}

/**
 * Synchronize an Opportunity object into placementDrives store
 */
export function syncOpportunityToPlacementDrive(opp: any): PlacementDrive {
  const existingIndex = placementDrives.findIndex((d) => d.id === opp.id);
  if (existingIndex !== -1) {
    return placementDrives[existingIndex];
  }

  const depts = opp.department && opp.department !== "All"
    ? [opp.department.toUpperCase()]
    : ["CSE", "CSM", "CSD", "AIDS", "ECE", "EEE", "MECH", "CIVIL"];

  const newDrive: PlacementDrive = {
    id: opp.id,
    company: opp.company,
    logoUrl: "",
    role: opp.title,
    packageCtc: opp.package || (opp.stipend ? `Stipend: ${opp.stipend}` : "Competitive"),
    stipend: opp.stipend || undefined,
    eligibleDepartments: depts,
    eligibleYears: opp.year ? [opp.year] : [3, 4],
    minCgpa: 7.0,
    requiredSkills: Array.isArray(opp.skills) && opp.skills.length > 0 ? opp.skills : ["Problem Solving", "DSA"],
    preferredSkills: [],
    location: opp.location || "Hyderabad, Telangana",
    workMode: opp.work_mode || "Hybrid",
    registrationDeadline: opp.deadline,
    attachments: [],
    status: "Registration Open",
    currentRoundIndex: 0,
    rounds: [
      {
        id: `rnd-${opp.id}-1`,
        roundNumber: 1,
        name: "Campus Registration & CGPA Shortlisting",
        scheduledAt: opp.deadline,
        locationOrLink: "CampusHub Portal",
        instructions: "Verify eligibility and complete registration.",
        status: "In Progress",
        shortlistedCount: 45,
        shortlistedStudentIds: ["stu-alex"],
      },
      {
        id: `rnd-${opp.id}-2`,
        roundNumber: 2,
        name: "Online Assessment (Coding & Aptitude)",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: `rnd-${opp.id}-3`,
        roundNumber: 3,
        name: "Technical Interview Round",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
      {
        id: `rnd-${opp.id}-4`,
        roundNumber: 4,
        name: "HR & Final Selection",
        status: "Upcoming",
        shortlistedCount: 0,
        shortlistedStudentIds: [],
      },
    ],
    totalEligibleStudents: 320,
    registeredStudentIds: ["stu-alex"],
    selectedStudentIds: [],
    createdAt: opp.created_at || new Date().toISOString(),
    updatedAt: opp.updated_at || new Date().toISOString(),
  };

  placementDrives.unshift(newDrive);
  return newDrive;
}
