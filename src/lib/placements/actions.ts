"use server";

/**
 * CampusHub — Today's Placement Activity Server Actions
 * 
 * Provides authenticated student awareness and authorized TPO management actions.
 */

import { getCurrentSessionUser } from "@/lib/auth/actions";
import {
  PlacementActivity,
  PlacementActivityType,
  PlacementActivityStatus,
  TodaysPlacementAwarenessResult,
  PlacementActivityWithMatch,
  StudentPlacementProfile,
} from "./types";
import {
  getTodaysPlacementActivities,
  getAllPlacementActivities,
  getPlacementActivityById,
  createPlacementActivity,
  updatePlacementActivity,
  deletePlacementActivity,
} from "./store";
import { evaluatePlacementActivityMatch } from "./matching";
import { recordAuditLog } from "@/lib/audit/actions";

async function getAuthenticatedStudentProfile(): Promise<StudentPlacementProfile> {
  const sessionUser = await getCurrentSessionUser();

  // If logged in as student with profile details, use them
  if (sessionUser && sessionUser.role === "student") {
    const prof = sessionUser.profile as any;
    return {
      name: sessionUser.fullName || "Alex Johnson",
      department: prof?.department || "CSE",
      year: prof?.year || 3,
      cgpa: prof?.cgpa || 8.42,
      skills: prof?.skills || ["Python", "DSA", "Java", "SQL", "React", "AWS", "Algorithms", "Data Structures", "Problem Solving", "C++"],
    };
  }

  // Fallback demo profile
  return {
    name: "Alex Johnson",
    department: "CSE",
    year: 3,
    cgpa: 8.42,
    skills: ["Python", "DSA", "Java", "SQL", "React", "AWS", "Algorithms", "Data Structures", "Problem Solving", "C++"],
  };
}

/**
 * Retrieve Today's Placement Activities for the Student Dashboard
 */
export async function getTodaysPlacementActivitiesAction(): Promise<TodaysPlacementAwarenessResult> {
  const profile = await getAuthenticatedStudentProfile();
  return getTodaysPlacementActivities(profile);
}

/**
 * Retrieve a specific placement activity by ID with student match analysis
 */
export async function getPlacementActivityByIdAction(
  id: string
): Promise<{
  success: boolean;
  activity?: PlacementActivityWithMatch;
  error?: string;
}> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "student";

  const activity = getPlacementActivityById(id, role);
  if (!activity) {
    return { success: false, error: "Placement activity not found or access restricted." };
  }

  const profile = await getAuthenticatedStudentProfile();
  const match = evaluatePlacementActivityMatch(profile, activity);

  return {
    success: true,
    activity: {
      ...activity,
      match,
    },
  };
}

/**
 * Retrieve all placement activities (with student/TPO RBAC filtering)
 */
export async function getAllPlacementActivitiesAction(
  filter?: { status?: string; type?: string; company?: string }
): Promise<PlacementActivityWithMatch[]> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "student";

  const list = getAllPlacementActivities(role, filter);
  const profile = await getAuthenticatedStudentProfile();

  return list.map((act) => ({
    ...act,
    match: evaluatePlacementActivityMatch(profile, act),
  }));
}

/**
 * Create a new Placement Activity (TPO / Placement Staff / Admin only)
 */
export async function createPlacementActivityAction(
  data: Omit<PlacementActivity, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; activity?: PlacementActivity; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "coordinator";

  if (role !== "coordinator" && role !== "admin") {
    return {
      success: false,
      error: "Unauthorized: Only TPO placement officers and administrators can create placement activities.",
    };
  }

  if (!data.companyName?.trim()) {
    return { success: false, error: "Company name is required." };
  }
  if (!data.role?.trim()) {
    return { success: false, error: "Role title is required." };
  }
  if (!data.date) {
    return { success: false, error: "Activity date is required." };
  }
  if (!data.startTime?.trim()) {
    return { success: false, error: "Activity start time is required." };
  }

  const created = createPlacementActivity({
    ...data,
    companyName: data.companyName.trim(),
    role: data.role.trim(),
    venue: data.venue?.trim() || "Main Auditorium / TPO Lab",
    instructions: data.instructions?.trim() || "Please verify official placement eligibility requirements before participating.",
    requiredSkills: data.requiredSkills || [],
    preferredSkills: data.preferredSkills || [],
    importantPreparationSkills: data.importantPreparationSkills || [],
    eligibleDepartments: data.eligibleDepartments?.length ? data.eligibleDepartments : ["ALL"],
    eligibleYears: data.eligibleYears?.length ? data.eligibleYears : [3, 4],
    minCgpa: data.minCgpa || 7.0,
    status: data.status || "Published",
    createdBy: sessionUser?.id || "coord-tpo",
  });

  // Record audit log
  await recordAuditLog({
    actorId: sessionUser?.id || "coord-tpo",
    actorName: sessionUser?.fullName || "Placement Coordinator",
    actorRole: role,
    action: "PLACEMENT_DRIVE_CREATED",
    targetType: "placement_activity",
    targetId: created.id,
    targetTitle: `${created.companyName} — ${created.role}`,
    details: `Created placement activity (${created.status}) with ${created.packageCtc || "stipend"}.`,
  });

  return { success: true, activity: created };
}

