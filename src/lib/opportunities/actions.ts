"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionUser } from "@/lib/auth/actions";
import { ApplicationStatus, Opportunity, OpportunityType } from "@/types/database";
import { evaluateOpportunityMatch } from "@/lib/matching/engine";
import { OpportunityMatchingCriteria, StudentMatchingProfile } from "@/lib/matching/types";

export interface OpportunityFilterParams {
  search?: string;
  type?: string;
  workMode?: string;
  location?: string;
  deadlineFilter?: "all" | "active" | "closing_soon" | "closed";
  sortBy?: "newest" | "deadline_soonest" | "recently_updated" | "match_highest";
  page?: number;
  pageSize?: number;
}

export interface OpportunityCardData extends Opportunity {
  isSaved: boolean;
  applicationStatus?: ApplicationStatus | null;
  daysRemaining: number;
  isClosed: boolean;
  matchScore?: number;
  matchCategory?: string;
}

export interface OpportunitiesResponse {
  opportunities: OpportunityCardData[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// In-memory data store for initial opportunities & state
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
const expiredYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

let inMemoryOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    title: "Software Development Engineer Intern",
    company: "Amazon Web Services",
    description: "Collaborate with world-class engineering teams building scalable cloud and consumer services. You will design, build, test, and deploy resilient cloud services on AWS.",
    type: "internship",
    eligibility: "B.Tech CSE/IT, CGPA >= 7.5, 2027 Graduating Batch, No active backlogs",
    skills: ["Data Structures", "Algorithms", "Java", "AWS", "Problem Solving"],
    eligible_departments: ["CSE", "IT"],
    eligible_years: [3],
    min_cgpa: 7.5,
    required_skills: ["Data Structures", "Algorithms", "Java"],
    preferred_skills: ["AWS", "Problem Solving"],
    stipend: "₹1,10,000 / month",
    package: "28 - 44 LPA (PPO)",
    location: "Bangalore / Hyderabad",
    work_mode: "Hybrid",
    deadline: tomorrow,
    application_url: "https://amazon.jobs",
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-2",
    title: "Smart India Hackathon (SIH) 2026 Internal Round",
    company: "Ministry of Education & Innovation Cell",
    description: "Internal college selection round to nominate 30 student teams for Smart India Hackathon 2026. Real-world problem statements from central ministries and state governments.",
    type: "hackathon",
    eligibility: "All departments & years. Team of 6 members with at least 1 female teammate.",
    skills: ["Full Stack", "IoT / Hardware", "AI / Machine Learning", "Presentation"],
    eligible_departments: [],
    eligible_years: [],
    min_cgpa: null,
    required_skills: ["Full Stack", "IoT / Hardware"],
    preferred_skills: ["AI / Machine Learning", "Presentation"],
    stipend: "Cash prizes up to ₹1,00,000",
    package: "National recognition & incubation grant",
    location: "Campus Incubation Hub",
    work_mode: "On-site",
    deadline: in3Days,
    application_url: "https://sih.gov.in",
    created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-3",
    title: "Graduate Software Engineer (2026 Batch)",
    company: "Microsoft India",
    description: "Full-time campus placement for 2026 graduating batch across Microsoft India development centers. Work on core Azure infrastructure, Office 365, or Developer Tools.",
    type: "job",
    eligibility: "Final Year B.Tech CSE, IT, ECE, EEE with CGPA >= 7.0",
    skills: ["C#", "C++", "System Design", "Distributed Systems", "Algorithms"],
    eligible_departments: ["CSE", "IT", "ECE", "EEE"],
    eligible_years: [4],
    min_cgpa: 7.0,
    required_skills: ["C#", "C++", "Algorithms"],
    preferred_skills: ["System Design", "Distributed Systems"],
    stipend: "Full-time CTC",
    package: "CTC: 44 LPA",
    location: "Hyderabad / Noida",
    work_mode: "Hybrid",
    deadline: in10Days,
    application_url: "https://careers.microsoft.com",
    created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-4",
    title: "Student Research Fellowship on Remote Sensing",
    company: "ISRO Space Applications Centre",
    description: "6-month funded student research project focusing on satellite data processing, computer vision for earth observation, and telemetry analysis.",
    type: "scholarship",
    eligibility: "3rd & 4th Year B.Tech CSE, ECE, EEE with interest in Signal/Image Processing",
    skills: ["Python", "Computer Vision", "PyTorch", "Signal Processing"],
    eligible_departments: ["CSE", "ECE", "EEE"],
    eligible_years: [3, 4],
    min_cgpa: null,
    required_skills: ["Python", "Computer Vision"],
    preferred_skills: ["PyTorch", "Signal Processing"],
    stipend: "Govt Fellowship ₹25,000 / month",
    package: "Research Publication & Certificate",
    location: "ISRO HQ / Remote",
    work_mode: "Remote",
    deadline: in14Days,
    application_url: "https://www.isro.gov.in",
    created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-5",
    title: "Google Summer of Code (GSoC) Mentorship Track",
    company: "Google Open Source",
    description: "Global online program focusing on bringing new contributors into open source software development under guided mentorship of leading organizations.",
    type: "competition",
    eligibility: "All enrolled college students aged 18+",
    skills: ["Git", "Open Source", "JavaScript / Python / Go", "Communication"],
    eligible_departments: [],
    eligible_years: [],
    min_cgpa: null,
    required_skills: ["Git", "Open Source"],
    preferred_skills: ["JavaScript", "Python", "Go"],
    stipend: "Stipend: $1,500 - $3,000 USD",
    package: "Global Certificate & Mentorship",
    location: "Remote / Online",
    work_mode: "Remote",
    deadline: in5Days,
    application_url: "https://summerofcode.withgoogle.com",
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-6",
    title: "FinTech Innovation Lab Challenge",
    company: "JPMorgan Chase & Co.",
    description: "Work on algorithmic trading simulation and decentralized payment mechanisms. Top performers receive fast-tracked summer analyst interviews.",
    type: "workshop",
    eligibility: "2nd and 3rd Year engineering students",
    skills: ["Data Structures", "Financial Mathematics", "Java / Python"],
    eligible_departments: ["CSE", "IT", "ECE"],
    eligible_years: [2, 3],
    min_cgpa: 7.0,
    required_skills: ["Data Structures", "Java"],
    preferred_skills: ["Financial Mathematics", "Python"],
    stipend: "Swag & Cash Awards ₹50,000",
    package: "Fast-track interview for 2027 internship",
    location: "Mumbai / Virtual",
    work_mode: "Hybrid",
    deadline: in10Days,
    application_url: "https://careers.jpmorgan.com",
    created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-7",
    title: "Uber Summer Internship 2026",
    company: "Uber",
    description: "High-throughput real-time dispatch systems, dynamic pricing, and routing optimization for mobility platforms.",
    type: "internship",
    eligibility: "Pre-final Year B.Tech CSE / IT",
    skills: ["Go", "Java", "Distributed Systems", "Algorithms"],
    stipend: "₹1,20,000 / month",
    package: "36 LPA PPO",
    location: "Bangalore / Hyderabad",
    work_mode: "On-site",
    deadline: expiredYesterday, // Expired test case!
    application_url: "https://www.uber.com/careers",
    created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Persistent state for saved opportunities and applications in local session
interface SavedStore {
  studentId: string;
  opportunityId: string;
  createdAt: string;
}

interface ApplicationStore {
  id: string;
  studentId: string;
  opportunityId: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

let inMemorySaved: SavedStore[] = [
  { studentId: "demo-student-id", opportunityId: "opp-1", createdAt: new Date().toISOString() },
];

let inMemoryApplications: ApplicationStore[] = [
  {
    id: "app-1",
    studentId: "demo-student-id",
    opportunityId: "opp-1",
    status: "interview",
    appliedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Technical Round 2 scheduled for this Friday. Prepare concurrency and distributed cache.",
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "app-2",
    studentId: "demo-student-id",
    opportunityId: "opp-3",
    status: "assessment",
    appliedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "HackerRank online assessment completed.",
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function calculateDaysRemaining(deadlineStr: string): { daysRemaining: number; isClosed: boolean } {
  const target = new Date(deadlineStr);
  const current = new Date();
  const diff = target.getTime() - current.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return {
    daysRemaining: days,
    isClosed: days < 0,
  };
}

const defaultAlexMatchingProfile: StudentMatchingProfile = {
  department: "CSE",
  year: 3,
  cgpa: 8.42,
  skills: [
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "TypeScript",
    "Data Structures",
    "Algorithms",
    "Problem Solving",
    "SQL",
    "PostgreSQL",
    "React",
    "Next.js",
    "Node.js",
    "AWS",
    "Git",
    "Docker",
    "Full Stack",
  ],
  preferredRoles: ["Software Engineer", "Full Stack Developer", "Cloud Engineer"],
  preferredLocations: ["Bangalore", "Hyderabad", "Remote"],
  preferredWorkMode: "Hybrid",
};

/**
 * Deterministically computes student match score percentage (0-100) and match category
 * using the canonical evaluation engine against verified student profile: Alex Johnson (CSE, Year 3, CGPA 8.42)
 */
function computeOpportunityMatchScore(
  item: Opportunity,
  studentProfile?: StudentMatchingProfile
): { matchScore: number; matchCategory: string } {
  const profile: StudentMatchingProfile = studentProfile || defaultAlexMatchingProfile;

  const criteria: OpportunityMatchingCriteria = {
    id: item.id,
    title: item.title,
    company: item.company,
    type: item.type,
    department: item.department || null,
    year: item.year ?? null,
    skills: item.skills || [],
    eligibility: item.eligibility,
    location: item.location,
    work_mode: item.work_mode,
    eligible_departments: item.eligible_departments || (item.department ? [item.department] : []),
    eligible_years: item.eligible_years || (item.year ? [item.year] : []),
    min_cgpa: item.min_cgpa ?? null,
    required_skills: item.required_skills && item.required_skills.length > 0 ? item.required_skills : (item.skills || []),
    preferred_skills: item.preferred_skills || [],
  };

  const evalResult = evaluateOpportunityMatch(profile, criteria);
  return {
    matchScore: evalResult.matchScore,
    matchCategory: evalResult.matchCategory,
  };
}

/**
 * Deterministically computes student match score percentage (0-100) and match category
 * based on verified student profile: Alex Johnson (CSE, Year 3, CGPA 8.42)
 */
export async function calculateOpportunityMatchScore(
  item: Opportunity
): Promise<{ matchScore: number; matchCategory: string }> {
  return computeOpportunityMatchScore(item);
}

/**
 * Get Filtered, Sorted, and Paginated Opportunities
 */
export async function getOpportunities(
  params: OpportunityFilterParams = {}
): Promise<OpportunitiesResponse> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  const {
    search = "",
    type = "all",
    workMode = "all",
    location = "all",
    deadlineFilter = "all",
    sortBy = "newest",
    page = 1,
    pageSize = 6,
  } = params;

  let items = [...inMemoryOpportunities];

  // 1. Search across title, company, skills, description, and type
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const companyMatch = item.company.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const typeMatch = item.type.toLowerCase().includes(q);
      const skillMatch = item.skills.some((s) => s.toLowerCase().includes(q));
      return titleMatch || companyMatch || descMatch || typeMatch || skillMatch;
    });
  }

  // 2. Filter by Type
  if (type && type !== "all") {
    items = items.filter((item) => item.type === type);
  }

  // 3. Filter by Work Mode
  if (workMode && workMode !== "all") {
    items = items.filter((item) => item.work_mode.toLowerCase() === workMode.toLowerCase());
  }

  // 4. Filter by Location
  if (location && location !== "all") {
    items = items.filter((item) => item.location.toLowerCase().includes(location.toLowerCase()));
  }

  // 5. Filter by Deadline Status
  if (deadlineFilter && deadlineFilter !== "all") {
    items = items.filter((item) => {
      const { daysRemaining, isClosed } = calculateDaysRemaining(item.deadline);
      if (deadlineFilter === "active") return !isClosed;
      if (deadlineFilter === "closing_soon") return !isClosed && daysRemaining <= 7;
      if (deadlineFilter === "closed") return isClosed;
      return true;
    });
  }

  // 6. Sort (including match_highest)
  if (sortBy === "match_highest") {
    items.sort((a, b) => {
      const scoreA = computeOpportunityMatchScore(a).matchScore;
      const scoreB = computeOpportunityMatchScore(b).matchScore;
      return scoreB - scoreA;
    });
  } else if (sortBy === "deadline_soonest") {
    items.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  } else if (sortBy === "recently_updated") {
    items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } else {
    // Newest default
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = items.slice(startIndex, startIndex + pageSize);

  // Map to OpportunityCardData with isSaved, application status, and match percentage
  const cardData: OpportunityCardData[] = paginated.map((item) => {
    const isSaved = inMemorySaved.some(
      (s) => s.studentId === studentId && s.opportunityId === item.id
    );
    const app = inMemoryApplications.find(
      (a) => a.studentId === studentId && a.opportunityId === item.id
    );
    const { daysRemaining, isClosed } = calculateDaysRemaining(item.deadline);
    const { matchScore, matchCategory } = computeOpportunityMatchScore(item);

    return {
      ...item,
      isSaved,
      applicationStatus: app?.status || null,
      daysRemaining,
      isClosed,
      matchScore,
      matchCategory,
    };
  });

  return {
    opportunities: cardData,
    total,
    totalPages,
    currentPage,
  };
}

/**
 * Get Opportunity by ID
 */
export async function getOpportunityById(id: string): Promise<OpportunityCardData | null> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  const item = inMemoryOpportunities.find(
    (o) => o.id === id || o.id === `opp-${id}` || id === `opp-${o.id}`
  );
  if (!item) return null;

  const isSaved = inMemorySaved.some(
    (s) => s.studentId === studentId && s.opportunityId === item.id
  );
  const app = inMemoryApplications.find(
    (a) => a.studentId === studentId && a.opportunityId === item.id
  );
  const { daysRemaining, isClosed } = calculateDaysRemaining(item.deadline);
  const { matchScore, matchCategory } = computeOpportunityMatchScore(item);

  return {
    ...item,
    isSaved,
    applicationStatus: app?.status || null,
    daysRemaining,
    isClosed,
    matchScore,
    matchCategory,
  };
}

/**
 * Save Opportunity (Duplicate Safe)
 */
export async function saveOpportunity(opportunityId: string): Promise<{ success: boolean; isSaved: boolean; message: string }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  // Check duplicate save
  const existing = inMemorySaved.find(
    (s) => s.studentId === studentId && s.opportunityId === opportunityId
  );

