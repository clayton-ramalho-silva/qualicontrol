import { eq, and, sql, desc, asc, inArray, gte, lte, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  obras, InsertObra,
  fornecedores, InsertFornecedor,
  desvios, InsertDesvio,
  fotosEvidencia, InsertFotoEvidencia,
  planosAcao, InsertPlanoAcao,
  historico, InsertHistorico,
  checklistSecoes, InsertChecklistSecao,
  checklistItens, InsertChecklistItem,
  verificacoes, InsertVerificacao,
  verificacaoRespostas, InsertVerificacaoResposta,
  configFaixas, InsertConfigFaixa,
  membrosEquipe, InsertMembroEquipe,
  notificacoes, InsertNotificacao,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ─────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Obras ─────────────────────────────────────────────────────
export async function listObras() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(obras).orderBy(desc(obras.createdAt));
}

export async function getObraById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(obras).where(eq(obras.id, id)).limit(1);
  return result[0];
}

export async function createObra(data: InsertObra) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(obras).values(data);
  return { id: result[0].insertId };
}

export async function updateObra(id: number, data: Partial<InsertObra>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(obras).set(data).where(eq(obras.id, id));
}

// ── Fornecedores ──────────────────────────────────────────────
export async function listFornecedores() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fornecedores).orderBy(asc(fornecedores.nome));
}

export async function createFornecedor(data: InsertFornecedor) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(fornecedores).values(data);
  return { id: result[0].insertId };
}

export async function updateFornecedor(id: number, data: Partial<InsertFornecedor>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(fornecedores).set(data).where(eq(fornecedores.id, id));
}

export async function getFornecedorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(fornecedores).where(eq(fornecedores.id, id)).limit(1);
  return result[0];
}

// ── Membros da Equipe ───────────────────────────────────────────
export async function listMembros() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(membrosEquipe).orderBy(asc(membrosEquipe.nome));
}

export async function getMembroById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(membrosEquipe).where(eq(membrosEquipe.id, id)).limit(1);
  return result[0];
}

export async function createMembro(data: InsertMembroEquipe) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(membrosEquipe).values(data);
  return { id: result[0].insertId };
}

export async function updateMembro(id: number, data: Partial<InsertMembroEquipe>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(membrosEquipe).set(data).where(eq(membrosEquipe.id, id));
}

export async function listMembrosByObra(obraId: number) {
  const db = await getDb();
  if (!db) return [];
  const all = await db.select().from(membrosEquipe).where(eq(membrosEquipe.ativo, 1));
  return all.filter(m => {
    const ids = m.obraIds as number[] | null;
    return ids && ids.includes(obraId);
  });
}

export async function listMembrosByCargo(cargo: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(membrosEquipe)
    .where(eq(membrosEquipe.cargo, cargo as any))
    .orderBy(asc(membrosEquipe.nome));
}

// ── Desvios ───────────────────────────────────────────────────
export async function listDesvios(filters?: {
  obraId?: number;
  status?: string;
  severidade?: string;
  disciplina?: string;
  fornecedorNome?: string;
  origem?: string;
  tagCritico?: boolean;
  tagSegurancaTrabalho?: boolean;
  tagSolicitadoCliente?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.obraId) conditions.push(eq(desvios.obraId, filters.obraId));
  if (filters?.status) conditions.push(eq(desvios.status, filters.status as any));
  if (filters?.severidade) conditions.push(eq(desvios.severidade, filters.severidade as any));
  if (filters?.disciplina) conditions.push(eq(desvios.disciplina, filters.disciplina));
  if (filters?.fornecedorNome) conditions.push(eq(desvios.fornecedorNome, filters.fornecedorNome));
  if (filters?.origem) conditions.push(eq(desvios.origem, filters.origem as any));
  if (filters?.tagCritico) conditions.push(eq(desvios.tagCritico, 1));
  if (filters?.tagSegurancaTrabalho) conditions.push(eq(desvios.tagSegurancaTrabalho, 1));
  if (filters?.tagSolicitadoCliente) conditions.push(eq(desvios.tagSolicitadoCliente, 1));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(desvios).where(where).orderBy(desc(desvios.createdAt));
}

