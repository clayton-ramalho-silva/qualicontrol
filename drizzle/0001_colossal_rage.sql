CREATE TABLE `desvios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`obraId` int NOT NULL,
	`disciplina` varchar(128) NOT NULL,
	`fornecedorId` int,
	`fornecedorNome` varchar(255),
	`descricao` text NOT NULL,
	`localizacao` varchar(255),
	`severidade` enum('leve','moderado','grave') NOT NULL,
	`statusDesvio` enum('aberto','em_andamento','fechado') NOT NULL DEFAULT 'aberto',
	`dataIdentificacao` bigint NOT NULL,
	`prazoSugerido` bigint,
	`dataFechamento` bigint,
	`createdById` int,
	`createdByName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `desvios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fornecedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`disciplina` varchar(128),
	`contato` varchar(255),
	`telefone` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fornecedores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fotos_evidencia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`desvioId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`descricao` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fotos_evidencia_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`desvioId` int NOT NULL,
	`tipo` enum('criacao','status','edicao','plano_acao','comentario','foto') NOT NULL,
	`descricao` text NOT NULL,
	`de` varchar(255),
	`para` varchar(255),
	`userId` int,
	`userName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `obras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(32) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cliente` varchar(255),
	`endereco` text,
	`statusObra` enum('ativa','concluida','pausada') NOT NULL DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `obras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planos_acao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`desvioId` int NOT NULL,
	`acao` text NOT NULL,
	`responsavel` varchar(255) NOT NULL,
	`prazo` bigint NOT NULL,
	`statusPlano` enum('pendente','em_andamento','concluido') NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planos_acao_id` PRIMARY KEY(`id`)
);
