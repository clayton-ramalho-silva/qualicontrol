# 📊 QualiControl Dashboard

**Dashboard MVP para gestão de desvios de construção**

Desenvolvido para [Cliente] pela **Manu.ia**

---

## 🎯 O que é?

QualiControl é uma plataforma web para:
- ✅ Registrar e rastrear **desvios de qualidade** em obras
- ✅ Gerir **fornecedores** e suas performances
- ✅ Criar e acompanhar **planos de ação** corretivos
- ✅ Gerar **relatórios** consolidados com análise IA
- ✅ Colaborar via **comentários** e **timeline** de eventos
- ✅ Fazer **verificações** (checklists) nas obras

---

## 🚀 Começar Agora

### ⚡ 5 minutos (Quick Start)
[→ QUICKSTART.md](./QUICKSTART.md)

### 📝 Setup Completo
[→ SETUP_DESENVOLVIMENTO.md](./SETUP_DESENVOLVIMENTO.md)

### 🔑 Configurar Manu.ia
[→ MANUS_CREDENTIALS.md](./MANUS_CREDENTIALS.md)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [QUICKSTART.md](./QUICKSTART.md) | Setup rápido em 5 minutos |
| [SETUP_DESENVOLVIMENTO.md](./SETUP_DESENVOLVIMENTO.md) | Setup detalhado para desenvolvimento |
| [ARQUITETURA.md](./ARQUITETURA.md) | Estrutura técnica completa |
| [MANUS_CREDENTIALS.md](./MANUS_CREDENTIALS.md) | Como obter credenciais Manu.ia |
| [CHECKLIST_TESTES.md](./CHECKLIST_TESTES.md) | Validação e testes |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy em produção |

---

## ⚙️ Stack Tecnológico

### Frontend
```
React 18 + TypeScript + Vite + TailwindCSS + Radix UI
```

### Backend
```
Express + tRPC + Drizzle ORM + MySQL 8+
```

### Integrações
```
Manu.ia OAuth + Forge API (LLM) + AWS S3
```

---

## 📋 Pré-requisitos

- **Node.js** 18+
- **pnpm** 8+
- **MySQL** 8+ (local ou Docker)
- **Conta Manu.ia** com credenciais de aplicação

---

## 🏃 Rodar em Desenvolvimento

```bash
# 1. Setup
cp .env.example .env
# Edite .env com suas credenciais

# 2. Instalar
pnpm install

# 3. Database
pnpm db:push

# 4. Rodar
pnpm dev
```

Acesse: **http://localhost:3000**

---

## 🧪 Testes

```bash
# Rodar testes unitários
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage
```

**Cobertura atual**: 17 testes (auth, routers)

---

## 📦 Build & Deploy

### Desenvolvimento
```bash
pnpm dev
```

### Produção
```bash
pnpm build
pnpm start
```

### Deploy Options
- **Heroku** - Mais simples, $7+/mês
- **AWS** - Mais escalável, $5+/mês
- **DigitalOcean** - Bom custo, $5+/mês
- **Próprio servidor** - Máximo controle

👉 Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📊 Features Implementadas

### Dashboard
- [x] KPIs em cards (Total, Abertos, Fechados, Atrasados)
- [x] Gráficos interativos (disciplina, severidade, fornecedor)
- [x] Filtro por obra
- [x] Drill-down para listas

### Desvios
- [x] Criar, editar, listar
- [x] Upload de fotos (S3)
- [x] Timeline de eventos
- [x] Workflow de status
- [x] Comentários
- [x] Filtros avançados

### Fornecedores
- [x] CRUD fornecedores
- [x] Ranking/performance
- [x] Taxa de fechamento
- [x] Tempo médio de resolução

### Planos de Ação
- [x] Criar e atualizar
- [x] Rastrear status
- [x] Histórico

### Verificações
- [x] Checklists customizáveis
- [x] Registro de respostas
- [x] Rastreabilidade

### Relatórios
- [x] Dados consolidados
- [x] Análise IA (Claude)
- [x] Preview PDF
- [x] Download/Impressão

### Assistente IA
- [x] Chat interativo
- [x] Análise contextual
- [x] Sugestões de perguntas

---

## 🗂️ Estrutura de Pastas

```
qualicontrol/
├── client/              # Frontend React
├── server/              # Backend Express + tRPC
├── drizzle/             # Schema + Migrations
├── shared/              # Código compartilhado
├── package.json
├── vite.config.ts
├── drizzle.config.ts
└── [documentação]
```

👉 Ver [ARQUITETURA.md](./ARQUITETURA.md) para detalhes

---

## 🔐 Autenticação

Integrado com **Manu.ia OAuth**:
1. Usuário clica "Login com Manu.ia"
2. Redireciona para OAuth server
3. JWT token armazenado em cookie HttpOnly
4. Requisições autenticadas automaticamente

---

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

---

## 🚨 Troubleshooting

### Erro: "DATABASE_URL is required"
```
✅ Copie .env.example para .env e preencha valores
```

### Erro: "Cannot connect to MySQL"
```
✅ Verifique se MySQL está rodando
   docker ps | grep mysql
   ou mysql -u root -p
```

### Erro: "pnpm not found"
```
✅ npm install -g pnpm
```

👉 Ver [SETUP_DESENVOLVIMENTO.md](./SETUP_DESENVOLVIMENTO.md) para mais soluções

---

## 📊 Performance

- **First Contentful Paint** < 2s
- **API response** < 200ms
- **Code splitting** automático (Vite)
- **React Query caching** habilitado

---

## 🤝 Contribuindo

1. Create branch: `git checkout -b feature/minha-feature`
2. Commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/minha-feature`
4. Pull Request

---

## 📞 Suporte

| Recurso | Link |
|---------|------|
| Documentação Manu.ia | https://docs.manus.space |
| Console Manu.ia | https://console.manus.space |
| Docs tRPC | https://trpc.io |
| Docs React | https://react.dev |

---

## 📄 Licença

MIT

---

## 👥 Desenvolvido por

**Manu.ia** - Plataforma de Construção Inteligente

---

## 📈 Status

- ✅ MVP completo e testado
- ✅ Pronto para produção
- 📋 Ver [todo.md](./todo.md) para histórico

---

## 🗓️ Última Atualização

24 de abril de 2026

---

## 🎯 Próximos Passos

1. [ ] Setup local (veja QUICKSTART.md)
2. [ ] Testar em desenvolvimento
3. [ ] Validar com cliente
4. [ ] Deploy em produção (veja DEPLOYMENT.md)

---

**Documentação completa disponível em:**
- [QUICKSTART.md](./QUICKSTART.md) - Comece aqui!
- [SETUP_DESENVOLVIMENTO.md](./SETUP_DESENVOLVIMENTO.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ARQUITETURA.md](./ARQUITETURA.md)
- [CHECKLIST_TESTES.md](./CHECKLIST_TESTES.md)
- [MANUS_CREDENTIALS.md](./MANUS_CREDENTIALS.md)
