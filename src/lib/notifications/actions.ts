"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionUser } from "@/lib/auth/actions";
import {
  NotificationItem,
  GroupedNotifications,
  CreateNotificationParams,
  NotificationUrgencyStage,
} from "./types";
import { getOpportunities } from "@/lib/opportunities/actions";
import { getAllAssignmentsForFaculty } from "@/lib/assignments/actions";
import { categorizeDateGroup, calculateDeadlineStage } from "./utils";

// Default in-memory seed notifications
const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const yesterdayDate = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
const threeDaysAgoDate = new Date(todayStart.getTime() - 3 * 24 * 60 * 60 * 1000);

let inMemoryNotifications: NotificationItem[] = [
  {
    id: "notif-seed-1",
    userId: "demo-student-id",
    type: "saved_opportunity_deadline",
    title: "Amazon Web Services - SDE Intern",
    message: "You saved this opportunity but haven't marked it as applied.",
    link: "/opportunities/opp-1",
    isRead: false,
    dedupKey: "seed_saved_opp_1",
    urgencyStage: "tomorrow",
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago today
    metadata: {
      opportunityId: "opp-1",
      company: "Amazon Web Services",
      daysRemaining: 1,
    },
  },
  {
    id: "notif-seed-2",
    userId: "demo-student-id",
    type: "circular",
    title: "Mid-Semester Examination Timetable Published",
    message: "Dean of Academics published circular #ACAD-2026-08. Check schedule and room allocations.",
    link: "/circulars/circ-1",
    isRead: false,
    dedupKey: "seed_circular_1",
    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago today
    metadata: {
      circularId: "circ-1",
    },
  },
  {
    id: "notif-seed-3",
    userId: "demo-student-id",
    type: "application_status",
    title: "Application Shortlisted",
    message: "Your application for Oracle Cloud Infrastructure Intern was moved to Interview.",
    link: "/applications",
    isRead: false,
    dedupKey: "seed_app_status_1",
    createdAt: new Date(yesterdayDate.getTime() + 14 * 60 * 60 * 1000).toISOString(), // Yesterday afternoon
    metadata: {
      status: "interview",
    },
  },
  {
    id: "notif-seed-4",
    userId: "demo-student-id",
    type: "assignment_reminder",
    title: "Assignment Due: CS304 Operating Systems Lab",
    message: "Submission on Vedic.ai is due within 3 days. Complete CPU Scheduling simulation.",
    link: "/assignments",
    isRead: true,
    dedupKey: "seed_asg_1",
    urgencyStage: "within_3_days",
    createdAt: new Date(yesterdayDate.getTime() + 10 * 60 * 60 * 1000).toISOString(), // Yesterday morning
    metadata: {
      assignmentId: "asg-1",
      daysRemaining: 3,
    },
  },
  {
    id: "notif-seed-5",
    userId: "demo-student-id",
    type: "opportunity_deadline",
    title: "SIH 2026 Internal Round Registration Closing",
    message: "Ministry of Education hackathon selection deadline is approaching within 7 days.",
    link: "/opportunities/opp-2",
    isRead: true,
    dedupKey: "seed_opp_2",
    urgencyStage: "within_7_days",
    createdAt: new Date(threeDaysAgoDate.getTime()).toISOString(), // Earlier
    metadata: {
      opportunityId: "opp-2",
      daysRemaining: 5,
    },
  },
  {
    id: "notif-seed-6",
    userId: "demo-student-id",
    type: "campus_announcement",
    title: "Campus Wi-Fi Maintenance Notice",
    message: "IT services will undergo maintenance on Sunday from 2:00 AM to 5:00 AM.",
    link: "/notifications",
    isRead: true,
    dedupKey: "seed_announcement_1",
    createdAt: new Date(threeDaysAgoDate.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Earlier
  },
];

/**
 * Safe notification creation with Duplicate Prevention
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<{ success: boolean; notification?: NotificationItem; duplicate?: boolean }> {
  // 1. Check in-memory store for existing dedupKey
  const exists = inMemoryNotifications.some(
    (n) => n.userId === params.userId && n.dedupKey === params.dedupKey
  );

  if (exists) {
    return { success: false, duplicate: true };
  }

  // 2. Supabase DB check if live
  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase =
      supabaseUrl &&
      !supabaseUrl.includes("placeholder") &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

    if (isLiveSupabase) {
      const { data: dbExisting } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", params.userId)
        .eq("dedup_key" as any, params.dedupKey)
        .maybeSingle();

      if (dbExisting) {
        return { success: false, duplicate: true };
      }

      const { data: inserted, error } = await supabase
        .from("notifications")
        .insert({
          user_id: params.userId,
          title: params.title,
          message: params.message,
          read: false,
          type: params.type,
          dedup_key: params.dedupKey,
        } as any)
        .select()
        .single();

      if (!error && inserted) {
        const row = inserted as any;
        const item: NotificationItem = {
          id: row.id,
          userId: row.user_id,
          type: params.type,
          title: row.title,
          message: row.message,
          link: params.link,
          isRead: row.read,
          dedupKey: params.dedupKey,
          createdAt: row.created_at,
          urgencyStage: params.urgencyStage,
          metadata: params.metadata,
        };
        inMemoryNotifications.unshift(item);
        return { success: true, notification: item };
      }
    }
  } catch {
    // Continue with in-memory persistence
  }

  const newNotification: NotificationItem = {
    id: "notif-" + Math.random().toString(36).substring(2, 9),
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    isRead: false,
    dedupKey: params.dedupKey,
    createdAt: params.createdAt || new Date().toISOString(),
    urgencyStage: params.urgencyStage,
    metadata: params.metadata,
  };

  inMemoryNotifications.unshift(newNotification);
  return { success: true, notification: newNotification };
}

/**
 * Evaluates upcoming deadlines for opportunities, saved opportunities, and assignments
 * Generates notifications idempotently using stage-based dedup keys.
 */
export async function evaluateUpcomingDeadlinesForUser(
  userId: string
): Promise<{ evaluated: number; generated: number }> {
  let generated = 0;
  let evaluated = 0;

  try {
    // 1. Check Opportunities
    const oppRes = await getOpportunities({ pageSize: 50 });
    const opps = oppRes.opportunities;

    for (const opp of opps) {
      if (!opp.deadline) continue;
      evaluated++;

      const { stage, daysRemaining } = calculateDeadlineStage(opp.deadline);
      if (!stage) continue;

      const stageLabel =
        stage === "today"
          ? "today"
          : stage === "tomorrow"
          ? "tomorrow"
          : `in ${daysRemaining} days`;

      // SAVED OPPORTUNITY REMINDER:
      // If student saved opportunity AND deadline is approaching AND student has not marked it applied
      if (opp.isSaved && opp.applicationStatus !== "applied" && opp.applicationStatus !== "interview" && opp.applicationStatus !== "selected") {
        const dedupKey = `saved_opp_${opp.id}_${userId}_${stage}`;
        const res = await createNotification({
          userId,
          type: "saved_opportunity_deadline",
          title: `${opp.company} - ${opp.title}`,
          message: "You saved this opportunity but haven't marked it as applied.",
          link: `/opportunities/${opp.id}`,
          dedupKey,
          urgencyStage: stage,
          metadata: {
            opportunityId: opp.id,
            company: opp.company,
            deadline: opp.deadline,
            daysRemaining,
          },
        });
        if (res.success) generated++;
      } else {
        // Standard Opportunity Deadline Approaching
        const dedupKey = `opp_deadline_${opp.id}_${userId}_${stage}`;
        const res = await createNotification({
          userId,
          type: "opportunity_deadline",
          title: `Deadline Approaching: ${opp.title}`,
          message: `${opp.company} application deadline is ${stageLabel}.`,
          link: `/opportunities/${opp.id}`,
          dedupKey,
          urgencyStage: stage,
          metadata: {
            opportunityId: opp.id,
            company: opp.company,
            deadline: opp.deadline,
            daysRemaining,
          },
        });
        if (res.success) generated++;
      }
    }

    // 2. Check Assignments
    const asgRes = await getAllAssignmentsForFaculty();
    const assignments = asgRes.assignments;

    for (const asg of assignments) {
      if (!asg.deadline) continue;
      evaluated++;

      const { stage, daysRemaining } = calculateDeadlineStage(asg.deadline);
      if (!stage) continue;

      const stageLabel =
        stage === "today"
          ? "today"
          : stage === "tomorrow"
          ? "tomorrow"
          : `in ${daysRemaining} days`;

      const dedupKey = `asg_deadline_${asg.id}_${userId}_${stage}`;
      const res = await createNotification({
        userId,
        type: "assignment_reminder",
        title: `Assignment Due: ${asg.title}`,
        message: `Submission on Vedic.ai is due ${stageLabel}.`,
        link: "/assignments",
        dedupKey,
        urgencyStage: stage,
        metadata: {
          assignmentId: asg.id,
          deadline: asg.deadline,
          daysRemaining,
        },
      });
      if (res.success) generated++;
    }
  } catch (err) {
    console.error("Error evaluating upcoming deadlines:", err);
  }

  return { evaluated, generated };
}

/**
 * Retrieve user notifications grouped by Today, Yesterday, Earlier
 */
export async function getUserNotifications(): Promise<GroupedNotifications> {
  const sessionUser = await getCurrentSessionUser();
  const userId = sessionUser?.id || "demo-student-id";

  // Evaluate upcoming deadlines idempotently without redundant DB bombardment
  await evaluateUpcomingDeadlinesForUser(userId);

  // Filter for this user
  const userItems = inMemoryNotifications.filter(
    (n) => n.userId === userId || n.userId === "demo-student-id"
  );

  const today: NotificationItem[] = [];
  const yesterday: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];

  for (const item of userItems) {
    const group = categorizeDateGroup(item.createdAt);
    if (group === "today") {
      today.push(item);
    } else if (group === "yesterday") {
      yesterday.push(item);
    } else {
      earlier.push(item);
    }
  }

  // Sort each bucket newest first
  const sortDesc = (a: NotificationItem, b: NotificationItem) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  today.sort(sortDesc);
  yesterday.sort(sortDesc);
  earlier.sort(sortDesc);

  const unreadCount = userItems.filter((n) => !n.isRead).length;

  return {
    today,
    yesterday,
    earlier,
    unreadCount,
    totalCount: userItems.length,
  };
}

