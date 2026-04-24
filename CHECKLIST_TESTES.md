# ✅ Checklist de Testes Locais

Use este checklist para validar que a aplicação está funcionando corretamente após setup local.

---

## 🟢 Setup Básico

- [ ] Dependências instaladas: `pnpm install` ✅
- [ ] `.env` criado e preenchido com valores
- [ ] MySQL rodando e conectável
- [ ] Migrações aplicadas: `pnpm db:push` ✅
- [ ] Servidor inicia: `pnpm dev` ✅

---

## 🌐 Frontend

### Navegação
- [ ] Página inicial (Dashboard) carrega
- [ ] Menu lateral (sidebar) aparece e é navegável
- [ ] Logo AW branco aparece na sidebar
- [ ] Responsividade: tela mobile mostra menu colapsado
- [ ] Links de navegação funcionam:
  - [ ] Home
  - [ ] Desvios
  - [ ] Fornecedores
  - [ ] Obras
  - [ ] Verificações
  - [ ] Relatórios
  - [ ] Assistente IA
  - [ ] Administração

### Dashboard
- [ ] Cards de KPIs aparecem (Total, Abertos, Fechados, Atrasados)
- [ ] Gráficos carregam:
  - [ ] Barras por disciplina
  - [ ] Donut por severidade
  - [ ] Barras por fornecedor
- [ ] Filtro por obra funciona e atualiza gráficos
- [ ] Clicar em métrica navega para lista filtrada

### Desvios
- [ ] **Listar**
  - [ ] Lista carrega com desvios
  - [ ] Filtros funcionam: obra, status, severidade, disciplina, origem, classificação
  - [ ] Busca por texto funciona
  - [ ] Paginação funciona (se aplicável)
  - [ ] Ordenação funciona

- [ ] **Criar**
  - [ ] Formulário carrega
  - [ ] Campos obrigatórios: disciplina, fornecedor, descrição, severidade, prazo
  - [ ] Upload de fotos funciona
  - [ ] Salvar criar novo desvio ✅
  - [ ] Redirecionamento para detalhe após criar

- [ ] **Detalhes**
  - [ ] Página carrega com informações completo
  - [ ] Timeline histórica mostra eventos
  - [ ] Status workflow funciona (Aberto → Em Análise → Resolvido)
  - [ ] Planos de Ação aparecem
  - [ ] Adicionar novo plano funciona
  - [ ] Fotos de evidência aparecem
  - [ ] Upload nova foto funciona
  - [ ] Comentários funcionam (criar, listar)
  - [ ] Edição de campos funciona

### Fornecedores
- [ ] Lista carrega com fornecedores
- [ ] Ranking/performance mostra
- [ ] Gráfico de performance carrega
- [ ] Criar novo fornecedor funciona
- [ ] Detalhes do fornecedor mostram histórico

### Obras
- [ ] Lista carrega com obras
- [ ] Cards mostram informações
- [ ] Criar nova obra funciona
- [ ] Editar obra funciona

### Verificações (Checklists)
- [ ] Lista de verificações carrega
- [ ] Criar nova verificação funciona
- [ ] Responder itens do checklist funciona
- [ ] Salvar respostas funciona

### Relatórios
- [ ] Página carrega dados
- [ ] Gráficos consolidados aparecem
- [ ] IA analysis section carrega (se LLM configurado)
- [ ] Preview PDF funciona
- [ ] Download/Impressão funciona

### Assistente IA (Opcional)
- [ ] Chat carrega
- [ ] Mensagens podem ser digitadas
- [ ] Respostas aparecem (com IA configurada)
- [ ] Perguntas sugeridas aparecem

---

## 🔐 Autenticação

### Sem OAuth (Development)
- [ ] Pode acessar sem login em modo desenvolvimento
- [ ] User context está disponível (se mock implementado)

### Com OAuth (Production)
- [ ] Login com Manu.ia funciona
- [ ] Após login, redireciona para dashboard
- [ ] Cookie JWT está presente (DevTools → Application → Cookies)
- [ ] Logout funciona
- [ ] Depois de logout, redireciona para login

---

## 💾 API tRPC

### Requisições básicas
- [ ] GET /api/trpc/obras.listar retorna lista
- [ ] GET /api/trpc/fornecedores.listar retorna lista
- [ ] GET /api/trpc/desvios.listar retorna lista
- [ ] POST /api/trpc/desvios.criar cria desvio ✅

### Upload de Arquivos (S3)
- [ ] Upload de foto em desvio funciona (se S3 configurado)
- [ ] Imagem aparece na página após upload
- [ ] Delete de foto funciona

