/**
 * Prontuário Service - FASE 3
 * Handles medical records with encryption and access control
 */

import { getDb } from "../db";
import {
  prontuarios,
  evolucoes,
  shareTokens,
  pacientes,
  fisioterapeutas,
  InsertProntuario,
  InsertEvolucao,
  InsertShareToken,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { encryptData, decryptData } from "../encryption";
import { logAudit } from "../audit";
import type { TrpcContext } from "../_core/context";
import { nanoid } from "nanoid";

export interface CriarProntuarioInput {
  pacienteId: number;
  avaliacao: string;
  diagnostico?: string;
  planoTerapeutico?: string;
  observacoes?: string;
}

export interface AdicionarEvolucaoInput {
  prontuarioId: number;
  agendamentoId?: number;
  conteudo: string;
  resultadoSessao?: string;
  proxisoPassos?: string;
}

export interface CompartilharProntuarioInput {
  prontuarioId: number;
  compartilhadoCom?: number;
  permissoes: string[];
  expiresAt?: Date;
}

export class ProntuarioService {
  /**
   * Create a new medical record (prontuário)
   */
  static async criarProntuario(
    ctx: TrpcContext,
    input: CriarProntuarioInput
  ): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    if (!ctx.user) {
      throw new Error("User not authenticated");
    }

    // Only fisioterapeutas can create records
    if (ctx.user.role !== "fisioterapeuta" && ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Get fisioterapeuta ID
    const fisio = await db
      .select()
      .from(fisioterapeutas)
      .where(eq(fisioterapeutas.userId, ctx.user.id))
      .limit(1);

    if (fisio.length === 0 && ctx.user.role !== "admin") {
      throw new Error("Fisioterapeuta not found");
    }

    const fisioId = fisio.length > 0 ? fisio[0].id : 1;

    // Validate paciente exists
    const paciente = await db
      .select()
      .from(pacientes)
      .where(eq(pacientes.id, input.pacienteId))
      .limit(1);

    if (paciente.length === 0) {
      throw new Error("Paciente not found");
    }

    // Encrypt sensitive fields
    const novoProntuario: InsertProntuario = {
      pacienteId: input.pacienteId,
      fisioterapeutaId: fisioId,
      avaliacao: encryptData(input.avaliacao),
      diagnostico: input.diagnostico ? encryptData(input.diagnostico) : null,
      planoTerapeutico: input.planoTerapeutico
        ? encryptData(input.planoTerapeutico)
        : null,
      observacoes: input.observacoes ? encryptData(input.observacoes) : null,
      ativo: true,
    };

    await db.insert(prontuarios).values(novoProntuario);

    // Get the created record
    const created = await db
      .select()
      .from(prontuarios)
      .where(
        and(
          eq(prontuarios.pacienteId, input.pacienteId),
          eq(prontuarios.fisioterapeutaId, fisioId)
        )
      )
      .orderBy((p) => p.id)
      .limit(1);

    if (created.length === 0) {
      throw new Error("Failed to create prontuário");
    }

    const prontuarioId = created[0].id;

    // Log audit event
    await logAudit(ctx, {
      auditableType: "Prontuario",
      auditableId: prontuarioId,
      event: "created",
      newValues: { pacienteId: input.pacienteId, fisioterapeutaId: fisioId },
      reason: "Novo prontuário criado",
    });

    return { id: prontuarioId, ...novoProntuario };
  }

  /**
   * Get prontuário with decrypted data (with access control)
   */
  static async obterProntuario(ctx: TrpcContext, prontuarioId: number): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    if (!ctx.user) {
      throw new Error("User not authenticated");
    }

    const pront = await db
      .select()
      .from(prontuarios)
      .where(eq(prontuarios.id, prontuarioId))
      .limit(1);

    if (pront.length === 0) {
      throw new Error("Prontuário not found");
    }

    const prontuario = pront[0];

    // Check access control
    if (ctx.user.role === "paciente") {
      const paciente = await db
        .select()
        .from(pacientes)
        .where(eq(pacientes.userId, ctx.user.id))
        .limit(1);

      if (paciente.length === 0 || paciente[0].id !== prontuario.pacienteId) {
        throw new Error("Unauthorized");
      }
    } else if (ctx.user.role === "fisioterapeuta") {
      const fisio = await db
        .select()
        .from(fisioterapeutas)
        .where(eq(fisioterapeutas.userId, ctx.user.id))
        .limit(1);

      if (fisio.length === 0 || fisio[0].id !== prontuario.fisioterapeutaId) {
        throw new Error("Unauthorized");
      }
    }

    // Log audit event (LGPD - Art. 5º, II)
    await logAudit(ctx, {
      auditableType: "Prontuario",
      auditableId: prontuarioId,
      event: "viewed",
      reason: "Prontuário visualizado",
    });

    // Decrypt sensitive fields
    return {
      ...prontuario,
      avaliacao: decryptData(prontuario.avaliacao),
      diagnostico: prontuario.diagnostico ? decryptData(prontuario.diagnostico) : null,
      planoTerapeutico: prontuario.planoTerapeutico
        ? decryptData(prontuario.planoTerapeutico)
        : null,
      observacoes: prontuario.observacoes ? decryptData(prontuario.observacoes) : null,
    };
  }

  /**
   * Add evolution to prontuário
   */
  static async adicionarEvolucao(
    ctx: TrpcContext,
    input: AdicionarEvolucaoInput
  ): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    if (!ctx.user) {
      throw new Error("User not authenticated");
    }

    // Verify prontuário exists and user has access
    await this.obterProntuario(ctx, input.prontuarioId);

    // Encrypt sensitive fields
    const novaEvolucao: InsertEvolucao = {
      prontuarioId: input.prontuarioId,
      agendamentoId: input.agendamentoId || null,
      conteudo: encryptData(input.conteudo),
      resultadoSessao: input.resultadoSessao ? encryptData(input.resultadoSessao) : null,
      proxisoPassos: input.proxisoPassos ? encryptData(input.proxisoPassos) : null,
      dataEvolucao: new Date(),
    };

    await db.insert(evolucoes).values(novaEvolucao);

    // Get the created record
    const created = await db
      .select()
      .from(evolucoes)
      .where(eq(evolucoes.prontuarioId, input.prontuarioId))
      .orderBy((e) => e.id)
      .limit(1);

    if (created.length === 0) {
      throw new Error("Failed to create evolução");
    }

    const evolucaoId = created[0].id;

    // Log audit event
    await logAudit(ctx, {
      auditableType: "Evolucao",
      auditableId: evolucaoId,
      event: "created",
      newValues: { prontuarioId: input.prontuarioId },
      reason: "Nova evolução adicionada",
    });

    return { id: evolucaoId, ...novaEvolucao };
  }

  /**
   * Share prontuário with another user (generates token)
   */
  static async compartilharProntuario(
    ctx: TrpcContext,
    input: CompartilharProntuarioInput
  ): Promise<string> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    if (!ctx.user) {
      throw new Error("User not authenticated");
    }

    // Verify prontuário exists and user has access
    await this.obterProntuario(ctx, input.prontuarioId);

    // Generate unique token
    const token = nanoid(64);

    const novoShare: InsertShareToken = {
      prontuarioId: input.prontuarioId,
      token,
      compartilhadoPor: ctx.user.id,
      compartilhadoCom: input.compartilhadoCom || null,
      permissoes: input.permissoes,
      expiresAt: input.expiresAt || null,
      ativo: true,
    };

    await db.insert(shareTokens).values(novoShare);

    // Log audit event
    await logAudit(ctx, {
      auditableType: "ShareToken",
      auditableId: 0,
      event: "created",
      newValues: {
        prontuarioId: input.prontuarioId,
        compartilhadoCom: input.compartilhadoCom,
        permissoes: input.permissoes,
      },
      reason: "Prontuário compartilhado",
    });

    return token;
  }

  /**
   * Access prontuário via share token
   */
  static async acessarViaToken(token: string): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const share = await db
      .select()
      .from(shareTokens)
      .where(
        and(
          eq(shareTokens.token, token),
          eq(shareTokens.ativo, true)
        )
      )
      .limit(1);

    if (share.length === 0) {
      throw new Error("Invalid or expired share token");
    }

    const shareRecord = share[0];

    // Check expiration
    if (shareRecord.expiresAt && shareRecord.expiresAt < new Date()) {
      throw new Error("Share token expired");
    }

    // Get prontuário
    const pront = await db
      .select()
      .from(prontuarios)
      .where(eq(prontuarios.id, shareRecord.prontuarioId))
      .limit(1);

    if (pront.length === 0) {
      throw new Error("Prontuário not found");
    }

    // Update access count
    await db
      .update(shareTokens)
      .set({
        acessoCount: (shareRecord.acessoCount || 0) + 1,
        ultimoAcesso: new Date(),
      })
      .where(eq(shareTokens.id, shareRecord.id));

    // Decrypt sensitive fields
    const prontuario = pront[0];
    return {
      ...prontuario,
      avaliacao: decryptData(prontuario.avaliacao),
      diagnostico: prontuario.diagnostico ? decryptData(prontuario.diagnostico) : null,
      planoTerapeutico: prontuario.planoTerapeutico
        ? decryptData(prontuario.planoTerapeutico)
        : null,
      observacoes: prontuario.observacoes ? decryptData(prontuario.observacoes) : null,
    };
  }
}
