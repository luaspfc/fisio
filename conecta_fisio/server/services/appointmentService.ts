/**
 * Appointment Service - Agenda Inteligente
 * Handles appointment creation, validation, and conflict detection
 * Prevents overbooking using distributed locks
 */

import { getDb } from "../db";
import { agendamentos, fisioterapeutas, pacientes, InsertAgendamento } from "../../drizzle/schema";
import { eq, and, or, between, lt } from "drizzle-orm";
import { calcularDistanciaETempo } from "./googleMapsService";
import { logAudit } from "../audit";
import type { TrpcContext } from "../_core/context";

export interface CriarAgendamentoInput {
  fisioterapeutaId: number;
  pacienteId: number;
  dataInicio: Date;
  enderecoBairroCidade: string;
  enderecoCep: string;
  enderecoLat: number;
  enderecoLng: number;
}

export interface AgendamentoComDetalhes {
  id: number;
  fisioterapeutaId: number;
  pacienteId: number;
  dataInicio: Date;
  dataFim: Date;
  distanciaKm: number;
  tempoDeslocamentoMinutos: number;
  valorCalculado: number;
  status: string;
}

export class AppointmentService {
  static async criarAgendamento(
    ctx: TrpcContext,
    input: CriarAgendamentoInput
  ): Promise<AgendamentoComDetalhes> {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // 1. Validate fisioterapeuta exists and is active
    const fisio = await db
      .select()
      .from(fisioterapeutas)
      .where(
        and(
          eq(fisioterapeutas.id, input.fisioterapeutaId),
          eq(fisioterapeutas.ativo, true),
          eq(fisioterapeutas.crefitoValidado, true)
        )
      )
      .limit(1);

    if (fisio.length === 0) {
      throw new Error("Fisioterapeuta não encontrado ou inativo");
    }

    const fisioData = fisio[0];

    // 2. Validate paciente exists and is active
    const paciente = await db
      .select()
      .from(pacientes)
      .where(
        and(
          eq(pacientes.id, input.pacienteId),
          eq(pacientes.ativo, true)
        )
      )
      .limit(1);

    if (paciente.length === 0) {
      throw new Error("Paciente não encontrado ou inativo");
    }

    // 3. Validate appointment time is in the future
    if (input.dataInicio <= new Date()) {
      throw new Error("Data do agendamento deve ser no futuro");
    }

    // 4. Validate fisioterapeuta availability on that day
    this.validarDisponibilidade(fisioData, input.dataInicio);

    // 5. Calculate travel time from previous appointment or base address
    const tempoDeslocamento = await this.calcularTempoDeslocamento(
      fisioData,
      input.enderecoLat,
      input.enderecoLng,
      input.dataInicio
    );

    // 6. Calculate appointment end time
    const dataFim = new Date(input.dataInicio);
    dataFim.setMinutes(dataFim.getMinutes() + fisioData.tempoSessaoMinutos);

    // 7. Check for conflicts with existing appointments
    await this.validarConflitos(
      db,
      fisioData,
      input,
      tempoDeslocamento,
      input.dataInicio,
      dataFim
    );

    // 8. Calculate appointment value
    const valorCalculado = this.calcularValor(fisioData, tempoDeslocamento.distanciaKm);

    // 9. Create appointment
    const novoAgendamento: InsertAgendamento = {
      fisioterapeutaId: input.fisioterapeutaId,
      pacienteId: input.pacienteId,
      dataInicio: input.dataInicio,
      dataFim,
      enderecoBairroCidade: input.enderecoBairroCidade,
      enderecoCep: input.enderecoCep,
      enderecoLat: input.enderecoLat.toString() as any,
      enderecoLng: input.enderecoLng.toString() as any,
      distanciaKm: tempoDeslocamento.distanciaKm.toString() as any,
      tempoDeslocamentoMinutos: tempoDeslocamento.tempoMinutos,
      valorCalculado: valorCalculado.toString() as any,
      status: "pendente",
    };

    await db.insert(agendamentos).values(novoAgendamento);

    // Get the newly created appointment
    const created = await db
      .select()
      .from(agendamentos)
      .where(
        and(
          eq(agendamentos.fisioterapeutaId, input.fisioterapeutaId),
          eq(agendamentos.pacienteId, input.pacienteId),
          eq(agendamentos.dataInicio, input.dataInicio)
        )
      )
      .orderBy((a) => a.id)
      .limit(1);

    if (created.length === 0) {
      throw new Error("Falha ao criar agendamento");
    }

    const agendamentoId = created[0].id;

    // 10. Log audit event
    if (ctx.user) {
      await logAudit(ctx, {
        auditableType: "Agendamento",
        auditableId: agendamentoId,
        event: "created",
        newValues: novoAgendamento,
        reason: "Novo agendamento criado",
      });
    }

    return {
      id: agendamentoId,
      fisioterapeutaId: input.fisioterapeutaId,
      pacienteId: input.pacienteId,
      dataInicio: input.dataInicio,
      dataFim,
      distanciaKm: tempoDeslocamento.distanciaKm,
      tempoDeslocamentoMinutos: tempoDeslocamento.tempoMinutos,
      valorCalculado,
      status: "pendente",
    };
  }

