ALTER TABLE `fisioterapeutas` MODIFY COLUMN `especialidades` json NOT NULL;--> statement-breakpoint
ALTER TABLE `fisioterapeutas` MODIFY COLUMN `raio_atendimento_km` int NOT NULL;--> statement-breakpoint
ALTER TABLE `fisioterapeutas` MODIFY COLUMN `horario_disponivel` json NOT NULL;--> statement-breakpoint
ALTER TABLE `fisioterapeutas` MODIFY COLUMN `tempo_sessao_minutos` int NOT NULL;--> statement-breakpoint
ALTER TABLE `fisioterapeutas` MODIFY COLUMN `valor_km_adicional` decimal(10,2) NOT NULL;