export async function getDesvioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(desvios).where(eq(desvios.id, id)).limit(1);
  return result[0];
}

export async function createDesvio(data: InsertDesvio) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(desvios).values(data);
  return { id: result[0].insertId };
}

export async function updateDesvio(id: number, data: Partial<InsertDesvio>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(desvios).set(data).where(eq(desvios.id, id));
}

// ── Fotos de Evidência ────────────────────────────────────────
export async function listFotosByDesvioByTipo(desvioId: number, tipo: "abertura" | "fechamento") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fotosEvidencia)
    .where(and(eq(fotosEvidencia.desvioId, desvioId), eq(fotosEvidencia.tipo, tipo)));
}

export async function hasFotosFechamento(desvioId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const fotos = await db.select().from(fotosEvidencia)
    .where(and(eq(fotosEvidencia.desvioId, desvioId), eq(fotosEvidencia.tipo, "fechamento")));
  return fotos.length > 0;
}

export async function listFotosByDesvio(desvioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fotosEvidencia).where(eq(fotosEvidencia.desvioId, desvioId));
}

export async function createFoto(data: InsertFotoEvidencia) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(fotosEvidencia).values(data);
  return { id: result[0].insertId };
}

// ── Planos de Ação ────────────────────────────────────────────
export async function listPlanosByDesvio(desvioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(planosAcao).where(eq(planosAcao.desvioId, desvioId)).orderBy(desc(planosAcao.createdAt));
}

export async function createPlanoAcao(data: InsertPlanoAcao) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(planosAcao).values(data);
  return { id: result[0].insertId };
}

export async function updatePlanoAcao(id: number, data: Partial<InsertPlanoAcao>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(planosAcao).set(data).where(eq(planosAcao.id, id));
}

export async function listPlanosAtrasados() {
  const db = await getDb();
  if (!db) return [];
  const now = Date.now();
  const all = await db.select().from(planosAcao).orderBy(desc(planosAcao.prazo));
  return all.filter(p => p.status !== "concluido" && p.prazo < now);
}

export async function listPlanosProximosPrazo(diasAntecedencia: number = 2) {
  const db = await getDb();
  if (!db) return [];
  const now = Date.now();
  const limite = now + diasAntecedencia * 24 * 60 * 60 * 1000;
  const all = await db.select().from(planosAcao).orderBy(asc(planosAcao.prazo));
  return all.filter(p => p.status !== "concluido" && p.prazo >= now && p.prazo <= limite && p.lembreteEnviado === 0);
}

export async function checkAndSendAlerts() {
  const { notifyOwner } = await import("./_core/notification");
  const now = Date.now();
  let lembretesSent = 0;
  let alertasSent = 0;

  // 1. Lembretes de prazo (2 dias antes)
  const proximos = await listPlanosProximosPrazo(2);
  for (const plano of proximos) {
    try {
      const desvio = await getDesvioById(plano.desvioId);
      const diasRestantes = Math.ceil((plano.prazo - now) / (24 * 60 * 60 * 1000));
      await notifyOwner({
        title: `Lembrete de Prazo - Plano de Ação #${plano.id}`,
        content: `O plano de ação "${plano.acao.substring(0, 80)}" vence em ${diasRestantes} dia(s).\nResponsável: ${plano.responsavel}\nPrioridade: ${(plano.prioridade || "normal").toUpperCase()}\nDesvio #${plano.desvioId}: ${desvio?.descricao?.substring(0, 80) || "N/A"}`,
      });
      // Notificação interna
      await criarNotificacaoParaTodosAdmins({
        titulo: `Prazo Vencendo - Plano #${plano.id}`,
        mensagem: `O plano "${plano.acao.substring(0, 80)}" vence em ${diasRestantes} dia(s).\nResponsável: ${plano.responsavel}`,
        tipo: "prazo_vencendo",
        referenciaId: plano.desvioId,
        referenciaTipo: "desvio",
      });
      await updatePlanoAcao(plano.id, { lembreteEnviado: 1 });
      lembretesSent++;
    } catch (e) {
      console.warn("[Alerts] Failed to send reminder for plano", plano.id, e);
    }
  }

  // 2. Alertas de atraso
  const db2 = await getDb();
  if (db2) {
    const all = await db2.select().from(planosAcao);
    const atrasados = all.filter(p => p.status !== "concluido" && p.prazo < now && p.alertaAtrasoEnviado === 0);
    for (const plano of atrasados) {
      try {
        const desvio = await getDesvioById(plano.desvioId);
        const diasAtraso = Math.ceil((now - plano.prazo) / (24 * 60 * 60 * 1000));
        await notifyOwner({
          title: `ALERTA DE ATRASO - Plano de Ação #${plano.id}`,
          content: `O plano de ação "${plano.acao.substring(0, 80)}" está ATRASADO há ${diasAtraso} dia(s)!\nResponsável: ${plano.responsavel}\nPrioridade: ${(plano.prioridade || "normal").toUpperCase()}\nDesvio #${plano.desvioId}: ${desvio?.descricao?.substring(0, 80) || "N/A"}`,
        });
        // Notificação interna
        await criarNotificacaoParaTodosAdmins({
          titulo: `ATRASO - Plano #${plano.id}`,
          mensagem: `O plano "${plano.acao.substring(0, 80)}" está atrasado há ${diasAtraso} dia(s)!\nResponsável: ${plano.responsavel}`,
          tipo: "plano_atrasado",
          referenciaId: plano.desvioId,
          referenciaTipo: "desvio",
        });
        await updatePlanoAcao(plano.id, { alertaAtrasoEnviado: 1 });
        alertasSent++;
      } catch (e) {
        console.warn("[Alerts] Failed to send overdue alert for plano", plano.id, e);
      }
    }
  }

  return { lembretesSent, alertasSent };
}