### Performance
- [ ] Listagens carregam em < 1s
- [ ] Gráficos renderizam em < 2s
- [ ] Sem erros de timeout

---

## 🗄️ Banco de Dados

### Estrutura
- [ ] Tabelas criadas: `obras`, `fornecedores`, `desvios`, `fotos_evidencia`, `planos_acao`, `historico`
- [ ] Seed data carregou (obras de exemplo, fornecedores, etc)

### Integridade
- [ ] Chaves estrangeiras funcionam
- [ ] Deleting com cascade funciona corretamente
- [ ] Soft deletes funcionam (se implementado)

### Queries
- [ ] Filtros complexos funcionam (múltiplos filtros simultâneos)
- [ ] Full-text search funciona (em descrição)
- [ ] Aggregations funcionam (COUNT, SUM, AVG)

---

## 📊 KPIs & Métricas

- [ ] Total de desvios calculado corretamente
- [ ] Desvios abertos contagem correta
- [ ] Desvios fechados contagem correta
- [ ] Desvios atrasados (prazo < hoje) contagem correta
- [ ] Distribuição por disciplina está correta
- [ ] Distribuição por severidade está correta
- [ ] Distribuição por fornecedor está correta
- [ ] Performance by fornecedor (tempo médio, taxa) calculada

---

## 🧪 Testes Automatizados

```bash
pnpm test
```

- [ ] Testes executam sem erro
- [ ] Cobertura acima de 80% (ideal)
- [ ] Nenhum warning no console

---

## 🚨 Tratamento de Erros

- [ ] Erro de conexão DB mostra mensagem amigável
- [ ] Erro de autenticação redireciona para login
- [ ] Erro de upload mostra notificação
- [ ] Erro de validation mostra mensagem no form
- [ ] Console não mostra erros não-tratados

---

## ⚡ Performance & Responsividade

### Desktop (1920px+)
- [ ] Layout completo aparece sem corte
- [ ] Sidebar visível
- [ ] Gráficos têm espaço suficiente

### Tablet (768px - 1024px)
- [ ] Menu colapsável funciona
- [ ] Gráficos respondem corretamente
- [ ] Tabelas são scrolláveis se necessário

### Mobile (< 768px)
- [ ] Menu em hamburger menu
- [ ] Cards empilham verticalmente
- [ ] Touch events funcionam
- [ ] Sem horizontal scroll desnecessário

### Performance
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 4s
- [ ] Interaction to Next Paint (INP) < 200ms

---

## 🎨 Design & UX

- [ ] Paleta de cores (slate/emerald) consistente
- [ ] Fonte Inter carregando corretamente
- [ ] Sombras suaves aplicadas em cards
- [ ] ícones aparecem corretamente
- [ ] Loading states mostram spinners/skeletons
- [ ] Empty states mostram mensagens apropriadas
- [ ] Toast notifications aparecem e desaparecem corretamente

---

## 📝 Seed Data

Execute `pnpm db:push` + seed scripts para popular dados:

```bash
# Opcional: popular dados de exemplo
node seed-data.mjs      # Obras, fornecedores, desvios
node seed-membros.mjs   # Membros da equipe
node seed-checklist.mjs # Itens de checklist
```

- [ ] Após seed, dados aparecem no frontend
- [ ] KPIs refletem seed data corretamente

---

## 🐳 Com Docker (Opcional)

Se usar Docker para MySQL:

```bash
docker run --name qualicontrol-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=qualicontrol \
  -p 3306:3306 \
  -d mysql:8
```

- [ ] Container inicia sem erro
- [ ] Conexão MySQL funciona
- [ ] `mysql -u root -p -h localhost` conecta

---

## 🎬 Checklist Final

- [ ] Todos os itens acima marcados ✅
- [ ] Nenhum erro no console (DevTools)
- [ ] Sem warnings de performance
- [ ] Aplicação pronta para entrega ao cliente

---

## 🚀 Problemas Comuns & Soluções

| Problema | Solução |
|----------|---------|
| "Cannot connect to MySQL" | Verifique DATABASE_URL no .env |
| "Invalid JWT token" | Confirme JWT_SECRET no .env |
| "App ID invalid" | Obtenha VITE_APP_ID do console Manu.ia |
| "Port 3000 in use" | Mude PORT no .env ou mate processo |
| "pnpm command not found" | `npm install -g pnpm` |
| "Build fails" | `rm -rf dist && pnpm build` |

---

**Atualizado**: 24 de abril de 2026
