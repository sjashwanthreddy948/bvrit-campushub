/**
 * CampusHub Notification Types & Definitions
 */

export type NotificationType =
  | "opportunity_deadline"
  | "saved_opportunity_deadline"
  | "application_status"
  | "circular"
  | "assignment_reminder"
  | "campus_announcement";

export type NotificationUrgencyStage =
  | "today"
  | "tomorrow"
  | "within_3_days"
  | "within_7_days";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  dedupKey: string;
  createdAt: string;
  urgencyStage?: NotificationUrgencyStage | null;
  metadata?: {
    opportunityId?: string;
    applicationId?: string;
    circularId?: string;
    assignmentId?: string;
    deadline?: string;
    daysRemaining?: number;
    company?: string;
    status?: string;
  };
}

export interface GroupedNotifications {
  today: NotificationItem[];
  yesterday: NotificationItem[];
  earlier: NotificationItem[];
  unreadCount: number;
  totalCount: number;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  dedupKey: string;
  urgencyStage?: NotificationUrgencyStage | null;
  metadata?: NotificationItem["metadata"];
  createdAt?: string;
}
