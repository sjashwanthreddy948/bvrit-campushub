"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionUser } from "@/lib/auth/actions";
import { ApplicationStatus, OpportunityType } from "@/types/database";

export interface StudentProfileSummary {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
  section: string;
}

export interface DashboardStatistics {
  savedOpportunities: number;
  applications: number;
  upcomingDeadlines: number;
  interviews: number;
}

export interface UpcomingDeadlineItem {
  id: string;
  title: string;
  category: "opportunity" | "circular" | "assignment";
  deadline: string;
  daysRemaining: number;
  urgency: "today" | "tomorrow" | "within_7_days" | "later";
  actionUrl: string;
  actionLabel: string;
  secondaryInfo?: string;
}

export interface LatestOpportunityItem {
  id: string;
  title: string;
  company: string;
  type: OpportunityType;
  deadline: string;
  location: string;
  workMode: string;
  stipend?: string | null;
  isSaved: boolean;
  viewUrl: string;
  matchScore?: number;
  matchCategory?: string;
}

export interface LatestCircularItem {
  id: string;
  title: string;
  date: string;
  deadline?: string | null;
  department: string;
  viewUrl: string;
}

export interface AssignmentReminderItem {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  submissionUrl: string;
}

export interface ApplicationActivityItem {
  id: string;
  opportunityTitle: string;
  company: string;
  status: ApplicationStatus;
  updatedAt: string;
  notes?: string | null;
}

export interface StudentDashboardData {
  student: StudentProfileSummary;
  statistics: DashboardStatistics;
  upcomingDeadlines: UpcomingDeadlineItem[];
  latestOpportunities: LatestOpportunityItem[];
  latestCirculars: LatestCircularItem[];
  assignmentReminders: AssignmentReminderItem[];
  applicationActivity: ApplicationActivityItem[];
}

// In-memory persistent state for local development / testing
let localSavedOpportunityIds = new Set<string>(["opp-1"]);

export async function toggleSaveOpportunity(opportunityId: string): Promise<{ isSaved: boolean }> {
  const sessionUser = await getCurrentSessionUser();
  const studentId = sessionUser?.id || "demo-student-id";

  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      // Check if already saved
      const { data: existing } = await supabase
        .from("saved_opportunities")
        .select("id")
        .eq("student_id", studentId)
        .eq("opportunity_id", opportunityId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("saved_opportunities")
          .delete()
          .eq("student_id", studentId)
          .eq("opportunity_id", opportunityId);
        return { isSaved: false };
      } else {
        await (supabase.from("saved_opportunities") as any).insert({
          student_id: studentId,
          opportunity_id: opportunityId,
        });
        return { isSaved: true };
      }
    }
  } catch {
    // Fall back to local state
  }

  if (localSavedOpportunityIds.has(opportunityId)) {
    localSavedOpportunityIds.delete(opportunityId);
    return { isSaved: false };
  } else {
    localSavedOpportunityIds.add(opportunityId);
    return { isSaved: true };
  }
}

/**
 * Calculates days remaining and urgency category
 */
function calculateUrgency(dateString: string): { daysRemaining: number; urgency: "today" | "tomorrow" | "within_7_days" | "later" } {
  const target = new Date(dateString);
  const now = new Date();
  
  // Set both to start of day for clean day calculation
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDay.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) return { daysRemaining: 0, urgency: "today" };
  if (daysRemaining === 1) return { daysRemaining: 1, urgency: "tomorrow" };
  if (daysRemaining <= 7) return { daysRemaining, urgency: "within_7_days" };
  return { daysRemaining, urgency: "later" };
}

/**
 * Main query for Student Dashboard Data
 */
