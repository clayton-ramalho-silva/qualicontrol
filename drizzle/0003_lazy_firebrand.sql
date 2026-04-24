ALTER TABLE `fornecedores` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `fornecedores` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;