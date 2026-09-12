/**
 * CampusHub — Audit Log Types & Contracts
 * 
 * Secure audit trail for privileged institutional actions.
 * Stored server-side and accessible strictly to authorized administrators.
 */

export type AuditActionType =
  | "PLACEMENT_DRIVE_CREATED"
  | "PLACEMENT_DRIVE_PUBLISHED"
  | "PLACEMENT_DRIVE_UPDATED"
  | "PLACEMENT_DRIVE_CANCELLED"
  | "CIRCULAR_PUBLISHED"
  | "CIRCULAR_DELETED"
  | "USER_ROLE_CHANGED"
  | "ADMIN_SETTINGS_UPDATED"
  | "SYSTEM_CONFIGURATION_MODIFIED";

export type AuditTargetType =
  | "placement_drive"
  | "placement_activity"
  | "circular"
  | "assignment"
  | "user"
  | "system";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  targetTitle?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}
