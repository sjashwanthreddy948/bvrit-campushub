"use server";

/**
 * CampusHub TPO — Placement Drive Server Actions
 */

import {
  getAllPlacementDrives,
  getPlacementDriveById,
  updatePlacementDriveStatus,
  advanceDriveRound,
  createPlacementDrive,
  calculateTpoMetrics,
  getStudentDriveStageView,
} from "./store";
import { DriveStatus, PlacementDrive, TpoDashboardMetrics } from "./types";
import { queryTpoAssistant, TpoAiResponse } from "./ai-assistant";

export async function getPlacementDrivesAction(): Promise<PlacementDrive[]> {
  return getAllPlacementDrives();
}

export async function getPlacementDriveByIdAction(id: string): Promise<PlacementDrive | null> {
  return getPlacementDriveById(id);
}

export async function getTpoMetricsAction(): Promise<TpoDashboardMetrics> {
  return calculateTpoMetrics();
}

export async function updateDriveStatusAction(
  id: string,
  newStatus: DriveStatus
): Promise<PlacementDrive | null> {
  return updatePlacementDriveStatus(id, newStatus);
}

export async function advanceDriveRoundAction(
  driveId: string,
  roundIndex: number,
  shortlistedStudentIds?: string[],
  nextStatus?: DriveStatus
): Promise<PlacementDrive | null> {
  return advanceDriveRound(driveId, roundIndex, shortlistedStudentIds, nextStatus);
}

export async function createPlacementDriveAction(
  data: Omit<PlacementDrive, "id" | "createdAt" | "updatedAt">
): Promise<PlacementDrive> {
  const drive = createPlacementDrive(data);
  try {
    const { syncPlacementDriveToOpportunity } = await import("@/lib/opportunities/actions");
    await syncPlacementDriveToOpportunity(drive);
  } catch (err) {
    console.warn("Could not sync placement drive to opportunities store:", err);
  }
  return drive;
}


export async function queryTpoAiAssistantAction(query: string): Promise<TpoAiResponse> {
  return queryTpoAssistant(query);
}

export async function getStudentDriveViewAction(
  driveId: string,
  studentId: string = "stu-alex"
) {
  return getStudentDriveStageView(driveId, studentId);
}

export async function generateDriveWhatsAppBroadcastAction(
  driveId: string,
  sectionKey: string = "all"
): Promise<{ text: string; encodedUrl: string }> {
  const drive = getPlacementDriveById(driveId);
  if (!drive) {
    throw new Error("Placement drive not found");
  }

  const deadlineFormatted = new Date(drive.registrationDeadline).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sectionLabel = sectionKey === "all" ? "All Eligible Sections" : `Section ${sectionKey}`;

  let text = `📢 *TPO PLACEMENT ALERT: ${drive.company.toUpperCase()}*\n`;
  text += `🎯 *Role:* ${drive.role}\n`;
  text += `💰 *Package (CTC):* ${drive.packageCtc}${drive.stipend ? ` | Stipend: ${drive.stipend}` : ""}\n`;
  text += `🎓 *Target Sections:* ${sectionLabel} (${drive.eligibleDepartments.join(", ")})\n`;
  text += `📊 *Min CGPA Cutoff:* ${drive.minCgpa.toFixed(1)}+\n`;
  text += `📍 *Current Stage:* ${drive.status}\n`;
  text += `⏰ *Registration Deadline:* ${deadlineFormatted}\n\n`;
  text += `👉 *Action Required:* Review role guidelines and register via CampusHub:\n`;
  text += `https://campushub.bvrit.ac.in/opportunities/${drive.id}\n\n`;
  text += `— Training & Placement Cell, BVRIT`;

  const encodedUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return { text, encodedUrl };
}
