"use server";

import { AuditLogEntry, AuditActionType, AuditTargetType } from "./types";
import { getCurrentSessionUser } from "@/lib/auth/actions";

// In-memory persistent audit log store for institutional actions
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "audit-log-1",
    actorId: "usr-admin-demo",
    actorName: "Dean of Academics",
    actorRole: "admin",
    action: "SYSTEM_CONFIGURATION_MODIFIED",
    targetType: "system",
    targetId: "sys-config-2026",
    targetTitle: "Academic Year 2026-27 Enrollment Configuration",
    details: "Configured target department cohorts and semester cutoff rules.",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-log-2",
    actorId: "coord-tpo",
    actorName: "Dr. Lakshmi (Placement Coordinator)",
    actorRole: "coordinator",
    action: "PLACEMENT_DRIVE_PUBLISHED",
    targetType: "placement_activity",
    targetId: "act-today-1",
    targetTitle: "Microsoft India — Software Engineer (SDE-1)",
    details: "Published campus placement drive for CSE, CSM, CSD, AIDS, and ECE branches with ₹24.00 LPA package.",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-log-3",
    actorId: "coord-tpo",
    actorName: "Dr. Lakshmi (Placement Coordinator)",
    actorRole: "coordinator",
    action: "PLACEMENT_DRIVE_PUBLISHED",
    targetType: "placement_activity",
    targetId: "act-today-2",
    targetTitle: "Amazon Web Services (AWS) — Cloud Support Associate",
    details: "Published proctored online assessment schedule on HackerRank.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

let inMemoryAuditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];

/**
 * Record a privileged institutional action in the audit trail
 */
export async function recordAuditLog(
  entry: Omit<AuditLogEntry, "id" | "timestamp">
): Promise<AuditLogEntry> {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  inMemoryAuditLogs.unshift(newEntry);
  return newEntry;
}

/**
 * Fetch audit logs with strict server-side ADMIN authorization guard
 * Unauthorized users (students, faculty) are blocked from accessing audit records.
 */
export async function getAuditLogs(filter?: {
  action?: string;
  targetType?: string;
}): Promise<{
  success: boolean;
  logs: AuditLogEntry[];
  error?: string;
}> {
  const sessionUser = await getCurrentSessionUser();

  // Strict Server-Side RBAC Guard
  if (!sessionUser || sessionUser.role !== "admin") {
    return {
      success: false,
      logs: [],
      error: "Access denied. Server-side administrator authorization is required to view institutional audit logs.",
    };
  }

  let logs = [...inMemoryAuditLogs];

  if (filter?.action && filter.action !== "all") {
    logs = logs.filter((l) => l.action === filter.action);
  }

  if (filter?.targetType && filter.targetType !== "all") {
    logs = logs.filter((l) => l.targetType === filter.targetType);
  }

  return {
    success: true,
    logs,
  };
}
