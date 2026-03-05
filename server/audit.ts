/**
 * Audit Log Helper - LGPD Compliance
 * Tracks all access, creation, updates, and deletions of sensitive data
 */

import { getDb } from "./db";
import { auditLogs, InsertAuditLog } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { eq, and } from "drizzle-orm";

export type AuditEvent = "created" | "updated" | "viewed" | "deleted" | "shared";

export interface AuditLogData {
  auditableType: string;
  auditableId: number;
  event: AuditEvent;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  modifiedFields?: string[];
  reason?: string;
}

/**
 * Log an audit event
 * This function should be called whenever sensitive data is accessed or modified
 */
export async function logAudit(
  ctx: TrpcContext,
  data: AuditLogData
): Promise<void> {
  if (!ctx.user) {
    console.warn("[Audit] Attempted to log without authenticated user");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available for audit logging");
    return;
  }

  try {
    const auditEntry: InsertAuditLog = {
      auditableType: data.auditableType,
      auditableId: data.auditableId,
      event: data.event,
      userId: ctx.user.id,
      userType: ctx.user.role,
      ipAddress: ctx.req.ip || "unknown",
      userAgent: ctx.req.headers["user-agent"] as string | undefined,
      oldValues: data.oldValues || null,
      newValues: data.newValues || null,
      modifiedFields: data.modifiedFields || null,
      reason: data.reason || null,
    };

    await db.insert(auditLogs).values(auditEntry);
  } catch (error) {
    console.error("[Audit] Failed to log audit entry:", error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Get audit history for a specific auditable resource
 */
export async function getAuditHistory(
  auditableType: string,
  auditableId: number,
  limit: number = 100
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available");
    return [];
  }

  try {
    const history = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.auditableType, auditableType),
          eq(auditLogs.auditableId, auditableId)
        )
      )
      .orderBy((logs) => logs.createdAt)
      .limit(limit);

    return history;
  } catch (error) {
    console.error("[Audit] Failed to retrieve audit history:", error);
    return [];
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available");
    return [];
  }

  try {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy((l) => l.createdAt)
      .limit(limit);

    return logs;
  } catch (error) {
    console.error("[Audit] Failed to retrieve user audit logs:", error);
    return [];
  }
}