/**
 * Update an existing Placement Activity (TPO / Admin only)
 */
export async function updatePlacementActivityAction(
  id: string,
  updates: Partial<PlacementActivity>
): Promise<{ success: boolean; activity?: PlacementActivity; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "coordinator";

  if (role !== "coordinator" && role !== "admin") {
    return {
      success: false,
      error: "Unauthorized: Only TPO placement officers and administrators can edit placement activities.",
    };
  }

  const updated = updatePlacementActivity(id, updates);
  if (!updated) {
    return { success: false, error: "Placement activity not found." };
  }

  // Record audit log
  await recordAuditLog({
    actorId: sessionUser?.id || "coord-tpo",
    actorName: sessionUser?.fullName || "Placement Coordinator",
    actorRole: role,
    action: updates.status === "Cancelled" ? "PLACEMENT_DRIVE_CANCELLED" : "PLACEMENT_DRIVE_UPDATED",
    targetType: "placement_activity",
    targetId: updated.id,
    targetTitle: `${updated.companyName} — ${updated.role}`,
    details: `Updated placement activity. Status: ${updated.status}.`,
  });

  return { success: true, activity: updated };
}

/**
 * Delete a Placement Activity (TPO / Admin only)
 */
export async function deletePlacementActivityAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "coordinator";

  if (role !== "coordinator" && role !== "admin") {
    return {
      success: false,
      error: "Unauthorized: Only TPO placement officers and administrators can delete placement activities.",
    };
  }

  const deleted = deletePlacementActivity(id);
  if (!deleted) {
    return { success: false, error: "Placement activity not found." };
  }

  // Record audit log
  await recordAuditLog({
    actorId: sessionUser?.id || "coord-tpo",
    actorName: sessionUser?.fullName || "Placement Coordinator",
    actorRole: role,
    action: "PLACEMENT_DRIVE_CANCELLED",
    targetType: "placement_activity",
    targetId: id,
    details: `Deleted placement activity record ${id}.`,
  });

  return { success: true };
}

/**
 * Generate WhatsApp-Ready Announcement
 * 
 * Prepares a concise announcement message and wa.me link for manual TPO broadcast.
 * Never sends automatically.
 */
export async function generatePlacementActivityWhatsAppAction(
  id: string
): Promise<{ success: boolean; text?: string; encodedUrl?: string; error?: string }> {
  const activity = getPlacementActivityById(id, "coordinator");
  if (!activity) {
    return { success: false, error: "Placement activity not found." };
  }

  const formattedDate = new Date(activity.date).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const skillsText = activity.requiredSkills.join(" • ");

  let msg = `📢 *TPO PLACEMENT ANNOUNCEMENT: ${activity.companyName.toUpperCase()}*\n`;
  msg += `🏢 *Company:* ${activity.companyName}\n`;
  msg += `🎯 *Role:* ${activity.role} (${activity.employmentType})\n`;
  msg += `📌 *Activity:* ${activity.activityType}\n`;
  msg += `🗓️ *Date & Time:* ${formattedDate} at ${activity.startTime}${activity.endTime ? ` - ${activity.endTime}` : ""}\n`;
  msg += `📍 *Venue:* ${activity.venue}\n`;
  if (activity.packageCtc) {
    msg += `💰 *Package:* ${activity.packageCtc}${activity.stipend ? ` | Stipend: ${activity.stipend}` : ""}\n`;
  }
  msg += `🎓 *Eligible:* ${activity.eligibleDepartments.join(", ")} | Year: ${activity.eligibleYears.join(", ")} | Min CGPA: ${activity.minCgpa.toFixed(1)}+\n`;
  if (skillsText) {
    msg += `⚡ *Key Required Skills:* ${skillsText}\n`;
  }
  if (activity.instructions) {
    msg += `\n📋 *Instructions:* ${activity.instructions}\n`;
  }
  msg += `\n👉 *View Details & Match on CampusHub:* https://campushub.bvrit.ac.in/placements/activities/${activity.id}\n`;
  msg += `\n— Training & Placement Cell, BVRIT`;

  const encodedUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return {
    success: true,
    text: msg,
    encodedUrl,
  };
}
