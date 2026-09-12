"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionUser } from "@/lib/auth/actions";
import { UserRole } from "@/types/database";
import {
  AssignmentItem,
  AssignmentDeadlineStatus,
  AssignmentFilterParams,
  calculateAssignmentDeadline,
  isAssignmentVisibleToStudent,
} from "./utils";

export type { AssignmentItem, AssignmentDeadlineStatus, AssignmentFilterParams };

// In-memory data store for assignments
const now = new Date();
const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
const tomorrowMidnight = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
const in9Days = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString();
const overdue2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

let inMemoryAssignments: AssignmentItem[] = [
  {
    id: "as-1",
    subject_code: "CS304",
    subject_name: "Operating Systems",
    title: "Lab Assignment 2: Multi-threaded Producer-Consumer Synchronization in C",
    description: "Implement POSIX semaphores and mutex locks to solve the bounded-buffer problem. Verify race conditions using pthread primitives and include your test outputs.",
    deadline: in3Days,
    department: "CSE",
    year: 3,
    section: "A", // Targeted to CSE Year 3 Sec A (Alex Johnson)
    submission_url: "https://vedicai.student.edwisely.com/#/assignments/cs304-lab2",
    attachment_url: "https://campushub.edu/docs/assignments/CS304_Lab2_ProblemSheet.pdf",
    attachment_name: "CS304_Lab2_ProblemSheet.pdf",
    attachment_size: "620 KB",
    posted_by: "fac-2",
    faculty_name: "Prof. K. Sharma",
    max_marks: 25,
    created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "as-2",
    subject_code: "CS302",
    subject_name: "Database Management Systems",
    title: "Problem Set 3: B+ Tree Indexing and Relational Algebra Equivalence Rules",
    description: "Solve questions 1 through 6 from textbook chapter 14. Clearly draw step-by-step node splits for order-4 B+ Trees. Scanned PDF submissions accepted on Vedic.ai.",
    deadline: tomorrowMidnight, // Due tomorrow test case!
    department: "CSE",
    year: 3,
    section: "All", // CSE Year 3 (Alex Johnson)
    submission_url: "https://vedicai.student.edwisely.com/#/assignments/cs302-ps3",
    attachment_url: "https://campushub.edu/docs/assignments/CS302_PS3_Questions.pdf",
    attachment_name: "CS302_PS3_Questions.pdf",
    attachment_size: "450 KB",
    posted_by: "fac-4",
    faculty_name: "Prof. R. Sundaram",
    max_marks: 30,
    created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "as-3",
    subject_code: "CS306",
    subject_name: "Computer Networks",
    title: "Wireshark Packet Analysis & Congestion Window Trace Report",
    description: "Capture TCP 3-way handshake in pcap format. Plot congestion window progression graph over 10MB file transfer through network simulation.",
    deadline: in9Days,
    department: "CSE",
    year: 3,
    section: "A",
    submission_url: "https://vedicai.student.edwisely.com/#/assignments/cs306-wireshark",
    attachment_url: null,
    attachment_name: null,
    posted_by: "fac-5",
    faculty_name: "Dr. Ananya Roy",
    max_marks: 20,
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "as-4",
    subject_code: "CS308",
    subject_name: "Design & Analysis of Algorithms",
    title: "Mini-Project Milestone 1: Dynamic Programming Benchmark",
    description: "Initial code check-in and algorithmic complexity benchmark writeup for Traveling Salesperson Problem heuristic versus Held-Karp exact algorithm.",
    deadline: todayMidnight, // Due today test case!
    department: "CSE",
    year: 3,
    section: "A",
    submission_url: "https://vedicai.student.edwisely.com/#/assignments/cs308-dp-benchmark",
    attachment_url: "https://campushub.edu/docs/assignments/CS308_Project_Rubric.pdf",
    attachment_name: "CS308_Project_Rubric.pdf",
    attachment_size: "380 KB",
    posted_by: "fac-6",
    faculty_name: "Dr. M. Venkatesh",
    max_marks: 50,
    created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "as-5",
    subject_code: "CS310",
    subject_name: "Software Engineering & Testing",
    title: "Unit Testing & Code Coverage Report with Jest / JUnit",
    description: "Submit Git repository link and code coverage metrics exceeding 85% branch coverage.",
    deadline: overdue2Days, // Overdue test case!
    department: "CSE",
    year: 3,
    section: "All",
    submission_url: "https://vedicai.student.edwisely.com/#/assignments/cs310-unit-testing",
    attachment_url: null,
    attachment_name: null,
    posted_by: "fac-2",
    faculty_name: "Prof. K. Sharma",
    max_marks: 20,
    created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "as-6",
    subject_code: "EC402",
    subject_name: "Embedded Systems & IoT",
    title: "Microcontroller Interrupt Service Routine Lab",
    description: "Design timer-based ISR on STM32 microcontroller. Only for ECE 4th year.",
    deadline: in5Days,
    department: "ECE", // ECE only -> Not visible to CSE Alex Johnson!
    year: 4,
    section: "All",
    submission_url: "https://vedicai.student.edwisely.com/#/assignments/ec402-stm32",
    attachment_url: null,
    attachment_name: null,
    posted_by: "fac-3",
    faculty_name: "Dr. S. Nair",
    max_marks: 25,
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "as-7",
    subject_code: "ME201",
    subject_name: "Fluid Dynamics",
    title: "Navier-Stokes Equation Problem Assignment",
    description: "Analytical derivations for laminar flow in pipes. Exclusively for MECH Year 2.",
    deadline: in3Days,
    department: "MECH", // MECH only -> Not visible to CSE Alex Johnson!
    year: 2,
    section: "All",
    submission_url: "https://vedicai.student.edwisely.com/#/assignments/me201-fluid",
    attachment_url: null,
    attachment_name: null,
    posted_by: "fac-7",
    faculty_name: "Prof. G. Patel",
    max_marks: 30,
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get Student Assignments (cohort filtered with calculated deadlines)
 */
export async function getStudentAssignments(params: AssignmentFilterParams = {}): Promise<{
  assignments: Array<AssignmentItem & { deadlineStatus: AssignmentDeadlineStatus }>;
  total: number;
  studentCohort: { department: string; year: number; section: string; name: string };
  counts: {
    all: number;
    due_today: number;
    due_tomorrow: number;
    upcoming: number;
    overdue: number;
  };
}> {
  const sessionUser = await getCurrentSessionUser();

  const student = {
    id: sessionUser?.id || "demo-student-id",
    name: sessionUser?.fullName || "Alex Johnson",
    department: sessionUser?.profile?.department_id || "CSE",
    year: sessionUser?.profile?.year || 3,
    section: sessionUser?.profile?.section || "A",
  };

  const { search = "", statusFilter = "all", subjectCode = "all" } = params;

  // 1. Filter by Cohort
  let items = inMemoryAssignments.filter((a) => isAssignmentVisibleToStudent(a, student));

  // Compute counts for tab badges
  let countDueToday = 0;
  let countDueTomorrow = 0;
  let countUpcoming = 0;
  let countOverdue = 0;

  const allEnriched = items.map((a) => {
    const deadlineStatus = calculateAssignmentDeadline(a.deadline);
    if (deadlineStatus.status === "due_today") countDueToday++;
    else if (deadlineStatus.status === "due_tomorrow") countDueTomorrow++;
    else if (deadlineStatus.status === "due_in_x_days") countUpcoming++;
    else if (deadlineStatus.status === "overdue") countOverdue++;

    return {
      ...a,
      deadlineStatus,
    };
  });

  // 2. Search
  let filtered = allEnriched;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((a) => {
      const titleMatch = a.title.toLowerCase().includes(q);
      const subCodeMatch = a.subject_code.toLowerCase().includes(q);
      const subNameMatch = a.subject_name.toLowerCase().includes(q);
      const descMatch = a.description.toLowerCase().includes(q);
      const facultyMatch = a.faculty_name.toLowerCase().includes(q);
      return titleMatch || subCodeMatch || subNameMatch || descMatch || facultyMatch;
    });
  }

  // 3. Subject filter
  if (subjectCode && subjectCode !== "all") {
    filtered = filtered.filter((a) => a.subject_code.toLowerCase() === subjectCode.toLowerCase());
  }

  // 4. Status filter
  if (statusFilter && statusFilter !== "all") {
    if (statusFilter === "due_today") {
      filtered = filtered.filter((a) => a.deadlineStatus.status === "due_today");
    } else if (statusFilter === "due_tomorrow") {
      filtered = filtered.filter((a) => a.deadlineStatus.status === "due_tomorrow");
    } else if (statusFilter === "upcoming") {
      filtered = filtered.filter((a) => a.deadlineStatus.status === "due_in_x_days");
    } else if (statusFilter === "overdue") {
      filtered = filtered.filter((a) => a.deadlineStatus.status === "overdue");
    }
  }

  // 5. Sort: Due today first, then tomorrow, then upcoming soonest, then overdue
  filtered.sort((a, b) => {
    // If one is overdue and other not, overdue last
    if (a.deadlineStatus.isOverdue && !b.deadlineStatus.isOverdue) return 1;
    if (!a.deadlineStatus.isOverdue && b.deadlineStatus.isOverdue) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return {
    assignments: filtered,
    total: filtered.length,
    studentCohort: student,
    counts: {
      all: allEnriched.length,
      due_today: countDueToday,
      due_tomorrow: countDueTomorrow,
      upcoming: countUpcoming,
      overdue: countOverdue,
    },
  };
}

/**
 * Get Assignment by ID
 */
export async function getAssignmentById(id: string): Promise<{
  assignment: (AssignmentItem & { deadlineStatus: AssignmentDeadlineStatus }) | null;
  error?: string;
}> {
  const item = inMemoryAssignments.find(
    (a) => a.id === id || a.id === `as-${id}` || (id.startsWith("as-") && a.id === id.replace("as-", ""))
  );
  if (!item) {
    return { assignment: null, error: "Assignment not found." };
  }

  return {
    assignment: {
      ...item,
      deadlineStatus: calculateAssignmentDeadline(item.deadline),
    },
  };
}

/**
 * Get All Assignments for Faculty Management
 */
export async function getAllAssignmentsForFaculty(): Promise<{
  assignments: Array<AssignmentItem & { deadlineStatus: AssignmentDeadlineStatus }>;
  isPermitted: boolean;
}> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  if (role !== "faculty" && role !== "admin") {
    return { assignments: [], isPermitted: false };
  }

  const list = inMemoryAssignments
    .map((a) => ({
      ...a,
      deadlineStatus: calculateAssignmentDeadline(a.deadline),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { assignments: list, isPermitted: true };
}

/**
 * Create Assignment Reminder (Faculty / Admin only)
 * IMPORTANT: Validates Vedic.ai submission URL
 */
export async function createAssignment(data: {
  subject_code: string;
  subject_name: string;
  title: string;
  description: string;
  deadline: string;
  department: string;
  year: number;
  section: string;
  submission_url: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  max_marks?: number;
}): Promise<{ success: boolean; assignment?: AssignmentItem; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin") {
    return { success: false, error: "Unauthorized: Only faculty members and administrators can create assignment reminders." };
  }

  // Validation
  if (!data.subject_code || data.subject_code.trim().length < 2) {
    return { success: false, error: "Subject code is required (e.g. CS304)." };
  }
  if (!data.subject_name || data.subject_name.trim().length < 2) {
    return { success: false, error: "Subject name is required." };
  }
  if (!data.title || data.title.trim().length < 5) {
    return { success: false, error: "Assignment title must be at least 5 characters long." };
  }
  if (!data.deadline) {
    return { success: false, error: "A due date is required." };
  }
  if (!data.submission_url || !data.submission_url.trim().startsWith("http")) {
    return { success: false, error: "A valid Vedic.ai submission URL starting with http:// or https:// is required." };
  }

  const newAssignment: AssignmentItem = {
    id: "as-" + Math.random().toString(36).substring(2, 9),
    subject_code: data.subject_code.trim().toUpperCase(),
    subject_name: data.subject_name.trim(),
    title: data.title.trim(),
    description: data.description.trim(),
    deadline: new Date(data.deadline).toISOString(),
    department: data.department || "CSE",
    year: Number(data.year) || 3,
    section: data.section || "A",
    submission_url: data.submission_url.trim(),
    attachment_url: data.attachment_url || null,
    attachment_name: data.attachment_name || null,
    attachment_size: data.attachment_name ? "500 KB" : null,
    posted_by: sessionUser?.id || "fac-2",
    faculty_name: sessionUser?.fullName || "Prof. K. Sharma",
    max_marks: data.max_marks || 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryAssignments.unshift(newAssignment);

  return { success: true, assignment: newAssignment };
}

/**
 * Update Assignment Reminder (Faculty / Admin only)
 */
export async function updateAssignment(
  id: string,
  data: Partial<Omit<AssignmentItem, "id" | "created_at">>
): Promise<{ success: boolean; assignment?: AssignmentItem; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin") {
    return { success: false, error: "Unauthorized: Only faculty members and administrators can edit assignment reminders." };
  }

  const index = inMemoryAssignments.findIndex((a) => a.id === id);
  if (index === -1) {
    return { success: false, error: "Assignment record not found." };
  }

  if (data.submission_url && !data.submission_url.trim().startsWith("http")) {
    return { success: false, error: "A valid Vedic.ai submission URL is required." };
  }

  const existing = inMemoryAssignments[index];
  const updated: AssignmentItem = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };

  inMemoryAssignments[index] = updated;

  return { success: true, assignment: updated };
}

/**
 * Delete Assignment Reminder (Faculty / Admin only)
 */
export async function deleteAssignment(id: string): Promise<{ success: boolean; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin") {
    return { success: false, error: "Unauthorized: Only faculty members and administrators can delete assignment reminders." };
  }

  const exists = inMemoryAssignments.some((a) => a.id === id);
  if (!exists) {
    return { success: false, error: "Assignment record not found." };
  }

  inMemoryAssignments = inMemoryAssignments.filter((a) => a.id !== id);

  return { success: true };
}

/**
 * Universal alias for fetching assignments across modules
 */
export const getAssignments = getStudentAssignments;

