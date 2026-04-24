CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`tipoNotificacao` enum('plano_criado','prazo_vencendo','plano_atrasado','status_alterado','verificacao','geral') NOT NULL DEFAULT 'geral',
	`referenciaId` int,
	`referenciaTipo` enum('desvio','plano','verificacao'),
	`lida` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
