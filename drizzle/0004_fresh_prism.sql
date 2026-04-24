CREATE TABLE `membros_equipe` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(32),
	`cargo` enum('avaliador','gerente_obra','gerente_contrato','nucleo','diretoria','coordenador','tecnico') NOT NULL,
	`obraIds` json,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membros_equipe_id` PRIMARY KEY(`id`)
);
