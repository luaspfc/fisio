/**
 * Prontuário Router - FASE 3
 * Handles medical records with encryption and access control
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { ProntuarioService } from "../services/prontuarioService";
import { z } from "zod";

export const prontuarioRouter = router({
  /**
   * Create a new prontuário
   */
  criar: protectedProcedure
    .input(
      z.object({
        pacienteId: z.number().int().positive(),
        avaliacao: z.string().min(10).max(5000),
        diagnostico: z.string().min(5).max(2000).optional(),
        planoTerapeutico: z.string().min(10).max(5000).optional(),
        observacoes: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ProntuarioService.criarProntuario(ctx, input);
    }),

  /**
   * Get prontuário with decrypted data
   */
  obter: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      return await ProntuarioService.obterProntuario(ctx, input.id);
    }),

  /**
   * Add evolution to prontuário
   */
  adicionarEvolucao: protectedProcedure
    .input(
      z.object({
        prontuarioId: z.number().int().positive(),
        agendamentoId: z.number().int().positive().optional(),
        conteudo: z.string().min(10).max(5000),
        resultadoSessao: z.string().max(2000).optional(),
        proxisoPassos: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ProntuarioService.adicionarEvolucao(ctx, input);
    }),

  /**
   * Share prontuário with another user
   */
  compartilhar: protectedProcedure
    .input(
      z.object({
        prontuarioId: z.number().int().positive(),
        compartilhadoCom: z.number().int().positive().optional(),
        permissoes: z.array(z.enum(["view", "download", "print"])).min(1),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = await ProntuarioService.compartilharProntuario(ctx, input);
      return { token, shareUrl: `/share/${token}` };
    }),

  /**
   * Access prontuário via share token (public)
   */
  acessarViaToken: publicProcedure
    .input(z.object({ token: z.string().length(64) }))
    .query(async ({ input }) => {
      return await ProntuarioService.acessarViaToken(input.token);
    }),
});
