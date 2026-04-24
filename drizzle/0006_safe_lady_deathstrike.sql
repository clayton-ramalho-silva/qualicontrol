ALTER TABLE `planos_acao` ADD `responsavelTipo` enum('membro','fornecedor') DEFAULT 'membro' NOT NULL;--> statement-breakpoint
ALTER TABLE `planos_acao` ADD `responsavelId` int;--> statement-breakpoint
ALTER TABLE `planos_acao` ADD `responsavelEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `planos_acao` ADD `prioridade` enum('urgente','normal','baixa') DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `planos_acao` ADD `notificadoEm` bigint;--> statement-breakpoint
ALTER TABLE `planos_acao` ADD `lembreteEnviado` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `planos_acao` ADD `alertaAtrasoEnviado` int DEFAULT 0 NOT NULL;