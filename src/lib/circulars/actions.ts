"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionUser } from "@/lib/auth/actions";
import { UserRole } from "@/types/database";
import {
  CircularItem,
  CircularFilterParams,
  CircularDeadlineStatus,
  calculateCircularDeadline,
  validateUploadedFile,
  isCircularVisibleToStudent,
} from "./utils";

export type { CircularItem, CircularFilterParams, CircularDeadlineStatus };

// In-memory data store for circulars
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
const overdueYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

let inMemoryCirculars: CircularItem[] = [
  {
    id: "circ-1",
    circular_no: "ACAD-2026-08",
    title: "Mid-Semester Examination Schedule & Regulations for Autumn 2026",
    description: `All B.Tech students (Years 2, 3, and 4) are hereby notified that the Autumn Semester 2026 Mid-Semester Examinations will commence shortly.

1. Timetable & Venues:
The detailed branch-wise timetable has been scheduled between 09:30 AM – 11:30 AM for Morning sessions and 02:00 PM – 04:00 PM for Afternoon sessions. Examination halls will be pinned on the departmental notice board 24 hours prior to each exam.

2. Mandatory Regulations:
- Students must carry their official College Identity Card and Hall Ticket.
- No electronic devices, smartwatches, or programmable calculators are permitted inside examination halls.
- Hall entry closes strictly 10 minutes prior to question paper distribution.

3. Attendance Eligibility:
Students falling below 75% aggregate attendance as verified on Vedic.ai will be debarred as per university academic regulations unless medical exemption was approved by the respective HOD.`,
    attachment_url: "https://campushub.edu/docs/circulars/MidSem_Exam_Schedule_Autumn_2026.pdf",
    attachment_name: "MidSem_Exam_Schedule_Autumn_2026.pdf",
    attachment_size: "2.4 MB",
    department: "All",
    year: null, // All years
    section: null, // All sections
    deadline: in7Days,
    published_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "fac-1",
    posted_by_name: "Dr. K. V. Ramanathan, Controller of Examinations",
    priority: "urgent",
    signatory: "Dr. K. V. Ramanathan, Controller of Examinations",
    contact_email: "exams@college.edu",
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "circ-2",
    circular_no: "CSE-2026-14",
    title: "Professional Elective Selection Form Submission for CSE Year 3",
    description: `Third Year CSE Students (Section A, B, C) are required to finalize and submit their elective preferences for the upcoming semester.

Available electives in Track 1 include:
1. Deep Learning & Computer Vision
2. Distributed Systems & Cloud Architecture
3. Cryptography & Blockchain Protocols

Failure to submit the preference form by the deadline will result in automatic allocation based on GPA merit and seat availability.`,
    attachment_url: "https://campushub.edu/docs/circulars/CSE_Elective_Selection_Guide_2026.pdf",
    attachment_name: "CSE_Elective_Selection_Guide_2026.pdf",
    attachment_size: "1.1 MB",
    department: "CSE",
    year: 3,
    section: "All",
    deadline: in3Days,
    published_date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "fac-2",
    posted_by_name: "Prof. K. Sharma (HOD CSE)",
    priority: "urgent",
    signatory: "Prof. K. Sharma, Head of Department (CSE)",
    contact_email: "hod.cse@college.edu",
    created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "circ-3",
    circular_no: "DISC-2026-02",
    title: "Strict Campus Anti-Ragging Guidelines & Student Grievance Mechanism",
    description: `The College Administration reiterates its zero-tolerance policy towards ragging in any form across campus, hostels, transport vehicles, and online community forums.

Any violation will result in immediate suspension, rustication, and filing of an FIR under the State Prohibition of Ragging Act.

Emergency Toll-Free Helpline: 1800-180-5522
Campus Security Control Room: Ext 4004`,
    attachment_url: "https://campushub.edu/docs/circulars/Anti_Ragging_Policy_2026.pdf",
    attachment_name: "Anti_Ragging_Policy_2026.pdf",
    attachment_size: "850 KB",
    department: "All",
    year: null,
    section: null,
    deadline: null, // No deadline
    published_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "admin-1",
    posted_by_name: "Principal's Office & Proctorial Board",
    priority: "critical",
    signatory: "Dr. P. N. Murthy, Principal",
    contact_email: "principal@college.edu",
    created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "circ-4",
    circular_no: "CSE-2026-16",
    title: "CSE Section A Lab Batch Rescheduling for Operating Systems",
    description: `Due to faculty development program on Friday, Operating Systems Lab sessions for CSE Year 3 Section A will be held in Turing Lab 4 from 2:00 PM to 5:00 PM on Thursday.

All batch-1 and batch-2 students must bring their completed laboratory record files.`,
    attachment_url: null, // No PDF attachment
    attachment_name: null,
    attachment_size: null,
    department: "CSE",
    year: 3,
    section: "A",
    deadline: tomorrow,
    published_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "fac-2",
    posted_by_name: "Prof. K. Sharma",
    priority: "normal",
    signatory: "Prof. K. Sharma, Course Coordinator",
    contact_email: "k.sharma@college.edu",
    created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "circ-5",
    circular_no: "ECE-2026-09",
    title: "ECE VLSI Design Workshop & Industrial Visit Registration",
    description: `This circular is exclusively for Electronics & Communication Engineering students. 3rd and 4th year ECE students are invited for an on-site visit to SemiCon Fab Labs.`,
    attachment_url: "https://campushub.edu/docs/circulars/ECE_VLSI_Visit.pdf",
    attachment_name: "ECE_VLSI_Visit.pdf",
    attachment_size: "1.4 MB",
    department: "ECE", // ECE only -> Not visible to CSE Alex Johnson!
    year: 3,
    section: "All",
    deadline: in14Days,
    published_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "fac-3",
    posted_by_name: "Dr. S. Nair (ECE Dept)",
    priority: "normal",
    signatory: "Dr. S. Nair, ECE Coordinator",
    contact_email: "ece.events@college.edu",
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "circ-6",
    circular_no: "CSE-2026-02",
    title: "First Year B.Tech CSE Induction Program & Orientation",
    description: `Welcome program for newly admitted 1st Year CSE students. Attendance is mandatory for students and parents.`,
    attachment_url: "https://campushub.edu/docs/circulars/FirstYear_Induction.pdf",
    attachment_name: "FirstYear_Induction.pdf",
    attachment_size: "950 KB",
    department: "CSE",
    year: 1, // Year 1 only -> Not visible to Year 3 Alex Johnson!
    section: "All",
    deadline: overdueYesterday, // Overdue circular
    published_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "fac-2",
    posted_by_name: "Prof. K. Sharma",
    priority: "normal",
    signatory: "First Year Coordinator",
    contact_email: "freshers@college.edu",
    created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "circ-7",
    circular_no: "TPO-2026-33",
    title: "Mandatory Placement Registration & Pre-Assessment Test",
    description: `All eligible final and pre-final year students registered with Training & Placement Cell must take the diagnostic aptitude test. Deadline is today at 11:59 PM.`,
    attachment_url: "https://campushub.edu/docs/circulars/Placement_Assessment_Instructions.pdf",
    attachment_name: "Placement_Assessment_Instructions.pdf",
    attachment_size: "1.8 MB",
    department: "All",
    year: 3,
    section: "All",
    deadline: today, // Deadline Today test case!
    published_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "tpo-1",
    posted_by_name: "Training & Placement Officer",
    priority: "urgent",
    signatory: "Head of Corporate Relations",
    contact_email: "tpo@college.edu",
    created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get Student Circulars (strictly filtered by student's cohort)
 */
export async function getStudentCirculars(params: CircularFilterParams = {}): Promise<{
  circulars: Array<CircularItem & { deadlineStatus: CircularDeadlineStatus }>;
  total: number;
  studentCohort: { department: string; year: number; section: string; name: string };
}> {
  const sessionUser = await getCurrentSessionUser();

  // Student Cohort info
  const student = {
    id: sessionUser?.id || "demo-student-id",
    name: sessionUser?.fullName || "Alex Johnson",
    department: sessionUser?.profile?.department_id || "CSE",
    year: sessionUser?.profile?.year || 3,
    section: sessionUser?.profile?.section || "A",
  };

  const {
    search = "",
    department = "all",
    priority = "all",
    hasAttachment = false,
    sortBy = "newest",
  } = params;

  // 1. Filter by Cohort Targeting
  let items = inMemoryCirculars.filter((c) => isCircularVisibleToStudent(c, student));

  // 2. Search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter((c) => {
      const titleMatch = c.title.toLowerCase().includes(q);
      const descMatch = c.description.toLowerCase().includes(q);
      const noMatch = c.circular_no.toLowerCase().includes(q);
      const deptMatch = (c.department || "").toLowerCase().includes(q);
      return titleMatch || descMatch || noMatch || deptMatch;
    });
  }

  // 3. Priority filter
  if (priority && priority !== "all") {
    items = items.filter((c) => c.priority === priority);
  }

  // 4. Department filter
  if (department && department !== "all") {
    items = items.filter((c) => (c.department || "All").toLowerCase() === department.toLowerCase());
  }

  // 5. Has Attachment filter
  if (hasAttachment) {
    items = items.filter((c) => !!c.attachment_url);
  }

  // 6. Sorting
  if (sortBy === "deadline_soonest") {
    items.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  } else {
    // Newest first
    items.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());
  }

  const enriched = items.map((c) => ({
    ...c,
    deadlineStatus: calculateCircularDeadline(c.deadline),
  }));

  return {
    circulars: enriched,
    total: enriched.length,
    studentCohort: student,
  };
}

