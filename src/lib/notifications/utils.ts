import { NotificationUrgencyStage } from "./types";

/**
 * Categorizes a date into "today", "yesterday", or "earlier"
 */
export function categorizeDateGroup(dateStr: string): "today" | "yesterday" | "earlier" {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const time = date.getTime();

  if (time >= startOfToday) {
    return "today";
  } else if (time >= startOfYesterday && time < startOfToday) {
    return "yesterday";
  } else {
    return "earlier";
  }
}

/**
 * Calculates deadline urgency stage
 */
export function calculateDeadlineStage(deadlineStr: string): {
  stage: NotificationUrgencyStage | null;
  daysRemaining: number;
} {
  const deadline = new Date(deadlineStr);
  const now = new Date();

  const targetDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffDays = Math.ceil((targetDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { stage: null, daysRemaining: diffDays }; // Expired
  }

  if (diffDays === 0) {
    return { stage: "today", daysRemaining: 0 };
  } else if (diffDays === 1) {
    return { stage: "tomorrow", daysRemaining: 1 };
  } else if (diffDays <= 3) {
    return { stage: "within_3_days", daysRemaining: diffDays };
  } else if (diffDays <= 7) {
    return { stage: "within_7_days", daysRemaining: diffDays };
  } else {
    return { stage: null, daysRemaining: diffDays };
  }
}
