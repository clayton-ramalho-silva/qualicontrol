import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  listObras: vi.fn().mockResolvedValue([
    { id: 1, codigo: "4787/25", nome: "FRECFUNCHAL", cliente: "FREC Funchal", endereco: "Rua Funchal, SP", status: "ativa", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, codigo: "4820/25", nome: "TORRE ALPHA", cliente: "Alpha Inc", endereco: "Av. Paulista, SP", status: "ativa", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getObraById: vi.fn().mockResolvedValue({ id: 1, codigo: "4787/25", nome: "FRECFUNCHAL" }),
  createObra: vi.fn().mockResolvedValue({ id: 3 }),
  updateObra: vi.fn().mockResolvedValue(undefined),
  listFornecedores: vi.fn().mockResolvedValue([
    { id: 1, nome: "Artesanale", disciplina: "Marcenaria" },
    { id: 2, nome: "RC Serviços", disciplina: "Pintura" },
  ]),
  createFornecedor: vi.fn().mockResolvedValue({ id: 3 }),
  updateFornecedor: vi.fn().mockResolvedValue(undefined),
  getFornecedorById: vi.fn().mockResolvedValue({ id: 1, nome: "Artesanale", disciplina: "Marcenaria", contato: "João", telefone: "11999999999", email: "artesanale@email.com" }),
  listDesvios: vi.fn().mockResolvedValue([
    { id: 1, obraId: 1, disciplina: "Marcenaria", fornecedorNome: "Artesanale", descricao: "Recuo de 3cm", severidade: "grave", status: "aberto", dataIdentificacao: Date.now(), origem: "qualidade", tagCritico: 0, tagSegurancaTrabalho: 0, tagSolicitadoCliente: 0 },
    { id: 2, obraId: 1, disciplina: "Pintura", fornecedorNome: "RC Serviços", descricao: "Manchas visíveis", severidade: "moderado", status: "em_andamento", dataIdentificacao: Date.now(), origem: "punch_list", tagCritico: 1, tagSegurancaTrabalho: 0, tagSolicitadoCliente: 0 },
  ]),
  getDesvioById: vi.fn().mockResolvedValue({
    id: 1, obraId: 1, disciplina: "Marcenaria", fornecedorNome: "Artesanale",
    descricao: "Recuo de 3cm", severidade: "grave", status: "aberto",
    dataIdentificacao: Date.now(), localizacao: "5º Andar",
    origem: "qualidade", tagCritico: 0, tagSegurancaTrabalho: 0, tagSolicitadoCliente: 0,
  }),
  createDesvio: vi.fn().mockResolvedValue({ id: 10 }),
  updateDesvio: vi.fn().mockResolvedValue(undefined),
  listFotosByDesvio: vi.fn().mockResolvedValue([]),
  listPlanosByDesvio: vi.fn().mockResolvedValue([]),
  listHistoricoByDesvio: vi.fn().mockResolvedValue([
    { id: 1, desvioId: 1, tipo: "criacao", descricao: "Desvio criado", createdAt: new Date() },
  ]),
  createHistorico: vi.fn().mockResolvedValue(undefined),
  createPlanoAcao: vi.fn().mockResolvedValue({ id: 1 }),
  updatePlanoAcao: vi.fn().mockResolvedValue(undefined),
  listPlanosAtrasados: vi.fn().mockResolvedValue([
    { id: 1, desvioId: 1, acao: "Corrigir recuo", responsavel: "Carlos", responsavelTipo: "membro", responsavelId: 1, prioridade: "urgente", prazo: Date.now() - 86400000, status: "pendente", alertaAtrasoEnviado: 0, lembreteEnviado: 0 },
  ]),
  listPlanosProximosPrazo: vi.fn().mockResolvedValue([]),
  checkAndSendAlerts: vi.fn().mockResolvedValue({ lembretesSent: 0, alertasSent: 1 }),
  hasFotosFechamento: vi.fn().mockResolvedValue(false),
  listFotosByDesvioByTipo: vi.fn().mockResolvedValue([]),
  getKpis: vi.fn().mockResolvedValue({
    total: 29, abertos: 12, emAndamento: 6, aguardandoAceite: 2, fechados: 9, atrasados: 18, graves: 11, taxaFechamento: 31,
    porDisciplina: { Marcenaria: { total: 8, abertos: 5, fechados: 2, graves: 2 } },
    porFornecedor: { Artesanale: { total: 8, abertos: 5, fechados: 2, graves: 2, tempoMedioResolucao: 5 } },
    porSeveridade: { leve: 5, moderado: 13, grave: 11 },
    porOrigem: { qualidade: 15, punch_list: 10, pos_obra: 4 },
  }),
  getFornecedorPerformance: vi.fn().mockResolvedValue([
    { nome: "Artesanale", totalDesvios: 8, abertos: 5, fechados: 2, graves: 2, taxaFechamento: 25, tempoMedioResolucao: 5, avaliacao: "CRÍTICO" },
  ]),
  getDataForLLM: vi.fn().mockResolvedValue({
    kpis: { total: 29, abertos: 12 },
    performance: [],
    recentDesvios: [],
    obras: [],
  }),
  createFoto: vi.fn().mockResolvedValue({ id: 1 }),
  getChecklistCompleto: vi.fn().mockResolvedValue([
    { id: 1, numero: 1, titulo: "Acompanhamento", peso: 0, reincidencia: 0, itens: [
      { id: 1, secaoId: 1, codigo: "1.1", descricao: "Engenheiro de Instalações", ordem: 1, ativo: 1 },
    ]},
    { id: 2, numero: 2, titulo: "Condição de Obra", peso: 10, reincidencia: 0, itens: [
      { id: 2, secaoId: 2, codigo: "2.1", descricao: "Limpeza geral", ordem: 1, ativo: 1 },
      { id: 3, secaoId: 2, codigo: "2.2", descricao: "Proteção de materiais", ordem: 2, ativo: 1 },
    ]},
  ]),
  updateSecao: vi.fn().mockResolvedValue(undefined),
  createChecklistItem: vi.fn().mockResolvedValue({ id: 10 }),
  updateChecklistItem: vi.fn().mockResolvedValue(undefined),
  listConfigFaixas: vi.fn().mockResolvedValue([
    { id: 1, nome: "ÓTIMA", minimo: 80, maximo: 100, cor: "#10b981" },
    { id: 2, nome: "REGULAR", minimo: 75, maximo: 79.99, cor: "#f59e0b" },
    { id: 3, nome: "RUIM", minimo: 50, maximo: 74.99, cor: "#ef4444" },
    { id: 4, nome: "CRÍTICO", minimo: 0, maximo: 49.99, cor: "#991b1b" },
  ]),
  updateConfigFaixa: vi.fn().mockResolvedValue(undefined),
  listVerificacoes: vi.fn().mockResolvedValue([
    { id: 1, obraId: 1, avaliador: "João", dataVistoria: Date.now(), scoreGeral: 85, scoreCondicao: 90, scoreQualidade: 80, scoreCronograma: 100, statusGeral: "ÓTIMA", statusCondicao: "ÓTIMA", statusQualidade: "ÓTIMA", statusCronograma: "ÓTIMA" },
  ]),
  getVerificacaoById: vi.fn().mockResolvedValue({
    id: 1, obraId: 1, avaliador: "João", dataVistoria: Date.now(), scoreGeral: 85, statusGeral: "ÓTIMA",
    scoreCondicao: 90, statusCondicao: "ÓTIMA", scoreQualidade: 80, statusQualidade: "ÓTIMA",
    scoreCronograma: 100, statusCronograma: "ÓTIMA",
  }),
  getVerificacaoRespostas: vi.fn().mockResolvedValue([
    { id: 1, verificacaoId: 1, itemId: 1, resposta: "AT", observacao: null },
    { id: 2, verificacaoId: 1, itemId: 2, resposta: "AT", observacao: null },
    { id: 3, verificacaoId: 1, itemId: 3, resposta: "NAT", observacao: "Materiais expostos" },
  ]),
  listChecklistSecoes: vi.fn().mockResolvedValue([
    { id: 1, numero: 1, titulo: "Acompanhamento", peso: 0, reincidencia: 0 },
    { id: 2, numero: 2, titulo: "Condição de Obra", peso: 10, reincidencia: 0 },
  ]),
  listChecklistItens: vi.fn().mockResolvedValue([
    { id: 1, secaoId: 1, codigo: "1.1", descricao: "Engenheiro", ordem: 1, ativo: 1 },
    { id: 2, secaoId: 2, codigo: "2.1", descricao: "Limpeza", ordem: 1, ativo: 1 },
    { id: 3, secaoId: 2, codigo: "2.2", descricao: "Proteção", ordem: 2, ativo: 1 },
  ]),
  calcularScores: vi.fn().mockReturnValue({
    scoreGeral: 85, scoreCondicao: 90, scoreQualidade: 80, scoreCronograma: 100,
    statusGeral: "ÓTIMA", statusCondicao: "ÓTIMA", statusQualidade: "ÓTIMA", statusCronograma: "ÓTIMA",
  }),
  createVerificacao: vi.fn().mockResolvedValue({ id: 5 }),
  createVerificacaoRespostas: vi.fn().mockResolvedValue(undefined),
  listMembros: vi.fn().mockResolvedValue([
    { id: 1, nome: "Avaliador FRECFUNCHAL", email: "avaliador@aw.com", telefone: "11999990001", cargo: "avaliador", obraIds: [1], ativo: 1 },
    { id: 2, nome: "Gerente de Obra FRECFUNCHAL", email: "go@aw.com", telefone: "11999990002", cargo: "gerente_obra", obraIds: [1], ativo: 1 },
    { id: 3, nome: "N\u00facleo Qualidade", email: "nucleo@aw.com", telefone: "11999990003", cargo: "nucleo", obraIds: [1, 2], ativo: 1 },
  ]),
  getMembroById: vi.fn().mockResolvedValue({ id: 1, nome: "Avaliador FRECFUNCHAL", email: "avaliador@aw.com", telefone: "11999990001", cargo: "avaliador", obraIds: [1], ativo: 1 }),
  createMembro: vi.fn().mockResolvedValue({ id: 4 }),
  updateMembro: vi.fn().mockResolvedValue(undefined),
  listMembrosByObra: vi.fn().mockResolvedValue([
    { id: 1, nome: "Avaliador FRECFUNCHAL", cargo: "avaliador", obraIds: [1], ativo: 1 },
  ]),
  listMembrosByCargo: vi.fn().mockResolvedValue([
    { id: 1, nome: "Avaliador FRECFUNCHAL", cargo: "avaliador", obraIds: [1], ativo: 1 },
  ]),
  listNotificacoes: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, titulo: "Novo Plano de Ação", mensagem: "Plano criado para Desvio #1", tipo: "plano_criado", lida: 0, referenciaId: 1, referenciaTipo: "desvio", createdAt: new Date() },
    { id: 2, userId: 1, titulo: "Status Alterado", mensagem: "Desvio #1 alterado", tipo: "status_alterado", lida: 1, referenciaId: 1, referenciaTipo: "desvio", createdAt: new Date() },
  ]),
  countNotificacoesNaoLidas: vi.fn().mockResolvedValue(1),
  createNotificacao: vi.fn().mockResolvedValue({ id: 3 }),
  marcarNotificacaoLida: vi.fn().mockResolvedValue(undefined),
  marcarTodasLidas: vi.fn().mockResolvedValue(undefined),
  criarNotificacaoParaTodosAdmins: vi.fn().mockResolvedValue(undefined),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Análise: Os dados indicam que a Artesanale precisa de atenção." } }],
  }),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/foto.jpg", key: "desvios/1/foto.jpg" }),
}));

