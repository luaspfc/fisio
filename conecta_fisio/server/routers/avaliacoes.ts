/**
 * Avaliações Router - FASE 5
 * Handles post-appointment evaluations and notifications
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { createEvaluation, getEvaluationSummary, getAutoSeals, getPendingEvaluations } from "../services/evaluationService";
import { TRPCError } from "@trpc/server";

export const avaliacoesRouter = router({
  /**
   * Create evaluation for completed appointment
   */
  criarAvaliacao: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number().int().positive(),
        nota: z.number().min(1).max(5),
        comentario: z.string().max(500),
        aspectos: z.object({
          profissionalismo: z.number().min(1).max(5),
          pontualidade: z.number().min(1).max(5),
          comunicacao: z.number().min(1).max(5),
          efetividade: z.number().min(1).max(5),
        }),
        recomendaria: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // TODO: Verify that user is the patient who had the appointment
      // TODO: Verify that appointment is completed
      // TODO: Verify that no evaluation already exists for this appointment

      const avaliacao = await createEvaluation({
        appointmentId: input.appointmentId,
        pacienteId: ctx.user.id,
        fisioterapeutaId: 1, // TODO: Get from appointment
        nota: input.nota,
        comentario: input.comentario,
        aspectos: input.aspectos,
        recomendaria: input.recomendaria,
      });

      return {
        success: true,
        message: "Avaliação registrada com sucesso",
        avaliacao,
      };
    }),

  /**
   * Get evaluation summary for fisioterapeuta (own dashboard)
   */
  obterResumoAvaliacoes: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // TODO: Verify that user is a fisioterapeuta
    // TODO: Get fisioterapeutaId from user

    const resumo = await getEvaluationSummary(1); // TODO: Use actual fisioterapeutaId

    return resumo;
  }),

  /**
   * Get average rating for fisioterapeuta (public view - no ranking)
   */
  obterNotaMedia: publicProcedure
    .input(z.object({ fisioterapeutaId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const { notaMedia, totalAvaliacoes, recomendacaoPercentual } = await getEvaluationSummary(
        input.fisioterapeutaId
      );

      return {
        notaMedia,
        totalAvaliacoes,
        recomendacaoPercentual,
      };
    }),

  /**
   * Get automatic seals for fisioterapeuta
   */
  obterSelos: publicProcedure
    .input(z.object({ fisioterapeutaId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const selos = await getAutoSeals(input.fisioterapeutaId);
      return { selos };
    }),

  /**
   * Get pending evaluations for paciente
   */
  obterAvaliacoesPendentes: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const avaliacoesPendentes = await getPendingEvaluations(ctx.user.id);

    return {
      total: avaliacoesPendentes.length,
      avaliacoes: avaliacoesPendentes,
    };
  }),

  /**
   * Get recent evaluations for fisioterapeuta (anonymized)
   */
  obterAvaliacoesRecentes: publicProcedure
    .input(z.object({ fisioterapeutaId: z.number().int().positive(), limite: z.number().default(5) }))
    .query(async ({ input }) => {
      const resumo = await getEvaluationSummary(input.fisioterapeutaId);

      // Return only anonymized evaluations
      return {
        avaliacoes: resumo.ultimasAvaliacoes.map((a) => ({
          nota: a.nota,
          comentario: a.comentario,
          dataAvaliacao: a.dataAvaliacao,
          anonimo: true,
        })),
      };
    }),
});
