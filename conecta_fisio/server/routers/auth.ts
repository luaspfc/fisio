/**
 * Authentication Router - FASE 1
 * Handles user authentication, role management, and audit logging
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "../audit";

export const authRouter = router({
  /**
   * Get current authenticated user
   */
  me: publicProcedure.query((opts) => {
    return opts.ctx.user;
  }),

  /**
   * Logout - Clear session cookie
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  /**
   * Get user audit logs (LGPD - Art. 18)
   * Allows users to see their own access history
   */
  getMyAuditLogs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, ctx.user.id))
        .orderBy((l) => l.createdAt)
        .limit(100);

      return logs;
    } catch (error) {
      console.error("Failed to retrieve audit logs:", error);
      throw new Error("Failed to retrieve audit logs");
    }
  }),

  /**
   * Admin: Get all audit logs for a specific user
   */
  getAuditLogsForUser: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null && "userId" in val) {
        return { userId: (val as any).userId as number };
      }
      throw new Error("Invalid input");
    })
    .query(async ({ ctx, input }) => {
      // Only admins can view other users' audit logs
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const logs = await db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.userId, input.userId))
          .orderBy((l) => l.createdAt)
          .limit(100);

        return logs;
      } catch (error) {
        console.error("Failed to retrieve audit logs:", error);
        throw new Error("Failed to retrieve audit logs");
      }
    }),

  /**
   * Admin: Get all audit logs (system-wide)
   */
  getAllAuditLogs: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === "object" && val !== null && "limit" in val) {
        return { limit: Math.min((val as any).limit as number, 1000) };
      }
      return { limit: 100 };
    })
    .query(async ({ ctx, input }) => {
      // Only admins can view system-wide audit logs
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        const logs = await db
          .select()
          .from(auditLogs)
          .orderBy((l) => l.createdAt)
          .limit(input.limit);

        return logs;
      } catch (error) {
        console.error("Failed to retrieve audit logs:", error);
        throw new Error("Failed to retrieve audit logs");
      }
    }),
});

// Import at the end to avoid circular dependencies
import { auditLogs } from "../../drizzle/schema";