type CookieCall = { name: string; options: Record<string, unknown> };
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  const user: AuthenticatedUser = {
    id: 1, openId: "test-user", email: "test@example.com", name: "Test User",
    loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: (name: string, options: Record<string, unknown>) => { clearedCookies.push({ name, options }); } } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

describe("Obras Router", () => {
  it("lists all obras", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.obras.list();
    expect(result).toHaveLength(2);
    expect(result[0].codigo).toBe("4787/25");
  });

  it("gets obra by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.obras.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.nome).toBe("FRECFUNCHAL");
  });

  it("creates a new obra", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.obras.create({ codigo: "5000/25", nome: "NOVA OBRA", cliente: "Cliente X" });
    expect(result.id).toBe(3);
  });
});

describe("Fornecedores Router", () => {
  it("lists all fornecedores", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fornecedores.list();
    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe("Artesanale");
  });

  it("creates a new fornecedor", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fornecedores.create({ nome: "Novo Fornecedor", disciplina: "Elétrica" });
    expect(result.id).toBe(3);
  });
});

describe("Desvios Router", () => {
  it("lists desvios with filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.desvios.list({ obraId: 1 });
    expect(result).toHaveLength(2);
  });

  it("gets desvio by id with related data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.desvios.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.descricao).toBe("Recuo de 3cm");
    expect(result?.fotos).toEqual([]);
    expect(result?.planos).toEqual([]);
    expect(result?.historico).toHaveLength(1);
  });

  it("creates a new desvio with historico", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.desvios.create({
      obraId: 1, disciplina: "Marcenaria", descricao: "Novo desvio teste",
      severidade: "grave", dataIdentificacao: Date.now(),
      origem: "punch_list", tagCritico: 1, tagSegurancaTrabalho: 0, tagSolicitadoCliente: 0,
    });
    expect(result.id).toBe(10);
  });

  it("creates a desvio with default origem qualidade", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.desvios.create({
      obraId: 1, disciplina: "Pintura", descricao: "Desvio sem origem explícita",
      severidade: "leve", dataIdentificacao: Date.now(),
    });
    expect(result.id).toBe(10);
  });

  it("updates desvio status and creates historico", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.desvios.update({ id: 1, status: "em_andamento" });
    expect(result.success).toBe(true);
  });

  it("rejects closing desvio without fechamento photos", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // hasFotosFechamento returns false by default
    await expect(caller.desvios.update({ id: 1, status: "fechado" })).rejects.toThrow(
      /foto de evidência/i
    );
  });

  it("rejects aguardando_aceite without fechamento photos", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.desvios.update({ id: 1, status: "aguardando_aceite" })).rejects.toThrow(
      /foto de evidência/i
    );
  });

  it("allows closing desvio when fechamento photos exist", async () => {
    const dbModule = await import("./db");
    (dbModule.hasFotosFechamento as any).mockResolvedValueOnce(true);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.desvios.update({ id: 1, status: "fechado" });
    expect(result.success).toBe(true);
  });

  it("allows aguardando_aceite when fechamento photos exist", async () => {
    const dbModule = await import("./db");
    (dbModule.hasFotosFechamento as any).mockResolvedValueOnce(true);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.desvios.update({ id: 1, status: "aguardando_aceite" });
    expect(result.success).toBe(true);
  });
});

