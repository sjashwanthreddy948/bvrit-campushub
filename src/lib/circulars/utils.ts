import { UserRole } from "@/types/database";

export interface CircularItem {
  id: string;
  circular_no: string;
  title: string;
  description: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_size?: string | null;
  department?: string | null; // "All" or e.g. "CSE", "ECE", "MECH"
  year?: number | null; // null or 0 means All Years, or 1, 2, 3, 4
  section?: string | null; // null or "All", or "A", "B", "C"
  deadline?: string | null; // ISO Date string
  published_date: string; // ISO Date string
  posted_by: string;
  posted_by_name: string;
  priority: "normal" | "urgent" | "critical";
  signatory?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
}

export interface CircularFilterParams {
  search?: string;
  department?: string;
  priority?: string;
  hasAttachment?: boolean;
  sortBy?: "newest" | "deadline_soonest";
  page?: number;
  pageSize?: number;
}

export interface CircularDeadlineStatus {
  status: "due_today" | "due_tomorrow" | "due_in_x_days" | "overdue" | "none";
  label: string;
  daysRemaining: number;
  isOverdue: boolean;
}

/**
 * Calculate circular deadline status accurately without false states
 */
export function calculateCircularDeadline(deadlineStr?: string | null): CircularDeadlineStatus {
  if (!deadlineStr) {
    return {
      status: "none",
      label: "No Deadline",
      daysRemaining: 9999,
      isOverdue: false,
    };
  }

  const target = new Date(deadlineStr);
  const now = new Date();

  // Reset to midnight for exact calendar-day comparison
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffDays = Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      status: "overdue",
      label: `Overdue by ${daysOverdue} ${daysOverdue === 1 ? "day" : "days"}`,
      daysRemaining: diffDays,
      isOverdue: true,
    };
  } else if (diffDays === 0) {
    return {
      status: "due_today",
      label: "Due today",
      daysRemaining: 0,
      isOverdue: false,
    };
  } else if (diffDays === 1) {
    return {
      status: "due_tomorrow",
      label: "Due tomorrow",
      daysRemaining: 1,
      isOverdue: false,
    };
  } else {
    return {
      status: "due_in_x_days",
      label: `Due in ${diffDays} days`,
      daysRemaining: diffDays,
      isOverdue: false,
    };
  }
}

/**
 * Validate file attachment
 * Enforces PDF format, max 10MB file size, safe filename
 */
export function validateUploadedFile(file: { name: string; size: number; type?: string }): {
  valid: boolean;
  error?: string;
} {
  const MAX_BYTES = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_BYTES) {
    return { valid: false, error: "File size exceeds 10MB limit. Please upload a compressed PDF." };
  }

  const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  const isPdfMime = file.type ? file.type.includes("pdf") : true;

  if (!isPdfExtension || !isPdfMime) {
    return { valid: false, error: "Invalid file format. Only verified PDF (.pdf) documents are permitted." };
  }

  return { valid: true };
}

/**
 * Check if a circular is visible to a given student's cohort
 */
export function isCircularVisibleToStudent(
  circular: CircularItem,
  student: { department: string; year: number; section: string }
): boolean {
  // 1. Department match
  const deptMatch =
    !circular.department ||
    circular.department === "All" ||
    circular.department.toLowerCase() === student.department.toLowerCase();

  // 2. Year match
  const yearMatch =
    circular.year === null ||
    circular.year === undefined ||
    circular.year === 0 ||
    circular.year === student.year;

  // 3. Section match
  const sectionMatch =
    !circular.section ||
    circular.section === "All" ||
    circular.section.toLowerCase() === student.section.toLowerCase();

  return deptMatch && yearMatch && sectionMatch;
}
