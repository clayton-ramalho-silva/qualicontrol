import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, json } from "drizzle-orm/mysql-core";

// ── Users (auth) ──────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Obras (projetos) ─────────────────────────────────────────
export const obras = mysqlTable("obras", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 32 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cliente: varchar("cliente", { length: 255 }),
  endereco: text("endereco"),
  status: mysqlEnum("statusObra", ["ativa", "concluida", "pausada"]).default("ativa").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Obra = typeof obras.$inferSelect;
export type InsertObra = typeof obras.$inferInsert;

// ── Fornecedores ─────────────────────────────────────────────
export const fornecedores = mysqlTable("fornecedores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  disciplina: varchar("disciplina", { length: 128 }),
  contato: varchar("contato", { length: 255 }),
  telefone: varchar("telefone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Fornecedor = typeof fornecedores.$inferSelect;
export type InsertFornecedor = typeof fornecedores.$inferInsert;

// ── Membros da Equipe ───────────────────────────────────
export const membrosEquipe = mysqlTable("membros_equipe", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 32 }),
  cargo: mysqlEnum("cargo", ["avaliador", "gerente_obra", "gerente_contrato", "nucleo", "diretoria", "coordenador", "tecnico"]).notNull(),
  obraIds: json("obraIds").$type<number[]>(),  // IDs das obras vinculadas
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembroEquipe = typeof membrosEquipe.$inferSelect;
export type InsertMembroEquipe = typeof membrosEquipe.$inferInsert;

// ── Desvios ──────────────────────────────────────────────────
export const desvios = mysqlTable("desvios", {
  id: int("id").autoincrement().primaryKey(),
  obraId: int("obraId").notNull(),
  disciplina: varchar("disciplina", { length: 128 }).notNull(),
  fornecedorId: int("fornecedorId"),
  fornecedorNome: varchar("fornecedorNome", { length: 255 }),
  descricao: text("descricao").notNull(),
  localizacao: varchar("localizacao", { length: 255 }),
  severidade: mysqlEnum("severidade", ["leve", "moderado", "grave"]).notNull(),
  origem: mysqlEnum("origem", ["qualidade", "punch_list", "pos_obra"]).default("qualidade").notNull(),
  tagCritico: int("tagCritico").default(0).notNull(),
  tagSegurancaTrabalho: int("tagSegurancaTrabalho").default(0).notNull(),
  tagSolicitadoCliente: int("tagSolicitadoCliente").default(0).notNull(),
  status: mysqlEnum("statusDesvio", ["aberto", "em_andamento", "fechado", "aguardando_aceite"]).default("aberto").notNull(),
  dataIdentificacao: bigint("dataIdentificacao", { mode: "number" }).notNull(),
  prazoSugerido: bigint("prazoSugerido", { mode: "number" }),
  dataFechamento: bigint("dataFechamento", { mode: "number" }),
  createdById: int("createdById"),
  createdByName: varchar("createdByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Desvio = typeof desvios.$inferSelect;
export type InsertDesvio = typeof desvios.$inferInsert;

// ── Fotos de Evidência ───────────────────────────────────────
export const fotosEvidencia = mysqlTable("fotos_evidencia", {
  id: int("id").autoincrement().primaryKey(),
  desvioId: int("desvioId").notNull(),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  descricao: varchar("descricao", { length: 512 }),
  tipo: mysqlEnum("tipoFoto", ["abertura", "fechamento"]).default("abertura").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FotoEvidencia = typeof fotosEvidencia.$inferSelect;
export type InsertFotoEvidencia = typeof fotosEvidencia.$inferInsert;

// ── Planos de Ação ───────────────────────────────────────────
export const planosAcao = mysqlTable("planos_acao", {
  id: int("id").autoincrement().primaryKey(),
  desvioId: int("desvioId").notNull(),
  acao: text("acao").notNull(),
  responsavel: varchar("responsavel", { length: 255 }).notNull(),
  responsavelTipo: mysqlEnum("responsavelTipo", ["membro", "fornecedor"]).default("membro").notNull(),
  responsavelId: int("responsavelId"),
  responsavelEmail: varchar("responsavelEmail", { length: 320 }),
  prioridade: mysqlEnum("prioridade", ["urgente", "normal", "baixa"]).default("normal").notNull(),
  prazo: bigint("prazo", { mode: "number" }).notNull(),
  status: mysqlEnum("statusPlano", ["pendente", "em_andamento", "concluido"]).default("pendente").notNull(),
  observacoes: text("observacoes"),
  notificadoEm: bigint("notificadoEm", { mode: "number" }),
  lembreteEnviado: int("lembreteEnviado").default(0).notNull(),
  alertaAtrasoEnviado: int("alertaAtrasoEnviado").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanoAcao = typeof planosAcao.$inferSelect;
export type InsertPlanoAcao = typeof planosAcao.$inferInsert;

// ── Histórico de Alterações ──────────────────────────────────
export const historico = mysqlTable("historico", {
  id: int("id").autoincrement().primaryKey(),
  desvioId: int("desvioId").notNull(),
  tipo: mysqlEnum("tipo", ["criacao", "status", "edicao", "plano_acao", "comentario", "foto"]).notNull(),
  descricao: text("descricao").notNull(),
  de: varchar("de", { length: 255 }),
  para: varchar("para", { length: 255 }),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Historico = typeof historico.$inferSelect;
export type InsertHistorico = typeof historico.$inferInsert;

// ── Checklist: Seções ────────────────────────────────────────
export const checklistSecoes = mysqlTable("checklist_secoes", {
  id: int("id").autoincrement().primaryKey(),
  numero: int("numero").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  peso: int("peso").default(10).notNull(),
  reincidencia: int("reincidencia").default(0).notNull(), // percentual (ex: 5 = 5%)
  ordem: int("ordem").notNull(),
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistSecao = typeof checklistSecoes.$inferSelect;
export type InsertChecklistSecao = typeof checklistSecoes.$inferInsert;

// ── Checklist: Itens ─────────────────────────────────────────
export const checklistItens = mysqlTable("checklist_itens", {
  id: int("id").autoincrement().primaryKey(),
  secaoId: int("secaoId").notNull(),
  codigo: varchar("codigo", { length: 16 }).notNull(), // ex: "2.1", "3.5"
  descricao: text("descricao").notNull(),
  ordem: int("ordem").notNull(),
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistItem = typeof checklistItens.$inferSelect;
export type InsertChecklistItem = typeof checklistItens.$inferInsert;

// ── Verificações (preenchimento do checklist) ────────────────
export const verificacoes = mysqlTable("verificacoes", {
  id: int("id").autoincrement().primaryKey(),
  obraId: int("obraId").notNull(),
  avaliador: varchar("avaliador", { length: 255 }).notNull(),
  dataVistoria: bigint("dataVistoria", { mode: "number" }).notNull(),
  go: varchar("go", { length: 255 }),       // Gerente de Obra
  gc: varchar("gc", { length: 255 }),       // Gerente de Contrato
  nucleo: varchar("nucleo", { length: 128 }),
  diretoria: varchar("diretoria", { length: 128 }),
  // Scores calculados
  scoreGeral: int("scoreGeral"),             // percentual 0-100
  scoreCondicao: int("scoreCondicao"),
  scoreCronograma: int("scoreCronograma"),
  scoreQualidade: int("scoreQualidade"),
  statusGeral: varchar("statusGeral", { length: 32 }),       // ÓTIMA, REGULAR, RUIM, CRÍTICO
  statusCondicao: varchar("statusCondicao", { length: 32 }),
  statusCronograma: varchar("statusCronograma", { length: 32 }),
  statusQualidade: varchar("statusQualidade", { length: 32 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Verificacao = typeof verificacoes.$inferSelect;
export type InsertVerificacao = typeof verificacoes.$inferInsert;

// ── Respostas da Verificação ─────────────────────────────────
export const verificacaoRespostas = mysqlTable("verificacao_respostas", {
  id: int("id").autoincrement().primaryKey(),
  verificacaoId: int("verificacaoId").notNull(),
  itemId: int("itemId").notNull(),
  resposta: mysqlEnum("resposta", ["AT", "NAT", "GR", "NA"]).notNull(), // Atende, Não Atende, Grave, Não Aplica
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VerificacaoResposta = typeof verificacaoRespostas.$inferSelect;
export type InsertVerificacaoResposta = typeof verificacaoRespostas.$inferInsert;

// ── Configuração: Faixas de Classificação ────────────────────
export const configFaixas = mysqlTable("config_faixas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 32 }).notNull(),    // ÓTIMA, REGULAR, RUIM, CRÍTICO
  minimo: int("minimo").notNull(),                      // percentual mínimo
  maximo: int("maximo").notNull(),                      // percentual máximo
  cor: varchar("cor", { length: 16 }).notNull(),        // hex color
  ordem: int("ordem").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfigFaixa = typeof configFaixas.$inferSelect;
export type InsertConfigFaixa = typeof configFaixas.$inferInsert;

// ── Notificações Internas ───────────────────────────────────
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),          // destinatário
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  tipo: mysqlEnum("tipoNotificacao", ["plano_criado", "prazo_vencendo", "plano_atrasado", "status_alterado", "verificacao", "geral"]).default("geral").notNull(),
  referenciaId: int("referenciaId"),        // ID do desvio ou plano relacionado
  referenciaTipo: mysqlEnum("referenciaTipo", ["desvio", "plano", "verificacao"]),
  lida: int("lida").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;