// ── Histórico ─────────────────────────────────────────────────
export async function listHistoricoByDesvio(desvioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(historico).where(eq(historico.desvioId, desvioId)).orderBy(asc(historico.createdAt));
}

export async function createHistorico(data: InsertHistorico) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(historico).values(data);
}

// ── KPIs e Métricas ───────────────────────────────────────────
export async function getKpis(obraId?: number, origem?: "qualidade" | "punch_list" | "pos_obra") {
  const db = await getDb();
  if (!db) return null;

  const conditions: ReturnType<typeof eq>[] = [];
  if (obraId) conditions.push(eq(desvios.obraId, obraId));
  if (origem) conditions.push(eq(desvios.origem, origem));
  const condition = conditions.length > 0 ? and(...conditions) : undefined;
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const allDesvios = await db.select().from(desvios).where(condition);

  const total = allDesvios.length;
  const abertos = allDesvios.filter(d => d.status === "aberto").length;
  const emAndamento = allDesvios.filter(d => d.status === "em_andamento").length;
  const aguardandoAceite = allDesvios.filter(d => d.status === "aguardando_aceite").length;
  const fechados = allDesvios.filter(d => d.status === "fechado").length;
  const atrasados = allDesvios.filter(d =>
    d.status !== "fechado" && d.status !== "aguardando_aceite" && d.prazoSugerido && d.prazoSugerido < now
  ).length;
  const graves = allDesvios.filter(d => d.severidade === "grave").length;
  const taxaFechamento = total > 0 ? Math.round((fechados / total) * 100) : 0;

  // Por origem
  const porOrigem = {
    qualidade: allDesvios.filter(d => d.origem === "qualidade").length,
    punch_list: allDesvios.filter(d => d.origem === "punch_list").length,
    pos_obra: allDesvios.filter(d => d.origem === "pos_obra").length,
  };

  // Por disciplina
  const porDisciplina: Record<string, { total: number; abertos: number; fechados: number; graves: number }> = {};
  allDesvios.forEach(d => {
    if (!porDisciplina[d.disciplina]) porDisciplina[d.disciplina] = { total: 0, abertos: 0, fechados: 0, graves: 0 };
    porDisciplina[d.disciplina].total++;
    if (d.status === "aberto" || d.status === "em_andamento" || d.status === "aguardando_aceite") porDisciplina[d.disciplina].abertos++;
    if (d.status === "fechado") porDisciplina[d.disciplina].fechados++;
    if (d.severidade === "grave") porDisciplina[d.disciplina].graves++;
  });

  // Por fornecedor
  const porFornecedor: Record<string, { total: number; abertos: number; fechados: number; graves: number; tempoMedioResolucao: number }> = {};
  allDesvios.forEach(d => {
    const nome = d.fornecedorNome || "Não informado";
    if (!porFornecedor[nome]) porFornecedor[nome] = { total: 0, abertos: 0, fechados: 0, graves: 0, tempoMedioResolucao: 0 };
    porFornecedor[nome].total++;
    if (d.status === "aberto" || d.status === "em_andamento" || d.status === "aguardando_aceite") porFornecedor[nome].abertos++;
    if (d.status === "fechado") {
      porFornecedor[nome].fechados++;
      if (d.dataFechamento && d.dataIdentificacao) {
        const dias = Math.round((d.dataFechamento - d.dataIdentificacao) / (1000 * 60 * 60 * 24));
        porFornecedor[nome].tempoMedioResolucao += dias;
      }
    }
    if (d.severidade === "grave") porFornecedor[nome].graves++;
  });
  // Calcular média
  Object.keys(porFornecedor).forEach(nome => {
    const f = porFornecedor[nome];
    if (f.fechados > 0) f.tempoMedioResolucao = Math.round(f.tempoMedioResolucao / f.fechados);
  });

  // Por severidade
  const porSeveridade = {
    leve: allDesvios.filter(d => d.severidade === "leve").length,
    moderado: allDesvios.filter(d => d.severidade === "moderado").length,
    grave: allDesvios.filter(d => d.severidade === "grave").length,
  };

  // Por classificação (tags) - apenas desvios não fechados
  const desviosAtivos = allDesvios.filter(d => d.status !== "fechado");
  const porClassificacao = {
    chamado_critico: desviosAtivos.filter(d => d.tagCritico === 1).length,
    seguranca_trabalho: desviosAtivos.filter(d => d.tagSegurancaTrabalho === 1).length,
    solicitado_cliente: desviosAtivos.filter(d => d.tagSolicitadoCliente === 1).length,
  };

  return {
    total, abertos, emAndamento, aguardandoAceite, fechados, atrasados, graves, taxaFechamento,
    porDisciplina, porFornecedor, porSeveridade, porOrigem, porClassificacao,
  };
}