describe("KPIs Router", () => {
  it("returns KPIs for all obras including new fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.kpis.get();
    expect(result).toBeDefined();
    expect(result?.total).toBe(29);
    expect(result?.aguardandoAceite).toBe(2);
    expect(result?.taxaFechamento).toBe(31);
    expect(result?.porOrigem).toBeDefined();
    expect(result?.porOrigem?.qualidade).toBe(15);
    expect(result?.porOrigem?.punch_list).toBe(10);
    expect(result?.porOrigem?.pos_obra).toBe(4);
  });

  it("returns fornecedor performance", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.kpis.fornecedorPerformance();
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe("Artesanale");
    expect(result[0].avaliacao).toBe("CRÍTICO");
  });
});

describe("Planos de Ação Router", () => {
  it("creates a plano de ação with prioridade and responsavelTipo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.planos.create({
      desvioId: 1,
      acao: "Corrigir recuo",
      responsavel: "Carlos",
      responsavelTipo: "membro",
      responsavelId: 1,
      responsavelEmail: "carlos@aw.com",
      prioridade: "urgente",
      prazo: Date.now() + 7 * 86400000,
    });
    expect(result.id).toBe(1);
  });

  it("creates a plano with default prioridade normal", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.planos.create({
      desvioId: 1,
      acao: "Verificar pintura",
      responsavel: "Artesanale",
      prazo: Date.now() + 14 * 86400000,
    });
    expect(result.id).toBe(1);
  });

  it("creates a plano with fornecedor responsavel", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.planos.create({
      desvioId: 1,
      acao: "Refazer acabamento",
      responsavel: "Artesanale",
      responsavelTipo: "fornecedor",
      responsavelId: 1,
      prioridade: "baixa",
      prazo: Date.now() + 30 * 86400000,
    });
    expect(result.id).toBe(1);
  });

  it("updates plano status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.planos.update({ id: 1, desvioId: 1, status: "concluido" });
    expect(result.success).toBe(true);
  });

  it("updates plano prioridade", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.planos.update({ id: 1, desvioId: 1, prioridade: "urgente" });
    expect(result.success).toBe(true);
  });

  it("lists planos atrasados", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.planos.listAtrasados();
    expect(result).toHaveLength(1);
    expect(result[0].prioridade).toBe("urgente");
    expect(result[0].responsavelTipo).toBe("membro");
  });

  it("checks and sends alerts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.planos.checkAlerts();
    expect(result.lembretesSent).toBe(0);
    expect(result.alertasSent).toBe(1);
  });
});