/**
 * Get Circular Detail by ID with Security Verification
 */
export async function getCircularById(id: string): Promise<{
  circular: (CircularItem & { deadlineStatus: CircularDeadlineStatus }) | null;
  isAuthorized: boolean;
  userRole: UserRole;
  error?: string;
}> {
  const sessionUser = await getCurrentSessionUser();
  const userRole: UserRole = sessionUser?.role || "student";

  const circular = inMemoryCirculars.find(
    (c) => c.id === id || c.id === `circ-${id}` || (id.startsWith("circ-") && c.id === id.replace("circ-", ""))
  );
  if (!circular) {
    return { circular: null, isAuthorized: false, userRole, error: "Circular not found." };
  }

  // Faculty and Admin have full access
  if (userRole === "faculty" || userRole === "admin") {
    return {
      circular: {
        ...circular,
        deadlineStatus: calculateCircularDeadline(circular.deadline),
      },
      isAuthorized: true,
      userRole,
    };
  }

  // Student role: verify cohort eligibility
  const student = {
    department: sessionUser?.profile?.department_id || "CSE",
    year: sessionUser?.profile?.year || 3,
    section: sessionUser?.profile?.section || "A",
  };

  const authorized = isCircularVisibleToStudent(circular, student);
  if (!authorized) {
    return {
      circular: null,
      isAuthorized: false,
      userRole,
      error: "Access Denied: This circular is restricted to a different department or cohort.",
    };
  }

  return {
    circular: {
      ...circular,
      deadlineStatus: calculateCircularDeadline(circular.deadline),
    },
    isAuthorized: true,
    userRole,
  };
}

