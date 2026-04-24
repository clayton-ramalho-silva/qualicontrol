# Project TODO

## Estrutura de Dados
- [x] Schema do banco: tabelas obras, fornecedores, desvios, fotos_evidencia, planos_acao, historico
- [x] Migração SQL e seed data inicial com obras de exemplo (FRECFUNCHAL, TORRE ALPHA, FARIA LIMA)

## Backend (tRPC Routers)
- [x] Obras: listar, criar, editar
- [x] Fornecedores: listar, criar
- [x] Desvios: listar com filtros, criar, editar, alterar status
- [x] Upload de fotos de evidência para S3
- [x] Planos de Ação: listar, criar, atualizar status
- [x] Registro automático de histórico (criação, status, edição, comentário, foto)
- [x] KPIs e métricas agregadas (total, abertos, fechados, atrasados, por disciplina, por fornecedor, por severidade)
- [x] Performance de fornecedores (ranking, tempo médio, avaliação)
- [x] Integração LLM para assistente de análise
- [x] Geração de sugestões de perguntas contextuais via LLM
- [x] Endpoint de geração de dados para relatório consolidado com análise IA
- [x] Página de relatório com preview e impressão/PDF via navegador

## Frontend - Layout e Design
- [x] Design system elegante com paleta slate/emerald, fonte Inter, sombras suaves
- [x] DashboardLayout com sidebar QualiControl e navegação

## Frontend - Páginas
- [x] Dashboard de KPIs com cards de métricas e gráficos (barras por disciplina, donut por severidade, barras por fornecedor)
- [x] Filtro por obra no dashboard
- [x] Drilldown interativo: clicar em métricas do dashboard navega para lista filtrada
- [x] Formulário de captura de desvios com campos: disciplina, fornecedor, descrição, localização, severidade, data, prazo, upload de fotos
- [x] Prompts amigáveis e ícones informativos no formulário
- [x] Lista de desvios com filtros dinâmicos (obra, status, severidade, disciplina, fornecedor)
- [x] Página de detalhe do desvio com informações completas
- [x] Timeline visual de histórico de alterações
- [x] Planos de ação na página de detalhe (criar, atualizar status)
- [x] Comentários no desvio
- [x] Fotos de evidência na página de detalhe
- [x] Painel de fornecedores com ranking e gráfico de barras
- [x] Tabela de performance com taxa de fechamento e tempo médio
- [x] Cadastro de novos fornecedores
- [x] Página de obras com cards e cadastro
- [x] Assistente IA com chat e perguntas sugeridas contextuais

## Testes
- [x] Testes vitest para routers principais (17 testes passando)

## Branding AW
- [x] Integrar logo AW branco na sidebar (fundo escuro)
- [x] Integrar logo AW preto na tela de login
- [x] Gerar e configurar favicon a partir do logo AW

## Acesso Público
- [x] Remover exigência de login - acesso direto ao dashboard sem autenticação

## Melhorias Visuais
- [x] Corrigir gráfico donut de severidade - labels cortados/overflow
- [x] Melhorar gráfico de barras por disciplina - visual mais elegante

## Módulo Lista de Verificação (Checklist)
- [x] Schema: tabelas checklist_secoes, checklist_itens, verificacoes, verificacao_respostas, config_pesos, config_faixas
- [x] Migração SQL aplicada
- [x] Seed data com 4 seções e 30 itens do checklist da planilha
- [x] Backend: CRUD de seções e itens do checklist
- [x] Backend: CRUD de verificações (preenchimento do checklist)
- [x] Backend: Cálculo automático de scores por dimensão (ÓTIMA/REGULAR/RUIM/CRÍTICO)
- [x] Backend: Endpoints de administração de pesos e faixas de classificação
- [x] Frontend: Página de preenchimento do checklist (nova verificação)
- [x] Frontend: Página de histórico de verificações com comparação temporal
- [x] Frontend: Área de administração de pesos por seção e faixas de classificação
- [x] Frontend: Integração dos scores da LV no dashboard principal
- [x] Sidebar: Adicionar itens Verificações e Administração na navegação
- [x] Testes unitários para cálculo de scores e classificação
- [x] Integrar scores da última verificação no dashboard principal (Home.tsx)

## Menu / Navegação
- [x] Reorganizar sidebar: Dashboard > Verificações > Novo Desvio > Desvios > Assistente IA > Relatório > [separador] > Obras > Fornecedores > Administração

## Melhorias Fornecedores
- [x] Adicionar campo de e-mail no schema/banco de fornecedores
- [x] Filtro de busca na lista de fornecedores
- [x] Edição de fornecedor (nome, disciplina, e-mail)
- [x] Atualizar frontend Fornecedores.tsx com filtro, edição e e-mail

