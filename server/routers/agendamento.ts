/**
 * Agendamento Router - FASE 2
 * Handles appointment creation, listing, and management
 */

import { router, protectedProcedure } from "../_core/trpc";
import { AppointmentService } from "../services/appointmentService";
import { getDb } from "../db";
import { agendamentos, fisioterapeutas, pacientes } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const agendamentoRouter = router({
  /**
   * Create a new appointment
   * Validates availability, conflicts, and calculates travel time
   */
  criar: protectedProcedure
    .input(
      z.object({
        fisioterapeutaId: z.number().int().positive(),
        pacienteId: z.number().int().positive(),
        dataInicio: z.date(),
        enderecoBairroCidade: z.string().min(3).max(255),
        enderecoCep: z.string().regex(/^\d{5}-?\d{3}$/),
        enderecoLat: z.number().min(-90).max(90),
        enderecoLng: z.number().min(-180).max(180),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only fisioterapeutas and admins can create appointments
      if (ctx.user.role !== "fisioterapeuta" && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return await AppointmentService.criarAgendamento(ctx, input);
    }),

  /**
   * List appointments for the current user
   */
  listarMeus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    let agendamentosDoUsuario;

    if (ctx.user.role === "fisioterapeuta") {
      // Get fisioterapeuta ID
      const fisio = await db
        .select()
        .from(fisioterapeutas)
        .where(eq(fisioterapeutas.userId, ctx.user.id))
        .limit(1);

      if (fisio.length === 0) {
        return [];
      }

      agendamentosDoUsuario = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.fisioterapeutaId, fisio[0].id));
    } else if (ctx.user.role === "paciente") {
      // Get paciente ID
      const paciente = await db
        .select()
        .from(pacientes)
        .where(eq(pacientes.userId, ctx.user.id))
        .limit(1);

      if (paciente.length === 0) {
        return [];
      }

      agendamentosDoUsuario = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.pacienteId, paciente[0].id));
    } else if (ctx.user.role === "admin") {
      // Admins can see all appointments
      agendamentosDoUsuario = await db.select().from(agendamentos);
    } else {
      return [];
    }

    return agendamentosDoUsuario;
  }),

  /**
   * Get appointment details with related data
   */
  obter: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const agendamento = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.id, input.id))
        .limit(1);

      if (agendamento.length === 0) {
        throw new Error("Agendamento não encontrado");
      }

      const agend = agendamento[0];

      // Check authorization
      if (ctx.user.role === "paciente") {
        const paciente = await db
          .select()
          .from(pacientes)
          .where(eq(pacientes.userId, ctx.user.id))
          .limit(1);

        if (paciente.length === 0 || paciente[0].id !== agend.pacienteId) {
          throw new Error("Unauthorized");
        }
      } else if (ctx.user.role === "fisioterapeuta") {
        const fisio = await db
          .select()
          .from(fisioterapeutas)
          .where(eq(fisioterapeutas.userId, ctx.user.id))
          .limit(1);

        if (fisio.length === 0 || fisio[0].id !== agend.fisioterapeutaId) {
          throw new Error("Unauthorized");
        }
      }

      // Get related data
      const fisio = await db
        .select()
        .from(fisioterapeutas)
        .where(eq(fisioterapeutas.id, agend.fisioterapeutaId))
        .limit(1);

      const paciente = await db
        .select()
        .from(pacientes)
        .where(eq(pacientes.id, agend.pacienteId))
        .limit(1);

      return {
        ...agend,
        fisioterapeuta: fisio[0] || null,
        paciente: paciente[0] || null,
      };
    }),

  /**
   * Confirm an appointment
   */
  confirmar: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const agendamento = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.id, input.id))
        .limit(1);

      if (agendamento.length === 0) {
        throw new Error("Agendamento não encontrado");
      }

      // Only fisioterapeutas and admins can confirm
      if (ctx.user.role !== "fisioterapeuta" && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db
        .update(agendamentos)
        .set({ status: "confirmado" })
        .where(eq(agendamentos.id, input.id));

      return { success: true };
    }),

  /**
   * Cancel an appointment
   */
  cancelar: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        motivo: z.string().min(5).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const agendamento = await db
        .select()
        .from(agendamentos)
        .where(eq(agendamentos.id, input.id))
        .limit(1);

      if (agendamento.length === 0) {
        throw new Error("Agendamento não encontrado");
      }

      // Check authorization
      if (ctx.user.role === "paciente") {
        const paciente = await db
          .select()
          .from(pacientes)
          .where(eq(pacientes.userId, ctx.user.id))
          .limit(1);

        if (paciente.length === 0 || paciente[0].id !== agendamento[0].pacienteId) {
          throw new Error("Unauthorized");
        }
      } else if (ctx.user.role === "fisioterapeuta") {
        const fisio = await db
          .select()
          .from(fisioterapeutas)
          .where(eq(fisioterapeutas.userId, ctx.user.id))
          .limit(1);

        if (fisio.length === 0 || fisio[0].id !== agendamento[0].fisioterapeutaId) {
          throw new Error("Unauthorized");
        }
      }

      await db
        .update(agendamentos)
        .set({
          status: "cancelado",
          motivoCancelamento: input.motivo,
        })
        .where(eq(agendamentos.id, input.id));

      return { success: true };
    }),
});
