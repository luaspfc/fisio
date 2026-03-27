/**
 * Notification Service - FASE 5
 * Handles automated reminders and notifications via WhatsApp, Email, and SMS
 */

import { TRPCError } from "@trpc/server";

export interface NotificationPayload {
  userId: number;
  type: "appointment_reminder" | "appointment_confirmed" | "appointment_cancelled" | "evaluation_pending";
  channel: "email" | "whatsapp" | "sms";
  data: Record<string, any>;
  scheduledFor?: Date;
}

export interface NotificationLog {
  id: number;
  userId: number;
  type: string;
  channel: string;
  status: "pending" | "sent" | "failed";
  recipient: string;
  content: string;
  sentAt?: Date;
  error?: string;
}

/**
 * Send appointment reminder 24 hours before
 */
export async function sendAppointmentReminder(
  appointmentId: number,
  fisioterapeutaName: string,
  pacienteName: string,
  pacienteEmail: string,
  pacienteTelefone: string,
  appointmentDate: Date,
  appointmentTime: string,
  endereco: string
): Promise<void> {
  const reminderDate = new Date(appointmentDate);
  reminderDate.setHours(reminderDate.getHours() - 24);

  const now = new Date();
  if (reminderDate <= now) {
    // Send immediately if already past 24h mark
    await sendNotification({
      channel: "email",
      recipient: pacienteEmail,
      subject: `Lembrete: Seu atendimento com ${fisioterapeutaName} é amanhã!`,
      body: generateAppointmentReminderEmail(
        pacienteName,
        fisioterapeutaName,
        appointmentDate,
        appointmentTime,
        endereco
      ),
    });

    // Send WhatsApp if available
    if (pacienteTelefone) {
      await sendNotification({
        channel: "whatsapp",
        recipient: pacienteTelefone,
        body: generateAppointmentReminderWhatsApp(
          pacienteName,
          fisioterapeutaName,
          appointmentDate,
          appointmentTime
        ),
      });
    }
  }
}

/**
 * Send appointment confirmation
 */
export async function sendAppointmentConfirmation(
  pacienteName: string,
  pacienteEmail: string,
  pacienteTelefone: string,
  fisioterapeutaName: string,
  appointmentDate: Date,
  appointmentTime: string,
  endereco: string,
  valor: number
): Promise<void> {
  await sendNotification({
    channel: "email",
    recipient: pacienteEmail,
    subject: `Confirmação: Seu atendimento com ${fisioterapeutaName}`,
    body: generateAppointmentConfirmationEmail(
      pacienteName,
      fisioterapeutaName,
      appointmentDate,
      appointmentTime,
      endereco,
      valor
    ),
  });

  if (pacienteTelefone) {
    await sendNotification({
      channel: "whatsapp",
      recipient: pacienteTelefone,
      body: generateAppointmentConfirmationWhatsApp(
        pacienteName,
        fisioterapeutaName,
        appointmentDate,
        appointmentTime
      ),
    });
  }
}

/**
 * Send evaluation request
 */
export async function sendEvaluationRequest(
  pacienteName: string,
  pacienteEmail: string,
  pacienteTelefone: string,
  fisioterapeutaName: string,
  appointmentDate: Date
): Promise<void> {
  await sendNotification({
    channel: "email",
    recipient: pacienteEmail,
    subject: `Avalie seu atendimento com ${fisioterapeutaName}`,
    body: generateEvaluationRequestEmail(pacienteName, fisioterapeutaName, appointmentDate),
  });

  if (pacienteTelefone) {
    await sendNotification({
      channel: "whatsapp",
      recipient: pacienteTelefone,
      body: generateEvaluationRequestWhatsApp(pacienteName, fisioterapeutaName),
    });
  }
}

/**
 * Generic notification sender
 */