// ── Performance de Fornecedores ───────────────────────────────
export async function getFornecedorPerformance(obraId?: number) {
  const db = await getDb();
  if (!db) return [];

  const condition = obraId ? eq(desvios.obraId, obraId) : undefined;
  const allDesvios = await db.select().from(desvios).where(condition);

  const map: Record<string, {
    nome: string; total: number; abertos: number; fechados: number;
    graves: number; tempoTotal: number; countTempo: number;
  }> = {};

  allDesvios.forEach(d => {
    const nome = d.fornecedorNome || "Não informado";
    if (!map[nome]) map[nome] = { nome, total: 0, abertos: 0, fechados: 0, graves: 0, tempoTotal: 0, countTempo: 0 };
    map[nome].total++;
    if (d.status !== "fechado") map[nome].abertos++;
    if (d.status === "fechado") {
      map[nome].fechados++;
      if (d.dataFechamento && d.dataIdentificacao) {
        map[nome].tempoTotal += (d.dataFechamento - d.dataIdentificacao);
        map[nome].countTempo++;
      }
    }
    if (d.severidade === "grave") map[nome].graves++;
  });

  return Object.values(map).map(f => ({
    nome: f.nome,
    totalDesvios: f.total,
    abertos: f.abertos,
    fechados: f.fechados,
    graves: f.graves,
    taxaFechamento: f.total > 0 ? Math.round((f.fechados / f.total) * 100) : 0,
    tempoMedioResolucao: f.countTempo > 0 ? Math.round(f.tempoTotal / f.countTempo / (1000 * 60 * 60 * 24)) : null,
    avaliacao: f.graves === 0 && f.total <= 2 ? "BOM" : f.graves > 0 || f.total > 5 ? "CRÍTICO" : "REGULAR",
  })).sort((a, b) => b.totalDesvios - a.totalDesvios);
}

