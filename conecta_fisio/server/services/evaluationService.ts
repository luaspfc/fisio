/**
 * Evaluation Service - FASE 5
 * Handles ethical post-appointment evaluations without public rankings
 */

import { TRPCError } from "@trpc/server";

export interface EvaluationData {
  appointmentId: number;
  pacienteId: number;
  fisioterapeutaId: number;
  nota: number; // 1-5
  comentario: string;
  aspectos: {
    profissionalismo: number;
    pontualidade: number;
    comunicacao: number;
    efetividade: number;
  };
  recomendaria: boolean;
}

export interface AvaliacaoRecord {
  id: number;
  appointmentId: number;
  pacienteId: number;
  fisioterapeutaId: number;
  nota: number;
  comentario: string;
  aspectos: Record<string, number>;
  recomendaria: boolean;
  dataAvaliacao: Date;
  anonimo: boolean;
}

/**
 * Create evaluation for appointment
 */
export async function createEvaluation(data: EvaluationData): Promise<AvaliacaoRecord> {
  // Validate rating
  if (data.nota < 1 || data.nota > 5) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Nota deve estar entre 1 e 5",
    });
  }

  // Validate comment length
  if (data.comentario.length > 500) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Comentário não pode exceder 500 caracteres",
    });
  }

  // Validate aspect ratings
  Object.values(data.aspectos).forEach((valor) => {
    if (valor < 1 || valor > 5) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Todas as avaliações de aspectos devem estar entre 1 e 5",
      });
    }
  });

  // Create evaluation record
  const avaliacao: AvaliacaoRecord = {
    id: Math.floor(Math.random() * 1000000),
    appointmentId: data.appointmentId,
    pacienteId: data.pacienteId,
    fisioterapeutaId: data.fisioterapeutaId,
    nota: data.nota,
    comentario: data.comentario,
    aspectos: data.aspectos,
    recomendaria: data.recomendaria,
    dataAvaliacao: new Date(),
    anonimo: false,
  };

  // TODO: Save to database
  console.log("[Evaluation] Created:", avaliacao);

  return avaliacao;
}

/**
 * Get average rating for fisioterapeuta (without public ranking)
 * Only returns aggregate data, never individual rankings
 */
export async function getAverageRating(fisioterapeutaId: number): Promise<{
  notaMedia: number;
  totalAvaliacoes: number;
  aspectosMedia: Record<string, number>;
  recomendacaoPercentual: number;
}> {
  // TODO: Query database for evaluations
  const mockAvaliacoes = [
    { nota: 5, aspectos: { profissionalismo: 5, pontualidade: 5, comunicacao: 5, efetividade: 5 }, recomendaria: true },
    { nota: 4, aspectos: { profissionalismo: 4, pontualidade: 4, comunicacao: 5, efetividade: 4 }, recomendaria: true },
    { nota: 5, aspectos: { profissionalismo: 5, pontualidade: 4, comunicacao: 5, efetividade: 5 }, recomendaria: true },
  ];

  const notaMedia = mockAvaliacoes.reduce((sum, a) => sum + a.nota, 0) / mockAvaliacoes.length;
  const recomendacaoPercentual = (mockAvaliacoes.filter((a) => a.recomendaria).length / mockAvaliacoes.length) * 100;

  const aspectosMedia: Record<string, number> = {};
  Object.keys(mockAvaliacoes[0].aspectos).forEach((aspecto) => {
    const media = mockAvaliacoes.reduce((sum, a) => sum + a.aspectos[aspecto as keyof typeof a.aspectos], 0) / mockAvaliacoes.length;
    aspectosMedia[aspecto] = parseFloat(media.toFixed(2));
  });

  return {
    notaMedia: parseFloat(notaMedia.toFixed(2)),
    totalAvaliacoes: mockAvaliacoes.length,
    aspectosMedia,
    recomendacaoPercentual: parseFloat(recomendacaoPercentual.toFixed(1)),
  };
}

/**
 * Get automatic seals based on evaluation criteria
 * Ethical approach: seals are awarded, not withheld
 */
export async function getAutoSeals(fisioterapeutaId: number): Promise<string[]> {
  const { notaMedia, totalAvaliacoes, recomendacaoPercentual } = await getAverageRating(
    fisioterapeutaId
  );

  const seals: string[] = [];

  // Award seals based on positive criteria
  if (notaMedia >= 4.5 && totalAvaliacoes >= 10) {
    seals.push("Excelente Avaliação");
  }

  if (recomendacaoPercentual >= 90 && totalAvaliacoes >= 5) {
    seals.push("Altamente Recomendado");
  }

  if (totalAvaliacoes >= 20) {
    seals.push("Profissional Experiente");
  }

  if (notaMedia >= 4.0 && totalAvaliacoes >= 5) {
    seals.push("Profissional Confiável");
  }

  return seals;
}

/**
 * Get evaluation summary for fisioterapeuta (for their own dashboard only)
 */
export async function getEvaluationSummary(fisioterapeutaId: number): Promise<{
  notaMedia: number;
  totalAvaliacoes: number;
  distribuicaoNotas: Record<number, number>;
  aspectosMedia: Record<string, number>;
  recomendacaoPercentual: number;
  selos: string[];
  ultimasAvaliacoes: AvaliacaoRecord[];
}> {
  const { notaMedia, totalAvaliacoes, aspectosMedia, recomendacaoPercentual } =
    await getAverageRating(fisioterapeutaId);
  const selos = await getAutoSeals(fisioterapeutaId);

  // Mock distribution
  const distribuicaoNotas: Record<number, number> = {
    1: 0,
    2: 0,
    3: 2,
    4: 8,
    5: 14,
  };

  // Mock recent evaluations (anonymized)
  const ultimasAvaliacoes: AvaliacaoRecord[] = [
    {
      id: 1,
      appointmentId: 1,
      pacienteId: 1,
      fisioterapeutaId,
      nota: 5,
      comentario: "Profissional muito competente e atencioso.",
      aspectos: { profissionalismo: 5, pontualidade: 5, comunicacao: 5, efetividade: 5 },
      recomendaria: true,
      dataAvaliacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      anonimo: true,
    },
    {
      id: 2,
      appointmentId: 2,
      pacienteId: 2,
      fisioterapeutaId,
      nota: 4,
      comentario: "Bom atendimento, muito dedicado.",
      aspectos: { profissionalismo: 4, pontualidade: 4, comunicacao: 5, efetividade: 4 },
      recomendaria: true,
      dataAvaliacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      anonimo: true,
    },
  ];

  return {
    notaMedia,
    totalAvaliacoes,
    distribuicaoNotas,
    aspectosMedia,
    recomendacaoPercentual,
    selos,
    ultimasAvaliacoes,
  };
}

/**
 * Check if evaluation is due for appointment
 */
export async function isEvaluationDue(appointmentId: number): Promise<boolean> {
  // TODO: Query database to check if appointment is completed and not yet evaluated
  // For now, return true if appointment is in the past
  return true;
}

/**
 * Get pending evaluations for paciente
 */
export async function getPendingEvaluations(pacienteId: number): Promise<AvaliacaoRecord[]> {
  // TODO: Query database for completed appointments without evaluations
  return [];
}