describe("Historico Router", () => {
  it("adds a comment to desvio", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.historico.addComment({ desvioId: 1, descricao: "Verificar em campo amanhã" });
    expect(result.success).toBe(true);
  });
});

describe("Relatorio Router", () => {
  it("generates a consolidated report with analysis", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.relatorio.generate({ incluirAnalise: true });
    expect(result).toBeDefined();
    expect(result.kpis).toBeDefined();
    expect(result.kpis?.total).toBe(29);
    expect(result.performance).toBeDefined();
    expect(result.analise).toBeTruthy();
    expect(result.dataGeracao).toBeGreaterThan(0);
  });

  it("generates report without analysis", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.relatorio.generate({ incluirAnalise: false });
    expect(result).toBeDefined();
    expect(result.analise).toBe("");
  });
});

describe("Checklist Router", () => {
  it("gets complete checklist with sections and items", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.checklist.getCompleto();
    expect(result).toHaveLength(2);
    expect(result[0].titulo).toBe("Acompanhamento");
    expect(result[0].itens).toHaveLength(1);
    expect(result[1].itens).toHaveLength(2);
  });

  it("updates section weight and reincidence", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.checklist.updateSecao({ id: 2, peso: 15, reincidencia: 10 });
    expect(result.success).toBe(true);
  });

  it("creates a new checklist item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.checklist.createItem({ secaoId: 2, codigo: "2.15", descricao: "Novo item teste", ordem: 15 });
    expect(result.id).toBe(10);
  });

  it("updates a checklist item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.checklist.updateItem({ id: 2, descricao: "Limpeza geral atualizada" });
    expect(result.success).toBe(true);
  });
});

