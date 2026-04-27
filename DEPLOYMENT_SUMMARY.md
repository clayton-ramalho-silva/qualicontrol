# 📝 Resumo Executivo - Deployment QualiControl

**Para: DevOps / Tech Lead**  
**De: Development Team**  
**Data:** 24 de abril de 2026

---

## 🎯 O que é?

**Aplicação:** QualiControl - Dashboard de Gestão de Desvios e Qualidade  
**Público:** Equipes de construção, fornecedores, supervisores  
**Escopo:** Full-stack (React + Node.js + MySQL)  

---

## 💻 Requisitos Técnicos Mínimos

| Componente | Requisito | Recomendado | Notas |
|-----------|-----------|------------|-------|
| **CPU** | 1 vCPU | 2+ vCPU | Node.js single-threaded |
| **RAM** | 512 MB | 2+ GB | PM2 pode usar 200-300MB |
| **Storage** | 20 GB | 50+ GB | BD + logs + uploads |
| **Node.js** | 18.0+ | 20 LTS | Sem suporte <18 |
| **MySQL** | 8.0+ | 8.0.32+ | Replicação required? |
| **S3** | Obrigatório | AWS S3 | Para fotos/evidências |
| **SSL** | Obrigatório | Let's Encrypt | HTTPS everywhere |

---

## 🔑 Variáveis de Ambiente (11 necessárias)

```
🔴 CRÍTICAS (falta = app não roda):
  ├─ NODE_ENV=production
  ├─ DATABASE_URL=mysql://...
  ├─ JWT_SECRET=(gerar novo)
  ├─ VITE_APP_ID=(de Manu.ia)
  ├─ VITE_OAUTH_PORTAL_URL=https://id.manus.space
  ├─ OAUTH_SERVER_URL=https://id.manus.space
  └─ OWNER_OPEN_ID=(de Manu.ia)

🟡 RECOMENDADAS (funciona sem, mas com limitações):
  ├─ BUILT_IN_FORGE_API_URL=(Manu.ia)
  ├─ BUILT_IN_FORGE_API_KEY=(Manu.ia)
  └─ AWS_* credenciais (S3)

🟢 OPCIONAIS:
  └─ VITE_ANALYTICS_* (Umami)
```

**Tempo para setup:** 15-20 minutos (se credenciais já tiverem)

---

## 🚀 Build & Deploy

### Build Local (development)

```bash
git clone <repo>
cd qualicontrol
pnpm install --frozen-lockfile
pnpm build
# Output: dist/index.js + dist/public/
```

**Tamanho:** ~50-100MB (com node_modules), ~10MB (sem)  
**Tempo:** 2-3 minutos em máquina normal

### Deploy (3 opções)

```
OPÇÃO 1: Heroku (Mais rápido)
├─ 10 minutos para setup
├─ Autoscale built-in
└─ Custo: $7-50+/mês

OPÇÃO 2: EC2 + NGINX (Recomendado)
├─ 1-2 horas para setup
├─ Controle total
└─ Custo: $5-20/mês

OPÇÃO 3: ECS/Kubernetes (Enterprise)
├─ 2-4 horas para setup
├─ Auto-scaling automático
└─ Custo: $50+/mês
```

---

## 📦 Dependências Externas

### Essenciais (quebra sem elas)

```
✅ MySQL Database
   ├─ Host: db.seu-server.com
   ├─ Port: 3306
   ├─ Database: qualicontrol
   └─ Conexões: 10-50 pool

✅ AWS S3
   ├─ Bucket: qualicontrol-prod-uploads
   ├─ Região: us-east-1
   └─ Permissões: PutObject, GetObject

✅ Manu.ia OAuth
   ├─ App ID: (via console.manus.space)
   ├─ OAuth URL: https://id.manus.space
   └─ Callback: https://seu-dominio.com/api/oauth/callback
```

### Opcionais (degradação graciosa)

```
⭐ Manu.ia Forge API
   └─ Sem: Assistente IA não funciona

⭐ Mapbox
   └─ Sem: Mapa não carrega

⭐ Umami Analytics
   └─ Sem: Nenhuma funcionalidade quebra
```

---

## 🗄️ Banco de Dados

### Schema Overview

```
8 tabelas principais:
├─ users (autenticação)
├─ obras (projetos)
├─ fornecedores (contractors)
├─ desvios (issues - MAIN TABLE)
├─ fotos_evidencia (uploads)
├─ planos_acao (action items)
├─ verificacoes (checklists)
└─ notificacoes (alerts)

Migrações: 8 migrations (drizzle/0000-0007)
Status: Prontas para produção
Tempo: ~30s para aplicar
```

