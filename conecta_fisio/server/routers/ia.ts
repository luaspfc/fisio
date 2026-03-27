/**
 * IA Router - FASE 6
 * Integração com microserviço Python para Suporte à Decisão Clínica
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Configuração do serviço de IA
const IA_SERVICE_URL = process.env.IA_SERVICE_URL || "http://localhost:8000";

interface PacienteDataIA {
  id: number;
  idade: number;
  genero: string;
  diagnostico: string;
  historico_clinico: string;
  medicacoes: string[];
  comorbidades: string[];
  sessoes_completadas: number;
  evolucao_ultima_sessao: string;
  objetivo_terapeutico: string;
}

/**
 * Chama o serviço de IA para obter sugestões de conduta
 */
async function chamarServicoIA(endpoint: string, dados: PacienteDataIA): Promise<any> {
  try {
    const response = await fetch(`${IA_SERVICE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      throw new Error(`IA Service error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[IA Service] Error calling ${endpoint}:`, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro ao consultar serviço de IA",
    });
  }
}

export const iaRouter = router({
  /**
   * Obter sugestões de conduta clínica baseadas em artigos científicos
   */
  obterSugestoesConduta: protectedProcedure
    .input(
      z.object({
        pacienteId: z.number().int().positive(),
        diagnostico: z.string().min(3),
        historico_clinico: z.string(),
        medicacoes: z.array(z.string()).default([]),
        comorbidades: z.array(z.string()).default([]),
        sessoes_completadas: z.number().int().default(0),
        evolucao_ultima_sessao: z.string(),
        objetivo_terapeutico: z.string(),
        idade: z.number().int().min(0).max(150),
        genero: z.enum(["M", "F", "Outro"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // TODO: Verificar se usuário é fisioterapeuta ou admin
      // TODO: Verificar se paciente pertence ao fisioterapeuta

      const dadosPaciente: PacienteDataIA = {
        id: input.pacienteId,
        idade: input.idade,
        genero: input.genero,
        diagnostico: input.diagnostico,
        historico_clinico: input.historico_clinico,
        medicacoes: input.medicacoes,
        comorbidades: input.comorbidades,
        sessoes_completadas: input.sessoes_completadas,
        evolucao_ultima_sessao: input.evolucao_ultima_sessao,
        objetivo_terapeutico: input.objetivo_terapeutico,
      };

      const resultado = await chamarServicoIA("/api/v1/sugestoes-conduta", dadosPaciente);

      return {
        success: true,
        pacienteId: input.pacienteId,
        sugestoes: resultado.sugestoes,
        totalArtigosConsultados: resultado.total_artigos_consultados,
        timestamp: resultado.timestamp,
      };
    }),

  /**
   * Obter previsão de sucesso da reabilitação usando Deep Learning
   */
  obterPredicaoReabilitacao: protectedProcedure
    .input(
      z.object({
        pacienteId: z.number().int().positive(),
        diagnostico: z.string().min(3),
        historico_clinico: z.string(),
        medicacoes: z.array(z.string()).default([]),
        comorbidades: z.array(z.string()).default([]),
        sessoes_completadas: z.number().int().default(0),
        evolucao_ultima_sessao: z.string(),
        objetivo_terapeutico: z.string(),
        idade: z.number().int().min(0).max(150),
        genero: z.enum(["M", "F", "Outro"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // TODO: Verificar se usuário é fisioterapeuta ou admin

      const dadosPaciente: PacienteDataIA = {
        id: input.pacienteId,
        idade: input.idade,
        genero: input.genero,
        diagnostico: input.diagnostico,
        historico_clinico: input.historico_clinico,
        medicacoes: input.medicacoes,
        comorbidades: input.comorbidades,
        sessoes_completadas: input.sessoes_completadas,
        evolucao_ultima_sessao: input.evolucao_ultima_sessao,
        objetivo_terapeutico: input.objetivo_terapeutico,
      };

      const resultado = await chamarServicoIA(
        "/api/v1/predicao-reabilitacao",
        dadosPaciente
      );

      return {
        success: true,
        pacienteId: input.pacienteId,
        predicao: resultado.predicao,
        timestamp: resultado.timestamp,
      };
    }),

  /**
   * Obter recomendações de leitura personalizadas
   */
  obterRecomendacoesLeitura: protectedProcedure
    .input(
      z.object({
        pacienteId: z.number().int().positive(),
        diagnostico: z.string().min(3),
        historico_clinico: z.string(),
        medicacoes: z.array(z.string()).default([]),
        comorbidades: z.array(z.string()).default([]),
        sessoes_completadas: z.number().int().default(0),
        evolucao_ultima_sessao: z.string(),
        objetivo_terapeutico: z.string(),
        idade: z.number().int().min(0).max(150),
        genero: z.enum(["M", "F", "Outro"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // TODO: Verificar se usuário é fisioterapeuta ou admin

      const dadosPaciente: PacienteDataIA = {
        id: input.pacienteId,
        idade: input.idade,
        genero: input.genero,
        diagnostico: input.diagnostico,
        historico_clinico: input.historico_clinico,
        medicacoes: input.medicacoes,
        comorbidades: input.comorbidades,
        sessoes_completadas: input.sessoes_completadas,
        evolucao_ultima_sessao: input.evolucao_ultima_sessao,
        objetivo_terapeutico: input.objetivo_terapeutico,
      };

      const resultado = await chamarServicoIA(
        "/api/v1/recomendacoes-leitura",
        dadosPaciente
      );

      return {
        success: true,
        pacienteId: input.pacienteId,
        recomendacoes: resultado.recomendacoes,
        totalRecomendacoes: resultado.total_recomendacoes,
        timestamp: resultado.timestamp,
      };
    }),

  /**
   * Análise completa: sugestões + previsão + recomendações
   */
  obterAnaliseCompleta: protectedProcedure
    .input(
      z.object({
        pacienteId: z.number().int().positive(),
        diagnostico: z.string().min(3),
        historico_clinico: z.string(),
        medicacoes: z.array(z.string()).default([]),
        comorbidades: z.array(z.string()).default([]),
        sessoes_completadas: z.number().int().default(0),
        evolucao_ultima_sessao: z.string(),
        objetivo_terapeutico: z.string(),
        idade: z.number().int().min(0).max(150),
        genero: z.enum(["M", "F", "Outro"]),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // TODO: Verificar se usuário é fisioterapeuta ou admin

      const dadosPaciente: PacienteDataIA = {
        id: input.pacienteId,
        idade: input.idade,
        genero: input.genero,
        diagnostico: input.diagnostico,
        historico_clinico: input.historico_clinico,
        medicacoes: input.medicacoes,
        comorbidades: input.comorbidades,
        sessoes_completadas: input.sessoes_completadas,
        evolucao_ultima_sessao: input.evolucao_ultima_sessao,
        objetivo_terapeutico: input.objetivo_terapeutico,
      };

      const resultado = await chamarServicoIA("/api/v1/analise-completa", dadosPaciente);

      return {
        success: true,
        pacienteId: input.pacienteId,
        sugestoes: resultado.sugestoes_conduta,
        predicao: resultado.predicao_reabilitacao,
        recomendacoes: resultado.recomendacoes_leitura,
        timestamp: resultado.timestamp,
      };
    }),

  /**
   * Listar artigos científicos disponíveis
   */
  listarArtigos: protectedProcedure
    .input(
      z.object({
        diagnostico: z.string().optional(),
        limite: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const params = new URLSearchParams();
        if (input.diagnostico) {
          params.append("diagnostico", input.diagnostico);
        }
        params.append("limite", input.limite.toString());

        const response = await fetch(`${IA_SERVICE_URL}/api/v1/artigos?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`IA Service error: ${response.statusText}`);
        }

        const resultado = await response.json();

        return {
          success: true,
          total: resultado.total,
          artigos: resultado.artigos,
          timestamp: resultado.timestamp,
        };
      } catch (error) {
        console.error("[IA Service] Error listing articles:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar artigos científicos",
        });
      }
    }),
});