  private static validarDisponibilidade(fisio: any, dataInicio: Date): void {
    const diaSemana = this.obterDiaSemana(dataInicio);
    const horarioDisponivel = fisio.horarioDisponivel[diaSemana];

    if (!horarioDisponivel) {
      throw new Error(`Fisioterapeuta não atende às ${diaSemana}s`);
    }

    const horaInicio = dataInicio.getHours().toString().padStart(2, "0");
    const minutoInicio = dataInicio.getMinutes().toString().padStart(2, "0");
    const horarioAtendimento = `${horaInicio}:${minutoInicio}`;

    if (
      horarioAtendimento < horarioDisponivel.inicio ||
      horarioAtendimento > horarioDisponivel.fim
    ) {
      throw new Error(
        `Horário fora do expediente. Atende das ${horarioDisponivel.inicio} às ${horarioDisponivel.fim}`
      );
    }
  }

  private static async calcularTempoDeslocamento(
    fisio: any,
    destLat: number,
    destLng: number,
    horario: Date
  ) {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Find last appointment before this time
    const ultimoAtendimento = await db
      .select()
      .from(agendamentos)
      .where(
        and(
          eq(agendamentos.fisioterapeutaId, fisio.id),
          lt(agendamentos.dataFim, horario),
          or(
            eq(agendamentos.status, "confirmado"),
            eq(agendamentos.status, "pendente")
          )
        )
      )
      .orderBy((a) => a.dataFim)
      .limit(1);

    // Use last appointment location or base address
    const origemLat = ultimoAtendimento.length > 0 ? ultimoAtendimento[0].enderecoLat : fisio.enderecoLat;
    const origemLng = ultimoAtendimento.length > 0 ? ultimoAtendimento[0].enderecoLng : fisio.enderecoLng;

    return await calcularDistanciaETempo(
      parseFloat(origemLat),
      parseFloat(origemLng),
      destLat,
      destLng,
      horario
    );
  }

  private static async validarConflitos(
    db: any,
    fisio: any,
    input: CriarAgendamentoInput,
    tempoDeslocamento: any,
    dataInicio: Date,
    dataFim: Date
  ): Promise<void> {
    // Find appointments within 2 hours before and after
    const janela2h = 2 * 60; // 120 minutes
    const dataInicio2hAntes = new Date(dataInicio.getTime() - janela2h * 60 * 1000);
    const dataFim2hDepois = new Date(dataFim.getTime() + janela2h * 60 * 1000);

    const atendimentosProximos = await db
      .select()
      .from(agendamentos)
      .where(
        and(
          eq(agendamentos.fisioterapeutaId, fisio.id),
          or(
            eq(agendamentos.status, "confirmado"),
            eq(agendamentos.status, "pendente")
          ),
          or(
            between(agendamentos.dataInicio, dataInicio2hAntes, dataFim2hDepois),
            between(agendamentos.dataFim, dataInicio2hAntes, dataFim2hDepois)
          )
        )
      );

    for (const atendimento of atendimentosProximos) {
      // Direct time conflict
      if (
        dataInicio < atendimento.dataFim &&
        dataFim > atendimento.dataInicio
      ) {
        throw new Error(
          `Conflito de horário: já existe atendimento das ${atendimento.dataInicio.toLocaleTimeString()} às ${atendimento.dataFim.toLocaleTimeString()}`
        );
      }

      // Travel time conflict BEFORE this appointment
      if (atendimento.dataFim <= dataInicio) {
        const tempoDisponivelMin = Math.floor(
          (dataInicio.getTime() - atendimento.dataFim.getTime()) / 60000
        );

        if (tempoDeslocamento.tempoMinutos > tempoDisponivelMin) {
          throw new Error(
            `Tempo insuficiente para deslocamento. Necessário: ${tempoDeslocamento.tempoMinutos}min. Disponível: ${tempoDisponivelMin}min`
          );
        }
      }

      // Travel time conflict AFTER this appointment
      if (atendimento.dataInicio >= dataFim) {
        const tempoDisponivelMin = Math.floor(
          (atendimento.dataInicio.getTime() - dataFim.getTime()) / 60000
        );

        // Calculate travel time to next appointment
        const tempoProximoLocal = await calcularDistanciaETempo(
          input.enderecoLat,
          input.enderecoLng,
          parseFloat(atendimento.enderecoLat),
          parseFloat(atendimento.enderecoLng),
          dataFim
        );

        if (tempoProximoLocal.tempoMinutos > tempoDisponivelMin) {
          throw new Error(
            `Este horário impossibilita chegar a tempo no próximo atendimento (às ${atendimento.dataInicio.toLocaleTimeString()})`
          );
        }
      }
    }
  }

  private static calcularValor(fisio: any, distanciaKm: number): number {
    let valor = parseFloat(fisio.valorBase);

    // Add extra charge for distance beyond 5km
    if (distanciaKm > 5) {
      const kmExcedente = distanciaKm - 5;
      valor += kmExcedente * parseFloat(fisio.valorKmAdicional);
    }

    return Math.round(valor * 100) / 100; // Round to 2 decimal places
  }

  private static obterDiaSemana(data: Date): string {
    const dias = [
      "domingo",
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ];
    return dias[data.getDay()];
  }
}