### Backup Strategy

```
Frequência: Diária (mínimo)
Retenção: 7-30 dias
Teste: 1x/mês (restore test)
Destino: S3 ou Google Cloud
```

---

## ✅ Pré-Deploy Checklist

```
INFRAESTRUTURA (2-3 dias)
└─ [ ] Servidor (EC2/VPS/Heroku)
└─ [ ] MySQL Database (RDS/Cloud SQL)
└─ [ ] S3 Bucket + IAM user
└─ [ ] Domínio + DNS
└─ [ ] SSL Certificate

CREDENCIAIS (1 dia)
└─ [ ] JWT_SECRET gerado
└─ [ ] Manu.ia OAuth registrado
└─ [ ] AWS IAM criado
└─ [ ] Forge API key obtida

DEPLOY (2-4 horas)
└─ [ ] Build testado localmente
└─ [ ] Variáveis de env setadas
└─ [ ] DB migrado e validado
└─ [ ] App rodando sem erros
└─ [ ] Health check respondendo

VALIDAÇÃO (1 hora)
└─ [ ] Login com OAuth funciona
└─ [ ] Upload de arquivo funciona
└─ [ ] Dados aparecem no banco
└─ [ ] Testes básicos passam
```

---

## 📊 Performance & Load

### Baseline (single server)

```
Concurrent Users: 50-100
Requests/sec: 200-300
Response Time: <500ms (p95)
Database: MySQL single instance
Cache: Application layer
```

### Para Scale (100-1000 users)

```
Adicionar:
├─ Load Balancer (NGINX, ALB)
├─ Redis (session cache)
├─ Read replicas MySQL
├─ CDN (CloudFront)
└─ Auto-scaling group (2-10 instances)
```

---

## 🐛 Troubleshooting Rápido

| Erro | Causa | Fix |
|------|-------|-----|
| 500 Error | App crash | `pm2 logs` / check vars |
| Cannot connect DB | Credentials erradas | Verify DATABASE_URL |
| Login fails | OAuth error | Verify Manu.ia app ID |
| Upload fails | S3 permission | Check AWS IAM policy |
| High memory | Mem leak | Restart app, check logs |

---

## 📞 Escalação

```
Problema             Quem contatar    Tempo esperado
────────────────     ──────────────   ──────────────
App error logs       Dev team         15 min
DB performance       DBA / DB expert  30 min
S3 issues            AWS support      30-60 min
OAuth Manu.ia        Manu.ia support  60+ min
Infrastructure       DevOps/Cloud ops 30 min
```

---

## 📚 Documentos Relacionados

Para mais detalhes, veja:

1. **DEPLOYMENT.md** - Instruções passo a passo por plataforma
2. **DEVOPS_CHECKLIST.md** - Checklist completo para DevOps
3. **DEPLOYMENT_ROADMAP.md** - Timeline visual e failure scenarios
4. **ARQUITETURA.md** - Tech stack e estrutura de dados
5. **MANUS_CREDENTIALS.md** - Setup OAuth Manu.ia

---

## 🎯 Timeline Estimada

```
FASE 1: Setup Infraestrutura
└─ 2-3 dias de work paralelo

FASE 2: Build & Staging Deploy
└─ 1 dia (validar tudo)

FASE 3: Production Deploy
└─ 4-8 horas (off-hours)

TOTAL: 3-5 dias até go-live
```

---

## 💡 Dicas DevOps

✅ **Do:**
- Usar variáveis de environment (não hardcode secrets)
- Manter backups diários
- Monitorar logs e alertas
- Testar recovery procedure 1x/mês
- Documentar runbook de incidents
- Ter on-call rotation

❌ **Don't:**
- Commitar `.env` com valores reais
- Usar `admin` / `root` para credenciais app
- Skipar migrações de DB
- Deploy sem backup prévio
- Usar certificado auto-signed em prod
- Ignorar erros no log

---

## ✋ Ready to Deploy?

- [ ] Leu documentação?
- [ ] Setup completado?
- [ ] Teste local OK?
- [ ] Checklist revisado?
- [ ] Backup testado?

**Se SIM para tudo:** Let's go! 🚀

---

**Contato para dúvidas:** Development Team  
**Última atualização:** 24 de abril de 2026
