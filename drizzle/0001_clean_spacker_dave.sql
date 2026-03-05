CREATE TABLE `agendamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fisioterapeuta_id` int NOT NULL,
	`paciente_id` int NOT NULL,
	`data_inicio` datetime NOT NULL,
	`data_fim` datetime NOT NULL,
	`endereco_bairro_cidade` varchar(255) NOT NULL,
	`endereco_cep` varchar(10) NOT NULL,
	`endereco_lat` decimal(10,8) NOT NULL,
	`endereco_lng` decimal(11,8) NOT NULL,
	`distancia_km` decimal(10,2),
	`tempo_deslocamento_minutos` int,
	`valor_calculado` decimal(10,2),
	`status` enum('pendente','confirmado','reagendado','cancelado','concluido') NOT NULL DEFAULT 'pendente',
	`motivo_cancelamento` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agendamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`auditable_type` varchar(255) NOT NULL,
	`auditable_id` int NOT NULL,
	`event` enum('created','updated','viewed','deleted','shared') NOT NULL,
	`user_id` int NOT NULL,
	`user_type` varchar(50) NOT NULL,
	`ip_address` varchar(45) NOT NULL,
	`user_agent` text,
	`old_values` json,
	`new_values` json,
	`modified_fields` json,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crefito_validacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fisioterapeuta_id` int NOT NULL,
	`crefito` varchar(20) NOT NULL,
	`status` enum('pendente','validado','rejeitado') NOT NULL DEFAULT 'pendente',
	`motivo` text,
	`validado_por` int,
	`validado_em` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crefito_validacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fisioterapeutas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`crefito` varchar(20) NOT NULL,
	`crefito_validado` boolean NOT NULL DEFAULT false,
	`crefito_validado_em` timestamp,
	`crefito_validado_por` int,
	`especialidades` json NOT NULL DEFAULT ('[]'),
	`endereco_bairro_cidade` varchar(255) NOT NULL,
	`endereco_cep` varchar(10) NOT NULL,
	`endereco_lat` decimal(10,8) NOT NULL,
	`endereco_lng` decimal(11,8) NOT NULL,
	`raio_atendimento_km` int NOT NULL DEFAULT 10,
	`horario_disponivel` json NOT NULL DEFAULT ('{}'),
	`tempo_sessao_minutos` int NOT NULL DEFAULT 60,
	`valor_base` decimal(10,2) NOT NULL,
	`valor_km_adicional` decimal(10,2) NOT NULL DEFAULT '0',
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fisioterapeutas_id` PRIMARY KEY(`id`),
	CONSTRAINT `fisioterapeutas_crefito_unique` UNIQUE(`crefito`)
);
--> statement-breakpoint
CREATE TABLE `pacientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`cpf` varchar(14),
	`data_nascimento` datetime,
	`endereco_bairro_cidade` varchar(255),
	`endereco_cep` varchar(10),
	`endereco_lat` decimal(10,8),
	`endereco_lng` decimal(11,8),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pacientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','fisioterapeuta','paciente') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_fisioterapeuta_id_fisioterapeutas_id_fk` FOREIGN KEY (`fisioterapeuta_id`) REFERENCES `fisioterapeutas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_paciente_id_pacientes_id_fk` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crefito_validacoes` ADD CONSTRAINT `crefito_validacoes_fisioterapeuta_id_fisioterapeutas_id_fk` FOREIGN KEY (`fisioterapeuta_id`) REFERENCES `fisioterapeutas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crefito_validacoes` ADD CONSTRAINT `crefito_validacoes_validado_por_users_id_fk` FOREIGN KEY (`validado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fisioterapeutas` ADD CONSTRAINT `fisioterapeutas_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fisioterapeutas` ADD CONSTRAINT `fisioterapeutas_crefito_validado_por_users_id_fk` FOREIGN KEY (`crefito_validado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pacientes` ADD CONSTRAINT `pacientes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_agend_fisio_id` ON `agendamentos` (`fisioterapeuta_id`);--> statement-breakpoint
CREATE INDEX `idx_agend_paciente_id` ON `agendamentos` (`paciente_id`);--> statement-breakpoint
CREATE INDEX `idx_agend_data_inicio` ON `agendamentos` (`data_inicio`);--> statement-breakpoint
CREATE INDEX `idx_agend_status` ON `agendamentos` (`status`);--> statement-breakpoint
CREATE INDEX `idx_audit_auditable` ON `audit_logs` (`auditable_type`,`auditable_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_user_id` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_created_at` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_audit_event` ON `audit_logs` (`event`);--> statement-breakpoint
CREATE INDEX `idx_crefito_fisio_id` ON `crefito_validacoes` (`fisioterapeuta_id`);--> statement-breakpoint
CREATE INDEX `idx_crefito_status` ON `crefito_validacoes` (`status`);--> statement-breakpoint
CREATE INDEX `idx_fisio_user_id` ON `fisioterapeutas` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_fisio_crefito` ON `fisioterapeutas` (`crefito`);--> statement-breakpoint
CREATE INDEX `idx_paciente_user_id` ON `pacientes` (`user_id`);