/**
 * Lightweight unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const sessionUser = await getCurrentSessionUser();
  const userId = sessionUser?.id || "demo-student-id";

  const userItems = inMemoryNotifications.filter(
    (n) => n.userId === userId || n.userId === "demo-student-id"
  );

  return userItems.filter((n) => !n.isRead).length;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  id: string
): Promise<{ success: boolean; unreadCount: number }> {
  const sessionUser = await getCurrentSessionUser();
  const userId = sessionUser?.id || "demo-student-id";

  const item = inMemoryNotifications.find(
    (n) => n.id === id && (n.userId === userId || n.userId === "demo-student-id")
  );

  if (item) {
    item.isRead = true;
  }

  try {
    const supabase = await createClient();
    await (supabase.from("notifications") as any)
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", userId);
  } catch {
    // Ignore db fallback error
  }

  const unread = await getUnreadNotificationCount();
  return { success: true, unreadCount: unread };
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; unreadCount: number }> {
  const sessionUser = await getCurrentSessionUser();
  const userId = sessionUser?.id || "demo-student-id";

  inMemoryNotifications.forEach((n) => {
    if (n.userId === userId || n.userId === "demo-student-id") {
      n.isRead = true;
    }
  });

  try {
    const supabase = await createClient();
    await (supabase.from("notifications") as any)
      .update({ read: true })
      .eq("user_id", userId);
  } catch {
    // Ignore db fallback error
  }

  return { success: true, unreadCount: 0 };
}

/**
 * Trigger an application status update notification
 */
export async function notifyApplicationStatusChange(params: {
  userId: string;
  applicationId: string;
  opportunityTitle: string;
  newStatus: string;
}): Promise<void> {
  const formattedStatus =
    params.newStatus.charAt(0).toUpperCase() + params.newStatus.slice(1);

  const dayKey = new Date().toISOString().slice(0, 10);
  const dedupKey = `app_status_${params.applicationId}_${params.newStatus}_${dayKey}`;

  await createNotification({
    userId: params.userId,
    type: "application_status",
    title: "Application Status Updated",
    message: `Your application for ${params.opportunityTitle} was moved to ${formattedStatus}.`,
    link: "/applications",
    dedupKey,
    metadata: {
      applicationId: params.applicationId,
      status: params.newStatus,
    },
  });
}