/**
 * Get All Circulars for Faculty Management
 */
export async function getAllCircularsForFaculty(): Promise<{
  circulars: Array<CircularItem & { deadlineStatus: CircularDeadlineStatus }>;
  isPermitted: boolean;
}> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  if (role !== "faculty" && role !== "admin") {
    return { circulars: [], isPermitted: false };
  }

  const list = inMemoryCirculars
    .map((c) => ({
      ...c,
      deadlineStatus: calculateCircularDeadline(c.deadline),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { circulars: list, isPermitted: true };
}

/**
 * Create Circular (Faculty / Admin only)
 */
export async function createCircular(data: {
  title: string;
  circular_no: string;
  description: string;
  department?: string | null;
  year?: number | null;
  section?: string | null;
  deadline?: string | null;
  priority: "normal" | "urgent" | "critical";
  signatory?: string;
  contact_email?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_size?: string | null;
}): Promise<{ success: boolean; circular?: CircularItem; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin") {
    return { success: false, error: "Unauthorized: Only faculty members and administrators can issue circulars." };
  }

  // Validation
  if (!data.title || data.title.trim().length < 5) {
    return { success: false, error: "Circular title must be at least 5 characters long." };
  }
  if (!data.circular_no || data.circular_no.trim().length < 2) {
    return { success: false, error: "Reference number is required." };
  }
  if (!data.description || data.description.trim().length < 10) {
    return { success: false, error: "Description must provide sufficient details." };
  }

  // Validate attachment if present
  if (data.attachment_name) {
    const fileVal = validateUploadedFile({
      name: data.attachment_name,
      size: data.attachment_size ? 2 * 1024 * 1024 : 1000,
    });
    if (!fileVal.valid) {
      return { success: false, error: fileVal.error };
    }
  }

  const newCircular: CircularItem = {
    id: "circ-" + Math.random().toString(36).substring(2, 9),
    circular_no: data.circular_no.trim().toUpperCase(),
    title: data.title.trim(),
    description: data.description.trim(),
    department: data.department || "All",
    year: data.year ?? null,
    section: data.section || "All",
    deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
    published_date: new Date().toISOString(),
    posted_by: sessionUser?.id || "fac-1",
    posted_by_name: sessionUser?.fullName || "Prof. K. Sharma",
    priority: data.priority || "normal",
    signatory: data.signatory || sessionUser?.fullName || "Department Office",
    contact_email: data.contact_email || sessionUser?.email || "office@college.edu",
    attachment_url: data.attachment_url || (data.attachment_name ? `https://campushub.edu/docs/circulars/${data.attachment_name}` : null),
    attachment_name: data.attachment_name || null,
    attachment_size: data.attachment_size || (data.attachment_name ? "1.5 MB" : null),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryCirculars.unshift(newCircular);

  return { success: true, circular: newCircular };
}

/**
 * Update Circular (Faculty / Admin only)
 */
export async function updateCircular(
  id: string,
  data: Partial<Omit<CircularItem, "id" | "created_at">>
): Promise<{ success: boolean; circular?: CircularItem; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin") {
    return { success: false, error: "Unauthorized: Only faculty members and administrators can edit circulars." };
  }

  const index = inMemoryCirculars.findIndex((c) => c.id === id);
  if (index === -1) {
    return { success: false, error: "Circular record not found." };
  }

  // Validate attachment if updated
  if (data.attachment_name) {
    const fileVal = validateUploadedFile({
      name: data.attachment_name,
      size: 2 * 1024 * 1024,
    });
    if (!fileVal.valid) {
      return { success: false, error: fileVal.error };
    }
  }

  const existing = inMemoryCirculars[index];
  const updated: CircularItem = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };

  inMemoryCirculars[index] = updated;

  return { success: true, circular: updated };
}

/**
 * Delete Circular (Faculty / Admin only)
 */
export async function deleteCircular(id: string): Promise<{ success: boolean; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role: UserRole = sessionUser?.role || "faculty";

  // RBAC Guard
  if (role !== "faculty" && role !== "admin") {
    return { success: false, error: "Unauthorized: Only faculty members and administrators can delete circulars." };
  }

  const exists = inMemoryCirculars.some((c) => c.id === id);
  if (!exists) {
    return { success: false, error: "Circular record not found." };
  }

  inMemoryCirculars = inMemoryCirculars.filter((c) => c.id !== id);

  return { success: true };
}

/**
 * Universal alias for fetching circulars across modules
 */
export const getCirculars = getStudentCirculars;

