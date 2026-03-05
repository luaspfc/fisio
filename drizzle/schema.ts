import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, datetime, bigint, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "fisioterapeuta", "paciente"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ========== AUDIT LOG (LGPD) ==========
export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  auditableType: varchar("auditable_type", { length: 255 }).notNull(),
  auditableId: int("auditable_id").notNull(),
  event: mysqlEnum("event", ["created", "updated", "viewed", "deleted", "shared"]).notNull(),
  userId: int("user_id").notNull().references(() => users.id),
  userType: varchar("user_type", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  oldValues: json("old_values").$type<Record<string, unknown>>(),
  newValues: json("new_values").$type<Record<string, unknown>>(),
  modifiedFields: json("modified_fields").$type<string[]>(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  auditableIdx: index("idx_audit_auditable").on(table.auditableType, table.auditableId),
  userIdIdx: index("idx_audit_user_id").on(table.userId),
  createdAtIdx: index("idx_audit_created_at").on(table.createdAt),
  eventIdx: index("idx_audit_event").on(table.event),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ========== FISIOTERAPEUTA ==========
export const fisioterapeutas = mysqlTable("fisioterapeutas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  crefito: varchar("crefito", { length: 20 }).notNull().unique(),
  crefitoValidado: boolean("crefito_validado").default(false).notNull(),
  crefitoValidadoEm: timestamp("crefito_validado_em"),
  crefitoValidadoPor: int("crefito_validado_por").references(() => users.id),
  especialidades: json("especialidades").$type<string[]>().notNull(),
  enderecoBairroCidade: varchar("endereco_bairro_cidade", { length: 255 }).notNull(),
  enderecoCep: varchar("endereco_cep", { length: 10 }).notNull(),
  enderecoLat: decimal("endereco_lat", { precision: 10, scale: 8 }).notNull(),
  enderecoLng: decimal("endereco_lng", { precision: 11, scale: 8 }).notNull(),
  raioAtendimentoKm: int("raio_atendimento_km").notNull(),
  horarioDisponivel: json("horario_disponivel").$type<Record<string, { inicio: string; fim: string }>>().notNull(),
  tempoSessaoMinutos: int("tempo_sessao_minutos").notNull(),
  valorBase: decimal("valor_base", { precision: 10, scale: 2 }).notNull(),
  valorKmAdicional: decimal("valor_km_adicional", { precision: 10, scale: 2 }).notNull(),
  hotmartCustomerId: varchar("hotmart_customer_id", { length: 255 }),
  assinaturaAtiva: boolean("assinatura_ativa").default(false).notNull(),
  assinaturaBloqueadaEm: timestamp("assinatura_bloqueada_em"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_fisio_user_id").on(table.userId),
  crefitoIdx: index("idx_fisio_crefito").on(table.crefito),
}));

export type Fisioterapeuta = typeof fisioterapeutas.$inferSelect;
export type InsertFisioterapeuta = typeof fisioterapeutas.$inferInsert;

// ========== PACIENTE ==========
export const pacientes = mysqlTable("pacientes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  cpf: varchar("cpf", { length: 14 }),
  dataNascimento: datetime("data_nascimento"),
  enderecoBairroCidade: varchar("endereco_bairro_cidade", { length: 255 }),
  enderecoCep: varchar("endereco_cep", { length: 10 }),
  enderecoLat: decimal("endereco_lat", { precision: 10, scale: 8 }),
  enderecoLng: decimal("endereco_lng", { precision: 11, scale: 8 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_paciente_user_id").on(table.userId),
}));

export type Paciente = typeof pacientes.$inferSelect;
export type InsertPaciente = typeof pacientes.$inferInsert;

// ========== AGENDAMENTO (AGENDA INTELIGENTE) ==========
export const agendamentos = mysqlTable("agendamentos", {
  id: int("id").autoincrement().primaryKey(),
  fisioterapeutaId: int("fisioterapeuta_id").notNull().references(() => fisioterapeutas.id),
  pacienteId: int("paciente_id").notNull().references(() => pacientes.id),
  dataInicio: datetime("data_inicio").notNull(),
  dataFim: datetime("data_fim").notNull(),
  enderecoBairroCidade: varchar("endereco_bairro_cidade", { length: 255 }).notNull(),
  enderecoCep: varchar("endereco_cep", { length: 10 }).notNull(),
  enderecoLat: decimal("endereco_lat", { precision: 10, scale: 8 }).notNull(),
  enderecoLng: decimal("endereco_lng", { precision: 11, scale: 8 }).notNull(),
  distanciaKm: decimal("distancia_km", { precision: 10, scale: 2 }),
  tempoDeslocamentoMinutos: int("tempo_deslocamento_minutos"),
  valorCalculado: decimal("valor_calculado", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pendente", "confirmado", "reagendado", "cancelado", "concluido"]).default("pendente").notNull(),
  motivoCancelamento: text("motivo_cancelamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  fisioIdIdx: index("idx_agend_fisio_id").on(table.fisioterapeutaId),
  pacienteIdIdx: index("idx_agend_paciente_id").on(table.pacienteId),
  dataInicioIdx: index("idx_agend_data_inicio").on(table.dataInicio),
  statusIdx: index("idx_agend_status").on(table.status),
}));

export type Agendamento = typeof agendamentos.$inferSelect;
export type InsertAgendamento = typeof agendamentos.$inferInsert;

// ========== PRONTUÁRIO ELETRÔNICO ==========
export const prontuarios = mysqlTable("prontuarios", {
  id: int("id").autoincrement().primaryKey(),
  pacienteId: int("paciente_id").notNull().references(() => pacientes.id),
  fisioterapeutaId: int("fisioterapeuta_id").notNull().references(() => fisioterapeutas.id),
  avaliacao: text("avaliacao").notNull(),
  diagnostico: text("diagnostico"),
  planoTerapeutico: text("plano_terapeutico"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  pacienteIdIdx: index("idx_pront_paciente_id").on(table.pacienteId),
  fisioIdIdx: index("idx_pront_fisio_id").on(table.fisioterapeutaId),
}));

export type Prontuario = typeof prontuarios.$inferSelect;
export type InsertProntuario = typeof prontuarios.$inferInsert;

// ========== EVOLUÇÃO DO PRONTUÁRIO ==========
export const evolucoes = mysqlTable("evolucoes", {
  id: int("id").autoincrement().primaryKey(),
  prontuarioId: int("prontuario_id").notNull().references(() => prontuarios.id),
  agendamentoId: int("agendamento_id").references(() => agendamentos.id),
  conteudo: text("conteudo").notNull(),
  resultadoSessao: text("resultado_sessao"),
  proxisoPassos: text("proximos_passos"),
  dataEvolucao: datetime("data_evolucao").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  prontuarioIdIdx: index("idx_evol_prontuario_id").on(table.prontuarioId),
  agendamentoIdIdx: index("idx_evol_agendamento_id").on(table.agendamentoId),
  dataEvolucaoIdx: index("idx_evol_data_evolucao").on(table.dataEvolucao),
}));

export type Evolucao = typeof evolucoes.$inferSelect;
export type InsertEvolucao = typeof evolucoes.$inferInsert;

// ========== ANEXOS DO PRONTUÁRIO ==========
export const anexos = mysqlTable("anexos", {
  id: int("id").autoincrement().primaryKey(),
  prontuarioId: int("prontuario_id").notNull().references(() => prontuarios.id),
  nomeArquivo: varchar("nome_arquivo", { length: 255 }).notNull(),
  caminhoS3: varchar("caminho_s3", { length: 500 }).notNull(),
  tipoMime: varchar("tipo_mime", { length: 100 }).notNull(),
  tamanhoBytes: int("tamanho_bytes").notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  prontuarioIdIdx: index("idx_anexo_prontuario_id").on(table.prontuarioId),
}));

export type Anexo = typeof anexos.$inferSelect;
export type InsertAnexo = typeof anexos.$inferInsert;

// ========== COMPARTILHAMENTO DE PRONTUÁRIO ==========
export const shareTokens = mysqlTable("share_tokens", {
  id: int("id").autoincrement().primaryKey(),
  prontuarioId: int("prontuario_id").notNull().references(() => prontuarios.id),
  token: varchar("token", { length: 64 }).notNull().unique(),
  compartilhadoPor: int("compartilhado_por").notNull().references(() => users.id),
  compartilhadoCom: int("compartilhado_com").references(() => users.id),
  permissoes: json("permissoes").$type<string[]>().notNull(),
  expiresAt: datetime("expires_at"),
  acessoCount: int("acesso_count").default(0).notNull(),
  ultimoAcesso: datetime("ultimo_acesso"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  prontuarioIdIdx: index("idx_share_prontuario_id").on(table.prontuarioId),
  tokenIdx: index("idx_share_token").on(table.token),
  compartilhadoPorIdx: index("idx_share_por").on(table.compartilhadoPor),
}));

export type ShareToken = typeof shareTokens.$inferSelect;
export type InsertShareToken = typeof shareTokens.$inferInsert;
