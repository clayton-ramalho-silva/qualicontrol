CREATE TABLE `checklist_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`secaoId` int NOT NULL,
	`codigo` varchar(16) NOT NULL,
	`descricao` text NOT NULL,
	`ordem` int NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_secoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`peso` int NOT NULL DEFAULT 10,
	`reincidencia` int NOT NULL DEFAULT 0,
	`ordem` int NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_secoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `config_faixas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(32) NOT NULL,
	`minimo` int NOT NULL,
	`maximo` int NOT NULL,
	`cor` varchar(16) NOT NULL,
	`ordem` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `config_faixas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verificacao_respostas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`verificacaoId` int NOT NULL,
	`itemId` int NOT NULL,
	`resposta` enum('AT','NAT','GR','NA') NOT NULL,
	`observacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verificacao_respostas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`obraId` int NOT NULL,
	`avaliador` varchar(255) NOT NULL,
	`dataVistoria` bigint NOT NULL,
	`go` varchar(255),
	`gc` varchar(255),
	`nucleo` varchar(128),
	`diretoria` varchar(128),
	`scoreGeral` int,
	`scoreCondicao` int,
	`scoreCronograma` int,
	`scoreQualidade` int,
	`statusGeral` varchar(32),
	`statusCondicao` varchar(32),
	`statusCronograma` varchar(32),
	`statusQualidade` varchar(32),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verificacoes_id` PRIMARY KEY(`id`)
);
