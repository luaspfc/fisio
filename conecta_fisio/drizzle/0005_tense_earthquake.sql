CREATE TABLE `anexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prontuario_id` int NOT NULL,
	`nome_arquivo` varchar(255) NOT NULL,
	`caminho_s3` varchar(500) NOT NULL,
	`tipo_mime` varchar(100) NOT NULL,
	`tamanho_bytes` int NOT NULL,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anexos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evolucoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prontuario_id` int NOT NULL,
	`agendamento_id` int,
	`conteudo` text NOT NULL,
	`resultado_sessao` text,
	`proximos_passos` text,
	`data_evolucao` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evolucoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prontuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paciente_id` int NOT NULL,
	`fisioterapeuta_id` int NOT NULL,
	`avaliacao` text NOT NULL,
	`diagnostico` text,
	`plano_terapeutico` text,
	`observacoes` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prontuarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `share_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prontuario_id` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`compartilhado_por` int NOT NULL,
	`compartilhado_com` int,
	`permissoes` json NOT NULL,
	`expires_at` datetime,
	`acesso_count` int NOT NULL DEFAULT 0,
	`ultimo_acesso` datetime,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `share_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `share_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `anexos` ADD CONSTRAINT `anexos_prontuario_id_prontuarios_id_fk` FOREIGN KEY (`prontuario_id`) REFERENCES `prontuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evolucoes` ADD CONSTRAINT `evolucoes_prontuario_id_prontuarios_id_fk` FOREIGN KEY (`prontuario_id`) REFERENCES `prontuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evolucoes` ADD CONSTRAINT `evolucoes_agendamento_id_agendamentos_id_fk` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prontuarios` ADD CONSTRAINT `prontuarios_paciente_id_pacientes_id_fk` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prontuarios` ADD CONSTRAINT `prontuarios_fisioterapeuta_id_fisioterapeutas_id_fk` FOREIGN KEY (`fisioterapeuta_id`) REFERENCES `fisioterapeutas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `share_tokens` ADD CONSTRAINT `share_tokens_prontuario_id_prontuarios_id_fk` FOREIGN KEY (`prontuario_id`) REFERENCES `prontuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `share_tokens` ADD CONSTRAINT `share_tokens_compartilhado_por_users_id_fk` FOREIGN KEY (`compartilhado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `share_tokens` ADD CONSTRAINT `share_tokens_compartilhado_com_users_id_fk` FOREIGN KEY (`compartilhado_com`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_anexo_prontuario_id` ON `anexos` (`prontuario_id`);--> statement-breakpoint
CREATE INDEX `idx_evol_prontuario_id` ON `evolucoes` (`prontuario_id`);--> statement-breakpoint
CREATE INDEX `idx_evol_agendamento_id` ON `evolucoes` (`agendamento_id`);--> statement-breakpoint
CREATE INDEX `idx_evol_data_evolucao` ON `evolucoes` (`data_evolucao`);--> statement-breakpoint
CREATE INDEX `idx_pront_paciente_id` ON `prontuarios` (`paciente_id`);--> statement-breakpoint
CREATE INDEX `idx_pront_fisio_id` ON `prontuarios` (`fisioterapeuta_id`);--> statement-breakpoint
CREATE INDEX `idx_share_prontuario_id` ON `share_tokens` (`prontuario_id`);--> statement-breakpoint
CREATE INDEX `idx_share_token` ON `share_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `idx_share_por` ON `share_tokens` (`compartilhado_por`);