describe("Config Faixas Router", () => {
  it("lists classification ranges", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.configFaixas.list();
    expect(result).toHaveLength(4);
    expect(result[0].nome).toBe("ÓTIMA");
    expect(result[0].minimo).toBe(80);
  });

  it("updates a classification range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.configFaixas.update({ id: 1, minimo: 85, maximo: 100 });
    expect(result.success).toBe(true);
  });
});

describe("Verificacoes Router", () => {
  it("lists verificacoes", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.verificacoes.list();
    expect(result).toHaveLength(1);
    expect(result[0].avaliador).toBe("João");
    expect(result[0].scoreGeral).toBe(85);
  });

  it("lists verificacoes filtered by obra", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.verificacoes.list({ obraId: 1 });
    expect(result).toHaveLength(1);
  });

  it("gets verificacao by id with respostas and checklist", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.verificacoes.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.avaliador).toBe("João");
    expect(result?.respostas).toHaveLength(3);
    expect(result?.checklist).toHaveLength(2);
  });

  it("creates a verificacao with scores", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.verificacoes.create({
      obraId: 1,
      avaliador: "Maria",
      dataVistoria: Date.now(),
      respostas: [
        { itemId: 1, resposta: "AT" },
        { itemId: 2, resposta: "AT" },
        { itemId: 3, resposta: "NAT", observacao: "Problema encontrado" },
      ],
    });
    expect(result.id).toBe(5);
    expect(result.scores.scoreGeral).toBe(85);
    expect(result.scores.statusGeral).toBe("ÓTIMA");
  });
});

