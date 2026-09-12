export interface AssignmentItem {
  id: string;
  subject_code: string;
  subject_name: string;
  title: string;
  description: string;
  deadline: string; // ISO Date string
  department: string; // "All" or "CSE", "ECE", etc.
  year: number; // 0 for All, or 1, 2, 3, 4
  section: string; // "All" or "A", "B", "C"
  submission_url: string; // Direct Vedic.ai submission URL
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_size?: string | null;
  posted_by: string;
  faculty_name: string;
  max_marks?: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentDeadlineStatus {
  status: "due_today" | "due_tomorrow" | "due_in_x_days" | "overdue";
  label: string;
  daysRemaining: number;
  isOverdue: boolean;
}

export interface AssignmentFilterParams {
  search?: string;
  statusFilter?: "all" | "due_today" | "due_tomorrow" | "upcoming" | "overdue";
  subjectCode?: string;
}

/**
 * Calculate precise deadline status without false states
 */
export function calculateAssignmentDeadline(deadlineStr: string): AssignmentDeadlineStatus {
  const target = new Date(deadlineStr);
  const now = new Date();

  // Reset to midnight for exact calendar day comparison
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
 * Check if assignment is visible to a student cohort
 */
export function isAssignmentVisibleToStudent(
  assignment: AssignmentItem,
  student: { department: string; year: number; section: string }
): boolean {
  const deptMatch =
    !assignment.department ||
    assignment.department === "All" ||
    assignment.department.toLowerCase() === student.department.toLowerCase();

  const yearMatch =
    assignment.year === null ||
    assignment.year === undefined ||
    assignment.year === 0 ||
    assignment.year === student.year;

  const sectionMatch =
    !assignment.section ||
    assignment.section === "All" ||
    assignment.section.toLowerCase() === student.section.toLowerCase();

  return deptMatch && yearMatch && sectionMatch;
}