export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const sessionUser = await getCurrentSessionUser();

  // Student Profile
  const student: StudentProfileSummary = {
    id: sessionUser?.id || "demo-student-id",
    name: sessionUser?.fullName || "Alex Johnson",
    email: sessionUser?.email || "alex.johnson@college.edu",
    department: sessionUser?.profile?.department_id || "CSE",
    year: sessionUser?.profile?.year || 3,
    section: sessionUser?.profile?.section || "A",
  };

  // 1. Raw deadlines data from DB or seed
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();

  // Raw Deadlines across system
  const rawDeadlines = [
    {
      id: "dl-1",
      title: "Amazon SDE Summer Intern 2026",
      category: "opportunity" as const,
      deadline: tomorrow,
      actionUrl: "/opportunities/1",
      actionLabel: "Apply Now",
      secondaryInfo: "Application closes tomorrow at 11:59 PM",
    },
    {
      id: "dl-2",
      title: "Operating Systems Lab 2: Producer-Consumer Sync",
      category: "assignment" as const,
      deadline: in3Days,
      actionUrl: "https://vedicai.student.edwisely.com/",
      actionLabel: "Submit on Vedic.ai",
      secondaryInfo: "CS304 • Prof. K. Sharma",
    },
    {
      id: "dl-3",
      title: "Smart India Hackathon Internal Round Registration",
      category: "opportunity" as const,
      deadline: in5Days,
      actionUrl: "/opportunities/2",
      actionLabel: "Register Team",
      secondaryInfo: "College Innovation Cell",
    },
    {
      id: "dl-4",
      title: "Professional Elective Selection Form Submission",
      category: "circular" as const,
      deadline: in10Days,
      actionUrl: "/circulars/2",
      actionLabel: "View Notice",
      secondaryInfo: "CSE Department Office",
    },
  ];

  // Sort strictly by deadline urgency:
  // 1. Deadline today
  // 2. Deadline tomorrow
  // 3. Deadline within 7 days
  // 4. Later deadlines
  const upcomingDeadlines: UpcomingDeadlineItem[] = rawDeadlines
    .map((item) => {
      const { daysRemaining, urgency } = calculateUrgency(item.deadline);
      return {
        ...item,
        daysRemaining,
        urgency,
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // 2. Latest Opportunities
  const latestOpportunities: LatestOpportunityItem[] = [
    {
      id: "opp-1",
      title: "Software Development Engineer Intern",
      company: "Amazon Web Services",
      type: "internship",
      deadline: tomorrow,
      location: "Bangalore / Hyderabad",
      workMode: "Hybrid",
      stipend: "₹1,10,000/mo",
      isSaved: localSavedOpportunityIds.has("opp-1"),
      viewUrl: "/opportunities/opp-1",
      matchScore: 100,
      matchCategory: "Strong Match",
    },
    {
      id: "opp-2",
      title: "Smart India Hackathon (SIH) 2026 Internal Selection",
      company: "College Innovation Cell",
      type: "hackathon",
      deadline: in5Days,
      location: "Campus Incubation Hub",
      workMode: "On-site",
      stipend: "Prizes up to ₹1,00,000",
      isSaved: localSavedOpportunityIds.has("opp-2"),
      viewUrl: "/opportunities/opp-2",
      matchScore: 60,
      matchCategory: "Good Match",
    },
    {
      id: "opp-3",
      title: "Graduate Software Engineer (2026 Batch)",
      company: "Microsoft India",
      type: "job",
      deadline: in10Days,
      location: "Hyderabad / Noida",
      workMode: "Hybrid",
      stipend: "CTC: 44 LPA",
      isSaved: localSavedOpportunityIds.has("opp-3"),
      viewUrl: "/opportunities/opp-3",
      matchScore: 60,
      matchCategory: "Requirements Not Fully Matched",
    },
  ];

  // 3. Latest Circulars (Relevant to student's department, year, section)
  const latestCirculars: LatestCircularItem[] = [
    {
      id: "circ-1",
      title: "Mid-Semester Examination Timetable & Exam Hall Guidelines",
      date: "Sep 07, 2026",
      deadline: "Sep 22, 2026",
      department: "Dean of Academics",
      viewUrl: "/circulars/1",
    },
    {
      id: "circ-2",
      title: "Third Year Department Elective Selection (AI / Cloud / Cyber Security)",
      date: "Sep 05, 2026",
      deadline: "Sep 18, 2026",
      department: "CSE Department",
      viewUrl: "/circulars/2",
    },
    {
      id: "circ-3",
      title: "Campus Code of Conduct & Anti-Ragging Mandatory Compliance",
      date: "Aug 20, 2026",
      deadline: null,
      department: "Principal Office",
      viewUrl: "/circulars/3",
    },
  ];

  // 4. Assignment Reminders
  const assignmentReminders: AssignmentReminderItem[] = [
    {
      id: "asg-1",
      title: "Lab Assignment 2: Producer-Consumer Thread Synchronization",
      subject: "CS304 Operating Systems",
      deadline: in3Days,
      submissionUrl: "https://vedicai.student.edwisely.com/",
    },
    {
      id: "asg-2",
      title: "Problem Set 3: B+ Tree Indexing & Query Optimizations",
      subject: "CS302 DBMS",
      deadline: in5Days,
      submissionUrl: "https://vedicai.student.edwisely.com/",
    },
  ];

  // 5. Recent Application Activity
  const applicationActivity: ApplicationActivityItem[] = [
    {
      id: "app-1",
      opportunityTitle: "Cloud Infrastructure Engineering Intern",
      company: "Oracle",
      status: "interview",
      updatedAt: "Today, 10:30 AM",
      notes: "Technical Round 2 scheduled for this Friday.",
    },
    {
      id: "app-2",
      opportunityTitle: "Engineering Summer Analyst",
      company: "Goldman Sachs",
      status: "assessment",
      updatedAt: "Yesterday",
      notes: "Online coding assessment completed on HackerRank.",
    },
    {
      id: "app-3",
      opportunityTitle: "GRiD 6.0 Robotics Track Participant",
      company: "Flipkart",
      status: "applied",
      updatedAt: "Sep 04, 2026",
      notes: "Team abstract submitted.",
    },
  ];

  // Compute live statistics dynamically from collections
  const statistics: DashboardStatistics = {
    savedOpportunities: localSavedOpportunityIds.size,
    applications: applicationActivity.length,
    upcomingDeadlines: upcomingDeadlines.length,
    interviews: applicationActivity.filter((a) => a.status === "interview").length,
  };

  return {
    student,
    statistics,
    upcomingDeadlines,
    latestOpportunities,
    latestCirculars,
    assignmentReminders,
    applicationActivity,
  };
}