// ── Checklist: Seções e Itens ───────────────────────────────
export async function listChecklistSecoes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklistSecoes).where(eq(checklistSecoes.ativo, 1)).orderBy(asc(checklistSecoes.ordem));
}

export async function listChecklistItens(secaoId?: number) {
  const db = await getDb();
  if (!db) return [];
  const condition = secaoId ? and(eq(checklistItens.secaoId, secaoId), eq(checklistItens.ativo, 1)) : eq(checklistItens.ativo, 1);
  return db.select().from(checklistItens).where(condition).orderBy(asc(checklistItens.secaoId), asc(checklistItens.ordem));
}

export async function getChecklistCompleto() {
  const secoes = await listChecklistSecoes();
  const itens = await listChecklistItens();
  return secoes.map(s => ({
    ...s,
    itens: itens.filter(i => i.secaoId === s.id),
  }));
}

export async function updateSecao(id: number, data: Partial<InsertChecklistSecao>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(checklistSecoes).set(data).where(eq(checklistSecoes.id, id));
}

export async function createChecklistItem(data: InsertChecklistItem) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(checklistItens).values(data);
  return { id: result[0].insertId };
}

export async function updateChecklistItem(id: number, data: Partial<InsertChecklistItem>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(checklistItens).set(data).where(eq(checklistItens.id, id));
}

// ── Faixas de Classificação ─────────────────────────────────
export async function listConfigFaixas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(configFaixas).orderBy(asc(configFaixas.ordem));
}

export async function updateConfigFaixa(id: number, data: Partial<InsertConfigFaixa>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(configFaixas).set(data).where(eq(configFaixas.id, id));
}

// ── Verificações ─────────────────────────────────────────
export async function listVerificacoes(obraId?: number) {
  const db = await getDb();
  if (!db) return [];
  const condition = obraId ? eq(verificacoes.obraId, obraId) : undefined;
  return db.select().from(verificacoes).where(condition).orderBy(desc(verificacoes.dataVistoria));
}

export async function getVerificacaoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(verificacoes).where(eq(verificacoes.id, id)).limit(1);
  return result[0];
}

export async function getVerificacaoRespostas(verificacaoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(verificacaoRespostas).where(eq(verificacaoRespostas.verificacaoId, verificacaoId));
}

export async function createVerificacao(data: InsertVerificacao) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(verificacoes).values(data);
  return { id: result[0].insertId };
}

export async function updateVerificacao(id: number, data: Partial<InsertVerificacao>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(verificacoes).set(data).where(eq(verificacoes.id, id));
}

