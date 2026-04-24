# 🏗️ Arquitetura Técnica

## 📋 Stack Tecnológico

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** + **Radix UI** - Design system elegante
- **tRPC Client** + **React Query** - Data fetching & caching
- **React Hook Form** - Gerenciamento de formulários
- **Wouter** - Roteamento leve

### Backend
- **Express.js** - Servidor web
- **tRPC** - RPC type-safe
- **Drizzle ORM** - Type-safe SQL
- **MySQL 8+** - Banco de dados relacional

### Integrações Externas
- **AWS S3** - Storage de fotos/evidências
- **Manu.ia OAuth** - Autenticação
- **Forge API (Manu.ia)** - LLM para assistente IA
- **Anthropic Claude** - Análise inteligente

---

## 🗂️ Estrutura de Pastas

```
qualicontrol/
│
├── client/                          # Frontend React
│   ├── index.html
│   ├── public/
│   │   ├── __manus__/              # Debug do Manu.ia
│   │   └── favicon.ico
│   └── src/
│       ├── App.tsx                 # Componente raiz
│       ├── main.tsx                # Entry point
│       ├── index.css               # Estilos globais
│       ├── const.ts                # Constantes frontend
│       ├── pages/                  # Páginas da aplicação
│       │   ├── Home.tsx            # Dashboard
│       │   ├── DesviosList.tsx     # Lista de desvios
│       │   ├── DesvioDetalhe.tsx   # Detalhes do desvio
│       │   ├── DesvioNovo.tsx      # Criar desvio
│       │   ├── Fornecedores.tsx    # Gestão de fornecedores
│       │   ├── Obras.tsx           # Gestão de obras
│       │   ├── Verificacoes.tsx    # Checklist
│       │   ├── Relatorio.tsx       # Relatórios com IA
│       │   ├── Assistente.tsx      # Chat IA
│       │   └── Administracao.tsx   # Admin panel
│       ├── components/              # Componentes reutilizáveis
│       │   ├── DashboardLayout.tsx # Layout principal
│       │   ├── Map.tsx             # Mapa interativo
│       │   ├── AIChatBox.tsx       # Chat IA
│       │   ├── NotificationBell.tsx # Notificações
│       │   └── ui/                 # Componentes Radix UI
│       ├── contexts/               # Context API
│       │   └── ThemeContext.tsx    # Tema claro/escuro
│       ├── hooks/                  # Custom hooks
│       │   ├── useAuth.ts          # Autenticação
│       │   ├── useMobile.tsx       # Responsividade
│       │   └── useComposition.ts   # Composição
│       └── lib/
│           ├── trpc.ts            # Cliente tRPC
│           └── utils.ts           # Utilitários
│
├── server/                          # Backend tRPC
│   ├── routers.ts                  # APIs tRPC (main entry)
│   ├── db.ts                       # Query functions
│   ├── storage.ts                  # S3 upload/download
│   ├── auth.logout.test.ts         # Testes
│   └── _core/
│       ├── index.ts               # Server bootstrap
│       ├── context.ts             # tRPC context
│       ├── env.ts                 # Variáveis de ambiente
│       ├── trpc.ts                # tRPC setup
│       ├── oauth.ts               # Manu.ia OAuth
│       ├── llm.ts                 # Claude LLM integration
│       ├── sdk.ts                 # Manu.ia SDK
│       ├── systemRouter.ts        # System routes (health check)
│       ├── vite.ts                # Vite integration (dev)
│       ├── cookies.ts             # JWT/Session
│       ├── dataApi.ts             # API client
│       ├── map.ts                 # Mapbox integration
│       ├── notification.ts        # Notificações
│       ├── imageGeneration.ts     # Geração de imagens
│       ├── voiceTranscription.ts  # Transcrição de voz
│       └── types/
│           ├── cookie.d.ts
│           └── manusTypes.ts
│
├── drizzle/                         # Database schema & migrations
│   ├── schema.ts                  # Definição de tabelas
│   ├── relations.ts               # Relacionamentos
│   ├── 0000_busy_misty_knight.sql # Migrações SQL
│   ├── 0001_colossal_rage.sql
│   ├── ... (outras migrações)
│   └── meta/
│       └── _journal.json          # Histórico de migrações
│
├── shared/                          # Código compartilhado
│   ├── types.ts                   # Tipos compartilhados
│   └── const.ts                   # Constantes
│
├── package.json                     # Dependências
├── pnpm-lock.yaml                  # Lock file
├── vite.config.ts                  # Configuração Vite
├── vitest.config.ts               # Configuração testes
├── drizzle.config.ts              # Configuração Drizzle
├── tsconfig.json                   # Configuração TypeScript
│
├── .env                            # Variáveis de ambiente (gitignore)
├── .env.example                    # Template .env
├── setup.sh                        # Script de setup
├── SETUP_DESENVOLVIMENTO.md        # Documentação setup
└── TODO.md                         # Tarefas completadas
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER (Client)                  │
│  React Components → tRPC Client → HTTP Requests     │
└────────────────────┬────────────────────────────────┘
                     │ /api/trpc
                     ↓
┌─────────────────────────────────────────────────────┐
│              Express Server (Backend)                │
│  tRPC Router → DB Queries → Response                │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
    ┌────────┐  ┌─────────┐  ┌──────┐
    │ MySQL  │  │   S3    │  │ OAuth│
    │  DB    │  │ Storage │  │Manu │
    └────────┘  └─────────┘  └──────┘
```

