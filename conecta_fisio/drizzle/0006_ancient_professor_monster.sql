ALTER TABLE `fisioterapeutas` ADD `hotmart_customer_id` varchar(255);--> statement-breakpoint
ALTER TABLE `fisioterapeutas` ADD `assinatura_ativa` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `fisioterapeutas` ADD `assinatura_bloqueada_em` timestamp;