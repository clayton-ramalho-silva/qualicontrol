ALTER TABLE `desvios` MODIFY COLUMN `statusDesvio` enum('aberto','em_andamento','fechado','aguardando_aceite') NOT NULL DEFAULT 'aberto';--> statement-breakpoint
ALTER TABLE `desvios` ADD `origem` enum('qualidade','punch_list','pos_obra') DEFAULT 'qualidade' NOT NULL;--> statement-breakpoint
ALTER TABLE `desvios` ADD `tagCritico` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `desvios` ADD `tagSegurancaTrabalho` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `desvios` ADD `tagSolicitadoCliente` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `fotos_evidencia` ADD `tipoFoto` enum('abertura','fechamento') DEFAULT 'abertura' NOT NULL;