## Módulo Usuários
- [x] Schema: tabela membros_equipe (nome, email, telefone, cargo, obras vinculadas)
- [x] Migração SQL aplicada
- [x] Backend: CRUD de membros (listar, criar, editar, getById)
- [x] Frontend: Página de Usuários com filtro, cadastro e edição
- [x] Sidebar: Adicionar item Usuários entre Fornecedores e Administração
- [x] Seed data com membros do relatório FRECFUNCHAL
- [x] Testes unitários para routers de membros

## Melhorias Dashboard
- [x] Exibir nome da obra na seção Última Verificação do dashboard

## Bloco 1 — Categorização e Evidências
- [x] Schema: campo origem no desvio (qualidade / punch_list / pos_obra)
- [x] Schema: campos de tags no desvio (critico, seguranca_trabalho, solicitado_cliente)
- [x] Schema: novo status "aguardando_aceite" no enum de status do desvio
- [x] Schema: campo tipo na foto_evidencia (abertura / fechamento)
- [x] Backend: atualizar CRUD de desvios com novos campos
- [x] Backend: lógica de foto obrigatória para fechar desvio
- [x] Frontend: campos origem e tags no formulário de Novo Desvio
- [x] Frontend: separação visual de fotos (Abertura vs Fechamento) no detalhe
- [x] Frontend: exigir upload de foto ao fechar desvio
- [x] Frontend: filtros por origem e tags na lista de desvios e dashboard
- [x] Testes unitários para novos campos e lógica de fechamento

## Bloco 2 — Plano de Ação e Notificações
- [x] Schema: campo prioridade no plano_acao (urgente / normal / baixa)
- [x] Schema: campos responsavelTipo e responsavelId no plano_acao (membro ou fornecedor)
- [x] Migração SQL aplicada
- [x] Backend: atualizar CRUD de planos de ação com novos campos
- [x] Backend: notificação ao owner ao criar plano de ação
- [x] Backend: lembrete de prazo (2 dias antes) e alerta de atraso automáticos via cron
- [x] Frontend: seletor de responsável (Equipe AW ou Fornecedor) no formulário de plano de ação
- [x] Frontend: botões de prioridade (Urgente / Normal / Baixa) no formulário
- [x] Frontend: indicadores visuais de prioridade, tipo de responsável e atraso na lista de planos
- [x] Testes unitários para novos campos e lógica de alertas (49 testes passando)

## Melhoria Dashboard — Filtro por Vertical (Origem)
- [x] Substituir card "Desvios por Origem" por 3 ícones visuais clicáveis (Qualidade, Punch List, Pós-Obra)
- [x] Ícones funcionam como filtro toggle: ao clicar, filtra todo o dashboard pela vertical selecionada
- [x] Backend: suportar parâmetro origem no endpoint de KPIs
- [x] KPIs, gráficos e métricas se atualizam conforme a vertical selecionada
- [x] Visual: ícones representativos e distintos para cada vertical, com estado ativo/inativo

## Melhoria Layout Filtros — Página de Desvios
- [x] Reorganizar filtros: título acima, busca em linha separada (largura total), combos em grid 6 colunas organizado

## Sistema de Notificações Internas
- [x] Schema: tabela notificacoes (id, userId, titulo, mensagem, tipo, referencia, lida, criadoEm)
- [x] Migração SQL aplicada
- [x] Backend: CRUD de notificações (listar, marcar como lida, marcar todas como lidas, contagem não lidas)
- [x] Backend: gatilhos automáticos — novo plano de ação, mudança de status do desvio
- [x] Frontend: ícone sino com badge no header do DashboardLayout
- [x] Frontend: dropdown/painel de notificações com lista, marcar como lida, link direto ao desvio
- [x] Testes unitários para notificações (54 testes passando)

## Melhoria Verificações — Selects de Avaliador/GO/GC
- [x] Frontend: converter campo Avaliador de texto livre para select do cadastro de membros
- [x] Frontend: converter campo Gerente de Obra (GO) de texto livre para select de membros
- [x] Frontend: converter campo Gerente de Contrato (GC) de texto livre para select de membros

## Melhoria Verificações — Pré-preenchimento GO/GC
- [x] Frontend: ao selecionar obra, pré-preencher GO com membro cargo gerente_obra vinculado à obra
- [x] Frontend: ao selecionar obra, pré-preencher GC com membro cargo gerente_contrato vinculado à obra
- [x] Permitir que o usuário altere manualmente após o pré-preenchimento

## Melhoria Dashboard — Mini-cards de Classificação
- [x] Backend: retornar contagem de desvios ativos por classificação (chamado_critico, seguranca_trabalho, solicitado_cliente)
- [x] Frontend: mini-cards com ícones visuais (sirene, capacete, pessoa) e contagem no dashboard
- [x] Frontend: mini-cards clicáveis para filtrar desvios por classificação

## Bug Fix — Alinhar formulários de desvio
- [x] Comparar campos do DesvioNovo.tsx com DesvioDetalhe.tsx e identificar diferenças
- [x] Alinhar campos, layout e comportamento: botão Editar no card Detalhes com modo inline (disciplina, fornecedor, origem, descrição, localização, severidade, prazo, tags/classificações)
