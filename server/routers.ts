import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Obras ─────────────────────────────────────────────────
  obras: router({
    list: publicProcedure.query(async () => {
      return db.listObras();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getObraById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        codigo: z.string().min(1),
        nome: z.string().min(1),
        cliente: z.string().optional(),
        endereco: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createObra(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        codigo: z.string().optional(),
        nome: z.string().optional(),
        cliente: z.string().optional(),
        endereco: z.string().optional(),
        status: z.enum(["ativa", "concluida", "pausada"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateObra(id, data);
        return { success: true };
      }),
  }),

  // ── Fornecedores ──────────────────────────────────────────
  fornecedores: router({
    list: publicProcedure.query(async () => {
      return db.listFornecedores();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getFornecedorById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        disciplina: z.string().optional(),
        contato: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createFornecedor(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        disciplina: z.string().optional(),
        contato: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFornecedor(id, data);
        return { success: true };
      }),
  }),

  // ── Membros da Equipe ───────────────────────────────────
  membros: router({
    list: publicProcedure.query(async () => {
      return db.listMembros();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getMembroById(input.id);
      }),
    byObra: publicProcedure
      .input(z.object({ obraId: z.number() }))
      .query(async ({ input }) => {
        return db.listMembrosByObra(input.obraId);
      }),
    byCargo: publicProcedure
      .input(z.object({ cargo: z.string() }))
      .query(async ({ input }) => {
        return db.listMembrosByCargo(input.cargo);
      }),
    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        email: z.string().optional(),
        telefone: z.string().optional(),
        cargo: z.enum(["avaliador", "gerente_obra", "gerente_contrato", "nucleo", "diretoria", "coordenador", "tecnico"]),
        obraIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createMembro(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        cargo: z.enum(["avaliador", "gerente_obra", "gerente_contrato", "nucleo", "diretoria", "coordenador", "tecnico"]).optional(),
        obraIds: z.array(z.number()).optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateMembro(id, data);
        return { success: true };
      }),
  }),

  // ── Desvios ───────────────────────────────────────────────
  desvios: router({
    list: publicProcedure
      .input(z.object({
        obraId: z.number().optional(),
        status: z.string().optional(),
        severidade: z.string().optional(),
        disciplina: z.string().optional(),
        fornecedorNome: z.string().optional(),
        origem: z.string().optional(),
        tagCritico: z.boolean().optional(),
        tagSegurancaTrabalho: z.boolean().optional(),
        tagSolicitadoCliente: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.listDesvios(input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const desvio = await db.getDesvioById(input.id);
        if (!desvio) return null;
        const fotos = await db.listFotosByDesvio(input.id);
        const planos = await db.listPlanosByDesvio(input.id);
        const historicoItems = await db.listHistoricoByDesvio(input.id);
        return { ...desvio, fotos, planos, historico: historicoItems };
      }),
    create: publicProcedure
      .input(z.object({
        obraId: z.number(),
        disciplina: z.string().min(1),
        fornecedorId: z.number().optional(),
        fornecedorNome: z.string().optional(),
        descricao: z.string().min(1),
        localizacao: z.string().optional(),
        severidade: z.enum(["leve", "moderado", "grave"]),
        origem: z.enum(["qualidade", "punch_list", "pos_obra"]).default("qualidade"),
        tagCritico: z.number().default(0),
        tagSegurancaTrabalho: z.number().default(0),
        tagSolicitadoCliente: z.number().default(0),
        dataIdentificacao: z.number(),
        prazoSugerido: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createDesvio({
          ...input,
          createdById: (ctx.user?.id ?? 0),
          createdByName: (ctx.user?.name || "Usuário"),
        });
        await db.createHistorico({
          desvioId: result.id,
          tipo: "criacao",
          descricao: `Desvio criado: ${input.descricao.substring(0, 100)}`,
          userName: (ctx.user?.name || "Usuário"),
          userId: (ctx.user?.id ?? 0),
        });
        return result;
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        disciplina: z.string().optional(),
        fornecedorNome: z.string().optional(),
        descricao: z.string().optional(),
        localizacao: z.string().optional(),
        severidade: z.enum(["leve", "moderado", "grave"]).optional(),
        status: z.enum(["aberto", "em_andamento", "fechado", "aguardando_aceite"]).optional(),
        origem: z.enum(["qualidade", "punch_list", "pos_obra"]).optional(),
        tagCritico: z.number().optional(),
        tagSegurancaTrabalho: z.number().optional(),
        tagSolicitadoCliente: z.number().optional(),
        prazoSugerido: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const existing = await db.getDesvioById(id);
        if (!existing) throw new Error("Desvio não encontrado");

        // Track status change
        if (data.status && data.status !== existing.status) {
          // Require photo evidence for closing
          if (data.status === "fechado" || data.status === "aguardando_aceite") {
            const hasFotos = await db.hasFotosFechamento(id);
            if (!hasFotos) {
              throw new Error("É obrigatório anexar pelo menos uma foto de evidência de fechamento antes de concluir o desvio.");
            }
          }
          if (data.status === "fechado") {
            (data as any).dataFechamento = Date.now();
          }
          await db.createHistorico({
            desvioId: id,
            tipo: "status",
            descricao: `Status alterado de "${existing.status}" para "${data.status}"`,
            de: existing.status,
            para: data.status,
            userName: (ctx.user?.name || "Usuário"),
            userId: (ctx.user?.id ?? 0),
          });
          // Notificação interna de mudança de status
          try {
            const statusLabels: Record<string, string> = {
              aberto: "Aberto", em_andamento: "Em Andamento",
              fechado: "Fechado", aguardando_aceite: "Ag. Aceite",
            };
            await db.criarNotificacaoParaTodosAdmins({
              titulo: `Desvio #${id} - Status Alterado`,
              mensagem: `Status alterado de "${statusLabels[existing.status] || existing.status}" para "${statusLabels[data.status] || data.status}"\nDescrição: ${existing.descricao.substring(0, 100)}`,
              tipo: "status_alterado",
              referenciaId: id,
              referenciaTipo: "desvio",
            });
          } catch (e) {
            console.warn("[Notificacao] Failed to create status change notification:", e);
          }
        }

        // Track other edits
        const editFields = ["disciplina", "descricao", "localizacao", "severidade", "fornecedorNome"] as const;
        for (const field of editFields) {
          if (data[field] && data[field] !== (existing as any)[field]) {
            await db.createHistorico({
              desvioId: id,
              tipo: "edicao",
              descricao: `Campo "${field}" alterado`,
              de: String((existing as any)[field] || ""),
              para: String(data[field]),
              userName: (ctx.user?.name || "Usuário"),
              userId: (ctx.user?.id ?? 0),
            });
          }
        }

        await db.updateDesvio(id, data);
        return { success: true };
      }),
  }),

  // ── Fotos ─────────────────────────────────────────────────
  fotos: router({
    upload: publicProcedure
      .input(z.object({
        desvioId: z.number(),
        fileBase64: z.string(),
        fileName: z.string(),
        contentType: z.string(),
        descricao: z.string().optional(),
        tipo: z.enum(["abertura", "fechamento"]).default("abertura"),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const fileKey = `desvios/${input.desvioId}/${input.tipo}/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        const result = await db.createFoto({
          desvioId: input.desvioId,
          url,
          fileKey,
          descricao: input.descricao,
          tipo: input.tipo,
        });
        await db.createHistorico({
          desvioId: input.desvioId,
          tipo: "foto",
          descricao: `Foto de ${input.tipo} adicionada: ${input.fileName}`,
          userName: (ctx.user?.name || "Usuário"),
          userId: (ctx.user?.id ?? 0),
        });
        return { id: result.id, url };
      }),
    listByDesvio: publicProcedure
      .input(z.object({ desvioId: z.number() }))
      .query(async ({ input }) => {
        return db.listFotosByDesvio(input.desvioId);
      }),
    listByDesvioByTipo: publicProcedure
      .input(z.object({ desvioId: z.number(), tipo: z.enum(["abertura", "fechamento"]) }))
      .query(async ({ input }) => {
        return db.listFotosByDesvioByTipo(input.desvioId, input.tipo);
      }),
  }),

  // ── Planos de Ação ────────────────────────────────────────
  planos: router({
    listByDesvio: publicProcedure
      .input(z.object({ desvioId: z.number() }))
      .query(async ({ input }) => {
        return db.listPlanosByDesvio(input.desvioId);
      }),
    listAtrasados: publicProcedure
      .query(async () => {
        return db.listPlanosAtrasados();
      }),
    create: publicProcedure
      .input(z.object({
        desvioId: z.number(),
        acao: z.string().min(1),
        responsavel: z.string().min(1),
        responsavelTipo: z.enum(["membro", "fornecedor"]).default("membro"),
        responsavelId: z.number().optional(),
        responsavelEmail: z.string().optional(),
        prioridade: z.enum(["urgente", "normal", "baixa"]).default("normal"),
        prazo: z.number(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createPlanoAcao(input);
        await db.createHistorico({
          desvioId: input.desvioId,
          tipo: "plano_acao",
          descricao: `Plano de ação criado [${input.prioridade.toUpperCase()}]: ${input.acao.substring(0, 80)}`,
          userName: (ctx.user?.name || "Usuário"),
          userId: (ctx.user?.id ?? 0),
        });
        // Notify owner and responsible about new action plan
        try {
          const desvio = await db.getDesvioById(input.desvioId);
          const { notifyOwner } = await import("./_core/notification");
          const tipoResp = input.responsavelTipo === "fornecedor" ? "Fornecedor" : "Equipe AW";
          const emailInfo = input.responsavelEmail ? `\nE-mail responsável: ${input.responsavelEmail}` : "";
          await notifyOwner({
            title: `Novo Plano de Ação [${input.prioridade.toUpperCase()}] - Desvio #${input.desvioId}`,
            content: `Responsável: ${input.responsavel} (${tipoResp})${emailInfo}\nAção: ${input.acao}\nPrazo: ${new Date(input.prazo).toLocaleDateString("pt-BR")}\nDesvio: ${desvio?.descricao?.substring(0, 100) || "N/A"}\nPrioridade: ${input.prioridade.toUpperCase()}\n\nPor favor, encaminhe esta notificação ao responsável${input.responsavelEmail ? " (" + input.responsavelEmail + ")" : ""}.`,
          });
          await db.updatePlanoAcao(result.id, { notificadoEm: Date.now() });
        } catch (e) {
          console.warn("[Notification] Failed to notify about new plano:", e);
        }
        // Criar notificação interna para todos admins
        try {
          const desvioInfo = await db.getDesvioById(input.desvioId);
          const tipoResp = input.responsavelTipo === "fornecedor" ? "Fornecedor" : "Equipe AW";
          await db.criarNotificacaoParaTodosAdmins({
            titulo: `Novo Plano de Ação [${input.prioridade.toUpperCase()}]`,
            mensagem: `Plano criado para Desvio #${input.desvioId}: ${input.acao.substring(0, 100)}\nResponsável: ${input.responsavel} (${tipoResp})\nPrazo: ${new Date(input.prazo).toLocaleDateString("pt-BR")}`,
            tipo: "plano_criado",
            referenciaId: input.desvioId,
            referenciaTipo: "desvio",
          });
        } catch (e) {
          console.warn("[Notificacao] Failed to create internal notification:", e);
        }
        return result;
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        desvioId: z.number(),
        acao: z.string().optional(),
        responsavel: z.string().optional(),
        responsavelTipo: z.enum(["membro", "fornecedor"]).optional(),
        responsavelId: z.number().optional(),
        responsavelEmail: z.string().optional(),
        prioridade: z.enum(["urgente", "normal", "baixa"]).optional(),
        prazo: z.number().optional(),
        status: z.enum(["pendente", "em_andamento", "concluido"]).optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, desvioId, ...data } = input;
        await db.updatePlanoAcao(id, data);
        if (data.status) {
          await db.createHistorico({
            desvioId,
            tipo: "plano_acao",
            descricao: `Plano de ação atualizado para "${data.status}"`,
            para: data.status,
            userName: (ctx.user?.name || "Usuário"),
            userId: (ctx.user?.id ?? 0),
          });
        }
        return { success: true };
      }),
    checkAlerts: publicProcedure
      .mutation(async () => {
        return db.checkAndSendAlerts();
      }),
  }),

  // ── Histórico ─────────────────────────────────────────────
  historico: router({
    listByDesvio: publicProcedure
      .input(z.object({ desvioId: z.number() }))
      .query(async ({ input }) => {
        return db.listHistoricoByDesvio(input.desvioId);
      }),
    addComment: publicProcedure
      .input(z.object({
        desvioId: z.number(),
        descricao: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createHistorico({
          desvioId: input.desvioId,
          tipo: "comentario",
          descricao: input.descricao,
          userName: (ctx.user?.name || "Usuário"),
          userId: (ctx.user?.id ?? 0),
        });
        return { success: true };
      }),
  }),

  // ── KPIs ──────────────────────────────────────────────────
  kpis: router({
    get: publicProcedure
      .input(z.object({ obraId: z.number().optional(), origem: z.enum(["qualidade", "punch_list", "pos_obra"]).optional() }).optional())
      .query(async ({ input }) => {
        return db.getKpis(input?.obraId, input?.origem);
      }),
    fornecedorPerformance: publicProcedure
      .input(z.object({ obraId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getFornecedorPerformance(input?.obraId);
      }),
  }),

  // ── Assistente LLM ────────────────────────────────────────
  llm: router({
    ask: publicProcedure
      .input(z.object({
        question: z.string().min(1),
        obraId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const data = await db.getDataForLLM(input.obraId);
        const systemPrompt = `Você é o QualiControl AI, um assistente especializado em gestão de qualidade de obras de construção civil e interiores corporativos.

Você tem acesso aos seguintes dados atuais do sistema:

**KPIs Gerais:**
${JSON.stringify(data.kpis, null, 2)}

**Performance de Fornecedores:**
${JSON.stringify(data.performance, null, 2)}

**Últimos Desvios Registrados (até 50):**
${JSON.stringify(data.recentDesvios?.map(d => ({
  id: d.id,
  disciplina: d.disciplina,
  fornecedor: d.fornecedorNome,
  descricao: d.descricao,
  severidade: d.severidade,
  status: d.status,
  localizacao: d.localizacao,
  dataIdentificacao: new Date(d.dataIdentificacao).toLocaleDateString('pt-BR'),
})), null, 2)}

**Obras cadastradas:**
${JSON.stringify(data.obras?.map(o => ({ id: o.id, codigo: o.codigo, nome: o.nome, status: o.status })), null, 2)}

Responda em português brasileiro de forma clara, objetiva e profissional. Use dados concretos nas respostas. Quando relevante, sugira ações corretivas específicas.`;

        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.question },
          ],
        });

        const content = result.choices[0]?.message?.content;
        const answer = typeof content === "string" ? content : Array.isArray(content) ? content.map(c => 'text' in c ? c.text : '').join('') : '';
        return { answer };
      }),
    suggestQuestions: publicProcedure
      .input(z.object({ obraId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const data = await db.getDataForLLM(input?.obraId);
        if (!data.kpis || data.kpis.total === 0) {
          return { suggestions: [
            "Como começar a registrar desvios de qualidade?",
            "Quais disciplinas devo monitorar em obras de interiores?",
            "Como avaliar a performance de fornecedores?",
          ]};
        }

        const systemPrompt = `Você é o QualiControl AI. Com base nos dados abaixo, gere exatamente 5 perguntas relevantes e contextuais que o gestor de qualidade deveria fazer para tomar melhores decisões. As perguntas devem ser específicas aos dados, não genéricas.

**KPIs:** ${JSON.stringify(data.kpis)}
**Performance Fornecedores:** ${JSON.stringify(data.performance)}
**Quantidade de desvios recentes:** ${data.recentDesvios?.length || 0}

Retorne APENAS um JSON array de strings com as 5 perguntas, sem explicação adicional.`;

        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Gere as perguntas sugeridas." },
            ],
          });
          const content = result.choices[0]?.message?.content;
          const text = typeof content === "string" ? content : "";
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const suggestions = JSON.parse(jsonMatch[0]);
            return { suggestions: suggestions.slice(0, 5) };
          }
        } catch (e) {
          console.error("Error generating suggestions:", e);
        }
        return { suggestions: [
          "Qual a tendência de desvios nas últimas semanas?",
          "Quais fornecedores precisam de atenção imediata?",
          "Existem disciplinas com desvios recorrentes?",
          "Qual o impacto dos desvios graves no cronograma?",
          "Como melhorar a taxa de fechamento de desvios?",
        ]};
      }),
  }),

  // ── Checklist ─────────────────────────────────────────
  checklist: router({
    getCompleto: publicProcedure.query(async () => {
      return db.getChecklistCompleto();
    }),
    updateSecao: publicProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        peso: z.number().min(0).optional(),
        reincidencia: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSecao(id, data);
        return { success: true };
      }),
    createItem: publicProcedure
      .input(z.object({
        secaoId: z.number(),
        codigo: z.string().min(1),
        descricao: z.string().min(1),
        ordem: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.createChecklistItem(input);
      }),
    updateItem: publicProcedure
      .input(z.object({
        id: z.number(),
        codigo: z.string().optional(),
        descricao: z.string().optional(),
        ordem: z.number().optional(),
        ativo: z.number().min(0).max(1).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateChecklistItem(id, data);
        return { success: true };
      }),
  }),

  // ── Faixas de Classificação ──────────────────────────────
  configFaixas: router({
    list: publicProcedure.query(async () => {
      return db.listConfigFaixas();
    }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        minimo: z.number().min(0).max(100).optional(),
        maximo: z.number().min(0).max(100).optional(),
        cor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateConfigFaixa(id, data);
        return { success: true };
      }),
  }),

  // ── Verificações ───────────────────────────────────────
  verificacoes: router({
    list: publicProcedure
      .input(z.object({ obraId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.listVerificacoes(input?.obraId);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const verificacao = await db.getVerificacaoById(input.id);
        if (!verificacao) return null;
        const respostas = await db.getVerificacaoRespostas(input.id);
        const checklist = await db.getChecklistCompleto();
        return { ...verificacao, respostas, checklist };
      }),
    create: publicProcedure
      .input(z.object({
        obraId: z.number(),
        avaliador: z.string().min(1),
        dataVistoria: z.number(),
        go: z.string().optional(),
        gc: z.string().optional(),
        nucleo: z.string().optional(),
        diretoria: z.string().optional(),
        observacoes: z.string().optional(),
        respostas: z.array(z.object({
          itemId: z.number(),
          resposta: z.enum(["AT", "NAT", "GR", "NA"]),
          observacao: z.string().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { respostas, ...verData } = input;
        
        // Buscar seções, itens e faixas para calcular scores
        const secoes = await db.listChecklistSecoes();
        const itens = await db.listChecklistItens();
        const faixas = await db.listConfigFaixas();
        
        // Calcular scores
        const scores = db.calcularScores(secoes, itens, respostas, faixas);
        
        // Criar verificação com scores
        const result = await db.createVerificacao({
          ...verData,
          scoreGeral: scores.scoreGeral,
          scoreCondicao: scores.scoreCondicao,
          scoreCronograma: scores.scoreCronograma,
          scoreQualidade: scores.scoreQualidade,
          statusGeral: scores.statusGeral,
          statusCondicao: scores.statusCondicao,
          statusCronograma: scores.statusCronograma,
          statusQualidade: scores.statusQualidade,
        });
        
        // Inserir respostas
        await db.createVerificacaoRespostas(
          respostas.map(r => ({
            verificacaoId: result.id,
            itemId: r.itemId,
            resposta: r.resposta,
            observacao: r.observacao || null,
          }))
        );
        
        return { id: result.id, scores };
      }),
  }),  // ── Notificações Internas ───────────────────────────────
  notificacoes: router({
    list: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) return [];
        return db.listNotificacoes(ctx.user.id);
      }),
    countNaoLidas: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) return { count: 0 };
        const count = await db.countNotificacoesNaoLidas(ctx.user.id);
        return { count };
      }),
    marcarLida: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Usuário não autenticado");
        await db.marcarNotificacaoLida(input.id, ctx.user.id);
        return { success: true };
      }),
    marcarTodasLidas: publicProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user) throw new Error("Usuário não autenticado");
        await db.marcarTodasLidas(ctx.user.id);
        return { success: true };
      }),
  }),

  // ── Relatório PDF ──────────────────────────────────────────────
  relatorio: router({
    generate: publicProcedure
      .input(z.object({
        obraId: z.number().optional(),
        incluirAnalise: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const data = await db.getDataForLLM(input.obraId);
        const kpis = data.kpis;
        const performance = data.performance;
        const desviosData = data.recentDesvios || [];
        const obraInfo = input.obraId
          ? data.obras?.find(o => o.id === input.obraId)
          : null;

        let analise = "";
        if (input.incluirAnalise && kpis && kpis.total > 0) {
          try {
            const result = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `Você é um consultor sênior de qualidade em obras. Gere uma análise executiva concisa (máximo 400 palavras) sobre a situação da qualidade com base nos dados abaixo. Inclua: 1) Resumo da situação, 2) Pontos críticos, 3) Recomendações. Use linguagem profissional e objetiva em português brasileiro.\n\nKPIs: ${JSON.stringify(kpis)}\nPerformance Fornecedores: ${JSON.stringify(performance)}\nTotal de desvios recentes: ${desviosData.length}`,
                },
                { role: "user", content: "Gere a análise executiva para o relatório." },
              ],
            });
            const content = result.choices[0]?.message?.content;
            analise = typeof content === "string" ? content : "";
          } catch (e) {
            analise = "Análise não disponível no momento.";
          }
        }

        return {
          obraInfo: obraInfo ? { codigo: obraInfo.codigo, nome: obraInfo.nome } : null,
          dataGeracao: Date.now(),
          kpis,
          performance: performance?.slice(0, 10) || [],
          desviosAbertos: desviosData
            .filter(d => d.status !== "fechado")
            .slice(0, 30)
            .map(d => ({
              id: d.id,
              disciplina: d.disciplina,
              fornecedor: d.fornecedorNome,
              descricao: d.descricao,
              severidade: d.severidade,
              status: d.status,
              localizacao: d.localizacao,
              dataIdentificacao: d.dataIdentificacao,
              prazoSugerido: d.prazoSugerido,
            })),
          analise,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