  if (existing) {
    return { success: true, isSaved: true, message: "Opportunity is already in your saved list." };
  }

  inMemorySaved.push({
    studentId,
    opportunityId,
    createdAt: new Date().toISOString(),
  });

  return { success: true, isSaved: true, message: "Opportunity saved to bookmarks." };
}

/**
 * Unsave Opportunity
 */
export async function unsaveOpportunity(opportunityId: string): Promise<{ success: boolean; isSaved: boolean; message: string }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  inMemorySaved = inMemorySaved.filter(
    (s) => !(s.studentId === studentId && s.opportunityId === opportunityId)
  );

  return { success: true, isSaved: false, message: "Opportunity removed from bookmarks." };
}

/**
 * Track Application in CampusHub (Duplicate Safe)
 * IMPORTANT: CampusHub records the application internally and provides the external link.
 * Does NOT claim to submit the external application.
 */
export async function trackApplication(
  opportunityId: string,
  notes?: string
): Promise<{ success: boolean; message: string; applicationUrl?: string; alreadyApplied?: boolean }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  const opportunity = inMemoryOpportunities.find((o) => o.id === opportunityId);
  if (!opportunity) {
    return { success: false, message: "Opportunity not found." };
  }

  const { isClosed } = calculateDaysRemaining(opportunity.deadline);
  if (isClosed) {
    return { success: false, message: "This opportunity deadline has passed and is closed." };
  }

  // DUPLICATE APPLICATION CHECK
  const existing = inMemoryApplications.find(
    (a) => a.studentId === studentId && a.opportunityId === opportunityId
  );

  if (existing) {
    return {
      success: true,
      alreadyApplied: true,
      message: "You have already tracked this application in CampusHub.",
      applicationUrl: opportunity.application_url,
    };
  }

  const newApp: ApplicationStore = {
    id: "app-" + Math.random().toString(36).substring(2, 9),
    studentId,
    opportunityId,
    status: "applied",
    appliedAt: new Date().toISOString(),
    notes: notes || "Application initiated via CampusHub.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryApplications.unshift(newApp);

  return {
    success: true,
    alreadyApplied: false,
    message: "Application tracked in CampusHub.",
    applicationUrl: opportunity.application_url,
  };
}