export async function createVerificacaoRespostas(respostas: InsertVerificacaoResposta[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (respostas.length === 0) return;
  await db.insert(verificacaoRespostas).values(respostas);
}

// ── Cálculo de Scores ─────────────────────────────────────
export function calcularScores(
  secoes: { id: number; numero: number; peso: number; reincidencia: number }[],
  itens: { id: number; secaoId: number }[],
  respostas: { itemId: number; resposta: string }[],
  faixas: { nome: string; minimo: number; maximo: number }[]
) {
  const respostaMap = new Map(respostas.map(r => [r.itemId, r.resposta]));

  function calcSecao(secaoId: number, peso: number, reincidenciaPct: number) {
    const secaoItens = itens.filter(i => i.secaoId === secaoId);
    let atende = 0, naoAtende = 0, grave = 0, naoAplica = 0;
    secaoItens.forEach(item => {
      const resp = respostaMap.get(item.id);
      if (resp === "AT") atende++;
      else if (resp === "NAT") naoAtende++;
      else if (resp === "GR") grave++;
      else if (resp === "NA") naoAplica++;
    });
    const aplicaveis = secaoItens.length - naoAplica;
    if (aplicaveis === 0) return { score: 100, atende, naoAtende, grave, naoAplica, aplicaveis };
    
    const pesoItem = aplicaveis > 0 ? peso / aplicaveis : 0;
    const pontosAtende = atende * pesoItem;
    const pontosPossiveis = peso - (naoAplica * pesoItem);
    const pctBase = pontosPossiveis > 0 ? (pontosAtende / pontosPossiveis) * 100 : 0;
    
    // Penalidade de graves: cada grave desconta proporcionalmente
    const penalGrave = grave > 0 ? (grave * pesoItem / pontosPossiveis) * 100 : 0;
    const score = Math.max(0, Math.round(pctBase - penalGrave));
    
    return { score, atende, naoAtende, grave, naoAplica, aplicaveis };
  }

  function classificar(score: number): string {
    for (const f of faixas) {
      if (score >= f.minimo && score <= f.maximo) return f.nome;
    }
    return score >= 80 ? "ÓTIMA" : score >= 75 ? "REGULAR" : score >= 50 ? "RUIM" : "CRÍTICO";
  }

  // Calcular por dimensão
  const secaoMap: Record<string, { score: number; status: string; detalhes: any }> = {};
  let totalPontosAtende = 0;
  let totalPontosPossiveis = 0;
  let totalGravePenalty = 0;

  secoes.forEach(s => {
    const result = calcSecao(s.id, s.peso, s.reincidencia);
    const dimensao = s.numero === 1 ? "acompanhamento" : s.numero === 2 ? "condicao" : s.numero === 3 ? "qualidade" : "cronograma";
    secaoMap[dimensao] = {
      score: result.score,
      status: classificar(result.score),
      detalhes: result,
    };
    // Para o score geral
    if (s.peso > 0) {
      totalPontosAtende += result.atende * (s.peso / Math.max(result.aplicaveis, 1));
      totalPontosPossiveis += s.peso - (result.naoAplica * (s.peso / Math.max(result.aplicaveis + result.naoAplica, 1)));
      totalGravePenalty += result.grave * (s.peso / Math.max(result.aplicaveis, 1));
    }
  });

  const scoreGeral = totalPontosPossiveis > 0
    ? Math.max(0, Math.round(((totalPontosAtende - totalGravePenalty) / totalPontosPossiveis) * 100))
    : 0;

  return {
    scoreGeral,
    statusGeral: classificar(scoreGeral),
    scoreCondicao: secaoMap.condicao?.score ?? 0,
    statusCondicao: secaoMap.condicao?.status ?? "",
    scoreCronograma: secaoMap.cronograma?.score ?? 0,
    statusCronograma: secaoMap.cronograma?.status ?? "",
    scoreQualidade: secaoMap.qualidade?.score ?? 0,
    statusQualidade: secaoMap.qualidade?.status ?? "",
    detalhes: secaoMap,
  };
}

// ── Notificações Internas ───────────────────────────────
export async function listNotificacoes(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificacoes)
    .where(eq(notificacoes.userId, userId))
    .orderBy(desc(notificacoes.createdAt))
    .limit(limit);
}

export async function countNotificacoesNaoLidas(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(notificacoes)
    .where(and(eq(notificacoes.userId, userId), eq(notificacoes.lida, 0)));
  return result[0]?.count ?? 0;
}

export async function createNotificacao(data: InsertNotificacao) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(notificacoes).values(data);
  return { id: result[0].insertId };
}

export async function marcarNotificacaoLida(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(notificacoes).set({ lida: 1 })
    .where(and(eq(notificacoes.id, id), eq(notificacoes.userId, userId)));
}

export async function marcarTodasLidas(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(notificacoes).set({ lida: 1 })
    .where(and(eq(notificacoes.userId, userId), eq(notificacoes.lida, 0)));
}

export async function criarNotificacaoParaTodosAdmins(data: Omit<InsertNotificacao, 'userId'>) {
  const db = await getDb();
  if (!db) return;
  const admins = await db.select().from(users).where(eq(users.role, 'admin'));
  for (const admin of admins) {
    await createNotificacao({ ...data, userId: admin.id });
  }
}

// ── Dados para LLM Context ───────────────────────────────────
export async function getDataForLLM(obraId?: number) {
  const kpis = await getKpis(obraId);
  const performance = await getFornecedorPerformance(obraId);
  const condition = obraId ? eq(desvios.obraId, obraId) : undefined;
  const db = await getDb();
  if (!db) return { kpis, performance, recentDesvios: [] };
  const recentDesvios = await db.select().from(desvios).where(condition).orderBy(desc(desvios.createdAt)).limit(50);
  const obrasList = await listObras();
  return { kpis, performance, recentDesvios, obras: obrasList };
}