---

## 📊 Entidades de Banco de Dados

### Principais Tabelas

```sql
-- Usuários (sincronizados do OAuth Manu.ia)
users
  - id, openId, name, email, loginMethod

-- Estrutura
obras (projects)
  - id, nome, localização, status

fornecedores (contractors)
  - id, nome, email, telefone, status, especialidades

-- Desvios (main entity)
desvios (issues/deviations)
  - id, obra_id, fornecedor_id, disciplina, descrição
  - severidade, status, data, prazo_fechamento
  - localização, created_by, created_at, updated_at

-- Evidências
fotos_evidencia
  - id, desvio_id, url_s3, timestamp, user_id

-- Ações corretivas
planos_acao
  - id, desvio_id, descrição, prazo, status, responsável

-- Histórico (auditoria)
historico
  - id, desvio_id, tipo (criação/status/comentário/foto)
  - user_id, timestamp, dados (JSON)

-- Verificações (Checklists)
verificacoes
  - id, obra_id, data, user_id

verificacao_respostas
  - id, verificacao_id, checklist_item_id, resposta

-- Membros da equipe
membros_equipe
  - id, name, email, role, obra_id

-- Notificações (alerts/reminders)
notificacoes
  - id, user_id, tipo, desvio_id, lido, timestamp
```

---

## 🔐 Autenticação & Segurança

### Fluxo OAuth (Manu.ia)

```
1. Usuário acessa app → clica "Login com Manu.ia"
2. Redireciona para: https://id.manus.space/oauth/authorize?client_id=...
3. Usuário autentica no Manu.ia
4. Redirect para: /api/oauth/callback?code=...&state=...
5. Backend troca code por token via Manu.ia SDK
6. JWT token armazenado em cookie HttpOnly
7. Requisições posteriores incluem token automaticamente
```

### Cookies & Sessions

- JWT token em cookie `HttpOnly` (protegido contra XSS)
- Secret configurado via `JWT_SECRET` env var
- Auto-refresh antes de expirar (6 horas)

---

## 📡 Routers tRPC (APIs)

Estrutura de rotas:

```typescript
// Exemplo de rota
router.query('desvios.listar', {
  input: { obra_id?, status?, severidade? },
  output: Desvio[],
  resolve: async (ctx, input) => { ... }
})

router.mutation('desvios.criar', {
  input: CreateDesvioInput,
  output: Desvio,
  resolve: async (ctx, input) => { ... }
})
```

### Routers Principais (em `server/routers.ts`)

- **Obras** - CRUD obras
- **Fornecedores** - CRUD fornecedores + performance
- **Desvios** - CRUD + filtros + status workflow
- **Planos de Ação** - CRUD planos corretivos
- **Histórico** - Auditoria/timeline
- **Verificações** - Checklists
- **Upload** - Fotos para S3
- **Relatórios** - Dados consolidados com análise IA
- **Notificações** - Alertas automáticos
- **Sistema** - Health check, version, etc

---

## 🚀 Performance & Otimizações

### Frontend
- ✅ Code splitting automático (Vite)
- ✅ React Query caching
- ✅ Lazy loading de páginas (React.lazy)
- ✅ Tailwind CSS purging

### Backend
- ✅ Prepared statements (Drizzle ORM)
- ✅ Connection pooling (MySQL2)
- ✅ Índices em chaves estrangeiras
- ✅ Paginação em listagens

### Database
- ✅ Índices em: `obra_id`, `status`, `severidade`, `user_id`
- ✅ Full-text search pronto
- ✅ Soft deletes quando necessário

---

## 🧪 Testes

```bash
# Unit tests (vitest)
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage
```

**Testes atualmente**: `auth.logout.test.ts`, `routers.test.ts` (17 testes)

---

## 🚢 Build & Deployment

### Desenvolvimento
```bash
pnpm dev  # Vite + Express hot reload
```

### Produção
```bash
pnpm build  # Vite + esbuild bundle
pnpm start  # Node server com static files
```

**Artefatos build**:
- `dist/index.js` - Server bundle
- `dist/client/` - React SPA (static files)

---

## 📚 Dependências Principais

| Package | Versão | Uso |
|---------|--------|-----|
| react | 18 | UI framework |
| vite | 5 | Build tool |
| typescript | 5 | Linguagem |
| @trpc/server | 11 | Backend RPC |
| drizzle-orm | 0.28+ | ORM |
| express | 4 | HTTP server |
| mysql2 | 3 | MySQL driver |
| tailwindcss | 4 | CSS utility |
| @radix-ui/* | 1 | Component library |
| react-hook-form | 7 | Form handling |
| dotenv | 16 | Environment vars |

---

## 🔧 Scripts Disponíveis

```bash
pnpm dev           # Inicia servidor development
pnpm build         # Build para produção
pnpm start         # Roda servidor produção
pnpm check         # Type-check TypeScript
pnpm format        # Prettier format
pnpm test          # Roda testes vitest
pnpm db:push       # Drizzle: generate + migrate
```

---

**Última atualização**: 24 de abril de 2026