async function sendNotification(params: {
  channel: "email" | "whatsapp" | "sms";
  recipient: string;
  subject?: string;
  body: string;
}): Promise<void> {
  try {
    switch (params.channel) {
      case "email":
        await sendEmail(params.recipient, params.subject || "", params.body);
        break;
      case "whatsapp":
        await sendWhatsApp(params.recipient, params.body);
        break;
      case "sms":
        await sendSMS(params.recipient, params.body);
        break;
    }
  } catch (error) {
    console.error(`[Notification] Failed to send ${params.channel}:`, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to send ${params.channel} notification`,
    });
  }
}

/**
 * Email sender (mock - integrate with SendGrid, AWS SES, etc)
 */
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  console.log(`[Email] To: ${to}, Subject: ${subject}`);
  console.log(`[Email] Body:\n${body}`);
  // TODO: Integrate with SendGrid or AWS SES
}

/**
 * WhatsApp sender (mock - integrate with Twilio, Zenvia, etc)
 */
async function sendWhatsApp(to: string, body: string): Promise<void> {
  console.log(`[WhatsApp] To: ${to}`);
  console.log(`[WhatsApp] Message:\n${body}`);
  // TODO: Integrate with Twilio or Zenvia
}

/**
 * SMS sender (mock - integrate with Twilio, AWS SNS, etc)
 */
async function sendSMS(to: string, body: string): Promise<void> {
  console.log(`[SMS] To: ${to}`);
  console.log(`[SMS] Message:\n${body}`);
  // TODO: Integrate with Twilio or AWS SNS
}

/**
 * Email templates
 */
function generateAppointmentReminderEmail(
  pacienteName: string,
  fisioterapeutaName: string,
  appointmentDate: Date,
  appointmentTime: string,
  endereco: string
): string {
  const dataFormatada = appointmentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
Olá ${pacienteName},

Este é um lembrete de que você tem um atendimento agendado para AMANHÃ!

📅 Data: ${dataFormatada}
⏰ Horário: ${appointmentTime}
👨‍⚕️ Profissional: ${fisioterapeutaName}
📍 Local: ${endereco}

Se você não puder comparecer, por favor cancele com antecedência para que outro paciente possa usar este horário.

Atenciosamente,
ConectaFisio
  `;
}

function generateAppointmentConfirmationEmail(
  pacienteName: string,
  fisioterapeutaName: string,
  appointmentDate: Date,
  appointmentTime: string,
  endereco: string,
  valor: number
): string {
  const dataFormatada = appointmentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
Olá ${pacienteName},

Seu atendimento foi confirmado com sucesso!

📅 Data: ${dataFormatada}
⏰ Horário: ${appointmentTime}
👨‍⚕️ Profissional: ${fisioterapeutaName}
📍 Local: ${endereco}
💰 Valor: R$ ${valor.toFixed(2)}

Você receberá um lembrete 24 horas antes do atendimento.

Obrigado por escolher ConectaFisio!
  `;
}

function generateEvaluationRequestEmail(
  pacienteName: string,
  fisioterapeutaName: string,
  appointmentDate: Date
): string {
  return `
Olá ${pacienteName},

Esperamos que você tenha tido uma excelente experiência com ${fisioterapeutaName}!

Gostaríamos de saber sua opinião sobre o atendimento. Sua avaliação nos ajuda a melhorar continuamente.

Clique aqui para avaliar: [Link para avaliação]

Obrigado!
ConectaFisio
  `;
}

/**
 * WhatsApp templates
 */
function generateAppointmentReminderWhatsApp(
  pacienteName: string,
  fisioterapeutaName: string,
  appointmentDate: Date,
  appointmentTime: string
): string {
  const dataFormatada = appointmentDate.toLocaleDateString("pt-BR");
  return `Oi ${pacienteName}! 👋\n\nLembrete: Seu atendimento com ${fisioterapeutaName} é AMANHÃ às ${appointmentTime} (${dataFormatada}).\n\nAté lá! 😊`;
}

function generateAppointmentConfirmationWhatsApp(
  pacienteName: string,
  fisioterapeutaName: string,
  appointmentDate: Date,
  appointmentTime: string
): string {
  const dataFormatada = appointmentDate.toLocaleDateString("pt-BR");
  return `Oi ${pacienteName}! ✅\n\nSeu atendimento com ${fisioterapeutaName} foi confirmado para ${dataFormatada} às ${appointmentTime}.\n\nAté logo! 💪`;
}

function generateEvaluationRequestWhatsApp(
  pacienteName: string,
  fisioterapeutaName: string
): string {
  return `Oi ${pacienteName}! 👋\n\nComo foi seu atendimento com ${fisioterapeutaName}? Sua avaliação é muito importante para nós! ⭐`;
}