/**
 * Get All Student Applications
 */
export async function getUserApplications(): Promise<
  Array<ApplicationStore & { opportunity: Opportunity }>
> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  const studentApps = inMemoryApplications.filter((a) => a.studentId === studentId);

  return studentApps
    .map((app) => {
      const opportunity = inMemoryOpportunities.find((o) => o.id === app.opportunityId) || {
        id: app.opportunityId,
        title: "Opportunity Listing",
        company: "Company",
        description: "",
        type: "job" as OpportunityType,
        eligibility: "",
        skills: [],
        location: "Location",
        work_mode: "Hybrid",
        deadline: new Date().toISOString(),
        application_url: "#",
        created_at: app.createdAt,
        updated_at: app.updatedAt,
      };
      return {
        ...app,
        opportunity,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Update Application Status & Notes
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  const app = inMemoryApplications.find(
    (a) => a.id === applicationId && a.studentId === studentId
  );

  if (!app) {
    return { success: false, message: "Application record not found or access denied." };
  }

  const oldStatus = app.status;
  app.status = newStatus;
  if (notes !== undefined) {
    app.notes = notes;
  }
  app.updatedAt = new Date().toISOString();

  // Trigger notification if status was changed
  const opp = inMemoryOpportunities.find((o) => o.id === app.opportunityId);
  const oppTitle = opp ? `${opp.company} - ${opp.title}` : "your application";

  try {
    const { notifyApplicationStatusChange } = await import("@/lib/notifications/actions");
    await notifyApplicationStatusChange({
      userId: studentId,
      applicationId: app.id,
      opportunityTitle: oppTitle,
      newStatus,
    });
  } catch (err) {
    console.error("Failed to notify status update:", err);
  }

  return { success: true, message: "Application status updated successfully." };
}

/**
 * Get All Opportunities for Faculty Management
 */
export async function getAllOpportunitiesForFaculty(): Promise<{
  opportunities: OpportunityCardData[];
  isPermitted: boolean;
}> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "faculty";

  // RBAC Guard - Faculty, Admins, and Coordinators (TPO) are permitted
  if (role !== "faculty" && role !== "admin" && role !== "coordinator") {
    return { opportunities: [], isPermitted: false };
  }

  const cardData: OpportunityCardData[] = inMemoryOpportunities.map((item) => {
    const { daysRemaining, isClosed } = calculateDaysRemaining(item.deadline);
    return {
      ...item,
      isSaved: false,
      daysRemaining,
      isClosed,
    };
  });

  return { opportunities: cardData, isPermitted: true };
}

/**
 * Register or sync an opportunity directly from PlacementDrive
 */
export async function syncPlacementDriveToOpportunity(drive: any): Promise<Opportunity> {
  const existing = inMemoryOpportunities.find((o) => o.id === drive.id);
  if (existing) return existing;

  const newOpp: Opportunity = {
    id: drive.id,
    title: drive.role,
    company: drive.company,
    description: `Campus placement drive for ${drive.company} hiring for ${drive.role}. Package: ${drive.packageCtc}. Eligible departments: ${(drive.eligibleDepartments || []).join(", ")}. Minimum CGPA cutoff: ${drive.minCgpa || 7.0}.`,
    type: (drive.packageCtc || "").toLowerCase().includes("lpa") ? "job" : "internship",
    eligibility: `CGPA >= ${drive.minCgpa || 7.0}, ${(drive.eligibleDepartments || []).join("/")} (${(drive.eligibleYears || [3, 4]).map((y: number) => `${y}th yr`).join(", ")})`,
    skills: drive.requiredSkills && drive.requiredSkills.length > 0 ? drive.requiredSkills : ["General", "Problem Solving"],
    stipend: drive.stipend || null,
    package: drive.packageCtc || null,
    location: drive.location || "Hyderabad, Telangana",
    work_mode: drive.workMode || "Hybrid",
    deadline: drive.registrationDeadline || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    application_url: `https://campushub.bvrit.ac.in/opportunities/${drive.id}`,
    department: drive.eligibleDepartments?.[0] || "All",
    year: drive.eligibleYears?.[0] || 3,
    section: "All",
    posted_by: "coord-tpo",
    created_at: drive.createdAt || new Date().toISOString(),
    updated_at: drive.updatedAt || new Date().toISOString(),
  };

  inMemoryOpportunities.unshift(newOpp);
  return newOpp;
}

/**
 * Create Opportunity (Faculty, Coordinator / TPO, Admin)
 */
export async function createOpportunity(data: {
  title: string;
  company: string;
  description?: string;
  type?: OpportunityType;
  eligibility: string;
  skills: string[] | string;
  stipend?: string | null;
  package?: string | null;
  location?: string;
  work_mode?: string;
  deadline: string;
  application_url?: string;
  department?: string | null;
  year?: number | null;
  section?: string | null;
}): Promise<{ success: boolean; opportunity?: Opportunity; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "coordinator";

  // RBAC Guard - Allow coordinator (TPO), faculty, and admin
  if (role !== "faculty" && role !== "admin" && role !== "coordinator") {
    return { success: false, error: "Unauthorized: Only faculty, placement coordinators, and administrators can publish opportunities." };
  }

  // Resilient Validations
  if (!data.title || data.title.trim().length < 2) {
    return { success: false, error: "Opportunity title is required (minimum 2 characters)." };
  }
  if (!data.company || data.company.trim().length < 2) {
    return { success: false, error: "Company or organization name is required." };
  }
  if (!data.eligibility || data.eligibility.trim().length < 2) {
    return { success: false, error: "Eligibility criteria is required." };
  }
  if (!data.deadline) {
    return { success: false, error: "Application deadline is required." };
  }

  // Smart default description if empty or too brief
  let description = data.description?.trim() || "";
  if (description.length < 10) {
    description = `Campus placement drive for ${data.company.trim()} hiring for ${data.title.trim()}. Open for eligible students across departments. Review requirements and submit application before the deadline.`;
  }

  // Smart URL normalization
  let appUrl = data.application_url?.trim() || "";
  if (!appUrl) {
    appUrl = `https://campushub.bvrit.ac.in/opportunities`;
  } else if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
    appUrl = `https://${appUrl}`;
  }

  const skillsArray = Array.isArray(data.skills)
    ? data.skills
    : typeof data.skills === "string" && data.skills.trim().length > 0
    ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : ["General", "Problem Solving"];

  const location = data.location?.trim() || "Hyderabad, Telangana";
  const workMode = data.work_mode?.trim() || "Hybrid";

  let deadlineIso: string;
  try {
    deadlineIso = new Date(data.deadline).toISOString();
  } catch {
    deadlineIso = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  }

  const newOpp: Opportunity = {
    id: "opp-" + Math.random().toString(36).substring(2, 9),
    title: data.title.trim(),
    company: data.company.trim(),
    description,
    type: data.type || "internship",
    eligibility: data.eligibility.trim(),
    skills: skillsArray.length > 0 ? skillsArray : ["General"],
    stipend: data.stipend?.trim() || null,
    package: data.package?.trim() || null,
    location,
    work_mode: workMode,
    deadline: deadlineIso,
    application_url: appUrl,
    department: data.department || "All",
    year: data.year ?? null,
    section: data.section || "All",
    posted_by: sessionUser?.id || (role === "coordinator" ? "coord-tpo" : "fac-1"),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryOpportunities.unshift(newOpp);

  // Bi-directional sync: Also register into TPO placement drives
  try {
    const { syncOpportunityToPlacementDrive } = await import("@/lib/tpo/store");
    syncOpportunityToPlacementDrive(newOpp);
  } catch (syncErr) {
    console.warn("Could not sync opportunity to TPO placement drives:", syncErr);
  }

  return { success: true, opportunity: newOpp };
}

/**
 * Update Opportunity (Faculty / Coordinator / Admin)
 */
export async function updateOpportunity(
  id: string,
  data: Partial<Omit<Opportunity, "id" | "created_at">>
): Promise<{ success: boolean; opportunity?: Opportunity; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin" && role !== "coordinator") {
    return { success: false, error: "Unauthorized: Only faculty, coordinators, and administrators can edit opportunities." };
  }

  const index = inMemoryOpportunities.findIndex((o) => o.id === id);
  if (index === -1) {
    return { success: false, error: "Opportunity not found." };
  }

  let appUrl = data.application_url;
  if (appUrl && !appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
    appUrl = `https://${appUrl.trim()}`;
  }

  const existing = inMemoryOpportunities[index];
  const updated: Opportunity = {
    ...existing,
    ...data,
    ...(appUrl ? { application_url: appUrl } : {}),
    updated_at: new Date().toISOString(),
  };

  inMemoryOpportunities[index] = updated;

  return { success: true, opportunity: updated };
}

/**
 * Delete Opportunity (Faculty / Coordinator / Admin)
 */
export async function deleteOpportunity(id: string): Promise<{ success: boolean; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin" && role !== "coordinator") {
    return { success: false, error: "Unauthorized: Only faculty, coordinators, and administrators can delete opportunities." };
  }

  const exists = inMemoryOpportunities.some((o) => o.id === id);
  if (!exists) {
    return { success: false, error: "Opportunity not found." };
  }

  inMemoryOpportunities = inMemoryOpportunities.filter((o) => o.id !== id);

  return { success: true };
}