describe("Fornecedores Router", () => {
  it("lists all fornecedores", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fornecedores.list();
    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe("Artesanale");
  });

  it("gets fornecedor by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fornecedores.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.nome).toBe("Artesanale");
    expect(result?.email).toBe("artesanale@email.com");
  });

  it("creates a fornecedor with email", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fornecedores.create({
      nome: "Novo Fornecedor",
      disciplina: "Elétrica",
      email: "novo@email.com",
    });
    expect(result.id).toBe(3);
  });

  it("updates a fornecedor", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fornecedores.update({
      id: 1,
      nome: "Artesanale Atualizada",
      email: "novo@artesanale.com",
    });
    expect(result.success).toBe(true);
  });
});

describe("Membros Router", () => {
  it("lists all membros", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.membros.list();
    expect(result).toHaveLength(3);
    expect(result[0].nome).toBe("Avaliador FRECFUNCHAL");
  });

  it("gets membro by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.membros.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.nome).toBe("Avaliador FRECFUNCHAL");
    expect(result?.cargo).toBe("avaliador");
    expect(result?.email).toBe("avaliador@aw.com");
  });

  it("creates a membro", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.membros.create({
      nome: "Novo T\u00e9cnico",
      cargo: "tecnico",
      email: "tecnico@aw.com",
      obraIds: [1, 2],
    });
    expect(result.id).toBe(4);
  });

  it("updates a membro", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.membros.update({
      id: 1,
      nome: "Avaliador Atualizado",
      cargo: "coordenador",
    });
    expect(result.success).toBe(true);
  });

  it("lists membros by obra", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.membros.byObra({ obraId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].cargo).toBe("avaliador");
  });

  it("lists membros by cargo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.membros.byCargo({ cargo: "avaliador" });
    expect(result).toHaveLength(1);
  });
});

describe("Notificações Router", () => {
  it("lists notificacoes for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.list();
    expect(result).toHaveLength(2);
    expect(result[0].titulo).toBe("Novo Plano de Ação");
  });

  it("returns empty list for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as any,
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.list();
    expect(result).toEqual([]);
  });

  it("counts unread notifications", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.countNaoLidas();
    expect(result.count).toBe(1);
  });

  it("marks a notification as read", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.marcarLida({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("marks all notifications as read", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.marcarTodasLidas();
    expect(result.success).toBe(true);
  });
});

describe("LLM Router", () => {
  it("asks a question and gets an answer", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.llm.ask({ question: "Quais fornecedores têm mais desvios?" });
    expect(result.answer).toContain("Artesanale");
  });

  it("suggests contextual questions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.llm.suggestQuestions();
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});
