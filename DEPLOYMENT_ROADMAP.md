# 🗺️ Deployment Roadmap - QualiControl

**Guia visual de etapas para colocar a aplicação em produção**

---

## 📅 Timeline Sugerida

```
SEMANA 1: Preparação
├─ Dia 1-2: Configurar infraestrutura (servidor, DB, S3)
├─ Dia 3: Configurar OAuth Manu.ia
└─ Dia 4-5: Setup de segurança e backup

SEMANA 2: Staging & Testing
├─ Dia 1: Deploy em staging
├─ Dia 2-3: Testes funcionais e carga
├─ Dia 4: Testes de segurança
└─ Dia 5: Testes de recovery

SEMANA 3: Go-Live
├─ Dia 1: Preparar runbook
├─ Dia 2-3: Deploy em produção (off-hours)
├─ Dia 4-5: Monitoramento 24/7
└─ Dia 6-7: Suporte ativo pós-launch
```

---

## 🎯 Fases de Deployment

### FASE 1: Preparação (1-2 semanas antes)

```
┌─────────────────────────────────────────┐
│  ✓ Infraestrutura                      │
│    • Servidor (EC2, Heroku, etc)       │
│    • MySQL DB (RDS, Cloud SQL)         │
│    • S3 Bucket (AWS S3)                │
│    • Domínio + DNS                     │
│    • SSL Certificate                   │
│                                         │
│  ✓ Segurança                           │
│    • JWT_SECRET gerado                 │
│    • AWS IAM user criado               │
│    • Security groups configurados      │
│    • Backup scripts criados            │
│                                         │
│  ✓ Credenciais Externas               │
│    • OAuth Manu.ia (produção)         │
│    • Forge API key                     │
│    • AWS credentials                   │
│    • Certificados atualizados         │
└─────────────────────────────────────────┘
```

### FASE 2: Build & Staging (1 semana)

```
LOCAL MACHINE                SERVER
       │                        │
       ├─ git clone ────────────┤
       ├─ pnpm install          │
       ├─ pnpm build            │
       └─ dist/                 │
              │                 │
              ├─────────────────┤
                                │
              STAGING DB        │
              (test environment)│
                                │
         [Run testes aqui]      │
         [Verificar logs]       │
         [Test uploads S3]      │
         [Test OAuth login]     │
```

### FASE 3: Production Deploy (1-2 dias)

```
┌─────────────────────────────────────────┐
│ PRODUCTION DEPLOYMENT                   │
├─────────────────────────────────────────┤
│                                         │
│ 1. BACKUP DATABASES                    │
│    mysqldump → S3                       │
│    Verificar restauração                │
│                                         │
│ 2. DEPLOY APLICAÇÃO                    │
│    dist/ → servidor                    │
│    pnpm db:push (migrações)            │
│    pm2 start (ou heroku deploy)        │
│                                         │
│ 3. VERIFICAÇÕES                        │
│    Health check: /api/health           │
│    Login test: OAuth                   │
│    Upload test: S3                     │
│    DB connections: OK                  │
│                                         │
│ 4. ENABLE MONITORING                   │
│    CloudWatch/DataDog ativo            │
│    Alertas habilitados                  │
│    Logs centralizados                   │
│                                         │
│ 5. PRODUCTION SIGN-OFF                 │
│    DevOps approval ✓                   │
│    Team notification                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Arquitetura Final (Produção)

```
                    ┌─────────────────┐
                    │    Internet      │
                    │   (Browser)      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   CloudFront CDN │
                    │ (Static assets)  │
                    └────────┬─────────┘
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
┌─────▼──────┐      ┌────────▼─────────┐   ┌──────▼────┐
│   NGINX     │      │   Node.js App    │   │   AWS S3   │
│  HTTP/HTTPS │◄────┤   (PM2 managed)  │──►│  (uploads) │
│  Proxy Pass │      │   Port 3000      │   │            │
└─────┬──────┘      └────────┬─────────┘   └────────────┘
      │                      │
      │                      │
      │              ┌───────▼──────┐
      │              │  MySQL DB    │
      │              │  (RDS)       │
      │              │  Replication │
      │              │  Backups     │
      │              └──────────────┘
      │
      │ (Optional)
      │
      ┌──────────────┬──────────────┐
      │              │              │
   ┌──▼──┐      ┌───▼───┐     ┌───▼────┐
   │Redis│      │CloudW │     │Datadog │
   │Cache│      │atch   │     │ APM    │
   └─────┘      └───────┘     └────────┘
```

---

## 🔑 Componentes Críticos

### 1. Frontend Build

```
client/src/ 
    ↓
[Vite Build]
    ↓
dist/public/
    ├─ index.html (com variáveis de env)
    ├─ assets/
    │  ├─ *.js (minified)
    │  └─ *.css (minified)
    └─ ...
```

**Variáveis que vão no HTML:**
- `VITE_OAUTH_PORTAL_URL` → para link de login
- `VITE_APP_ID` → para OAuth
- `VITE_ANALYTICS_*` → (opcional)

### 2. Backend Build

```
server/_core/index.ts
    ↓
[esbuild Bundle]
    ↓
dist/index.js
    ↓
[Node.js Execution]
    ├─ HTTP Server (port 3000)
    ├─ tRPC Router
    ├─ Database Connections
    └─ S3 Integration
```

**Variáveis necessárias:**
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `AWS_*` credenciais
- `VITE_APP_ID`, `OAUTH_SERVER_URL`

### 3. Database Schema

```
MySQL qualicontrol
├─ users
├─ obras
├─ fornecedores
├─ desvios (main table)
├─ fotos_evidencia
├─ planos_acao
├─ historico
├─ verificacoes
├─ verificacao_respostas
├─ membros_equipe
└─ notificacoes
```

**Migrations:**
- 0000 → 0007 (drizzle/)
- Aplicadas automaticamente: `pnpm db:push`

### 4. Storage (S3)

```
qualicontrol-prod-uploads/
├─ desvios/
│  ├─ {desvio_id}/
│  │  ├─ photo-1.jpg
│  │  ├─ photo-2.jpg
│  │  └─ metadata.json
│  └─ ...
├─ temp/ (cleanup policy)
└─ archived/ (old uploads)
```

---

## 🚨 Failure Scenarios

### Cenário 1: Database Down

```
User Request
    ↓
Express Server
    ↓
MySQL Query ✗ (ECONNREFUSED)
    ↓
Error Response (500)
    ↓
User sees error page

MITIGATION:
• Health check failed
• Alert triggered
• DBA investigates
• Rollback DNS if needed
• Failover to replica
```

### Cenário 2: S3 Upload Fails

```
User uploads photo
    ↓
S3.putObject() ✗ (InvalidCredentials)
    ↓
Error Response
    ↓
User sees "Upload failed"

MITIGATION:
• Retry logic (3x)
• Check AWS credentials
• Check IAM permissions
• Check S3 bucket access
• Fallback to temp storage
```

### Cenário 3: OAuth Failure

```
User clicks "Login"
    ↓
Redirect to Manu.ia ✗ (DNS timeout)
    ↓
User stuck on redirect

MITIGATION:
• Check OAuth URLs in .env
• Verify Manu.ia service status
• Check network connectivity
• Provide manual login fallback
```

---

## 📈 Scaling Checklist

**Se aplicação crescer:**

```
Single Server          Multi-Server           Enterprise
────────────────      ───────────────        ────────────
┌─────────┐           ┌──────────┐           ┌──────────┐
│ Node.js │           │   LB     │           │   CDN    │
│ MySQL   │    →      │ Node#1   │    →      │   LB     │
│ S3      │           │ Node#2   │           │ Node#1-N │
└─────────┘           │ MySQL    │           │ MySQL    │
Single SPOF           │ S3       │           │ Redis    │
                      └──────────┘           │ S3       │
                      Handle 10x             └──────────┘
                      Handle 100x+
```

**Pontos críticos para scale:**
1. Database pooling (connection limits)
2. Redis cache (sessions, frequently accessed data)
3. Load balancer (distribui requisições)
4. Static assets via CDN
5. Database replication (read replicas)

---

## ✅ Go-Live Checklist

### 24 horas antes:

- [ ] Backup atual feito e testado
- [ ] Deploy staging validado
- [ ] Runbook impresso/digital
- [ ] On-call schedule pronto
- [ ] Monitoring dashboards abertas
- [ ] Communication channels abertos

### Momento do deploy:

- [ ] Feature flag para rollback (se houver)
- [ ] Staging === Production code
- [ ] Variáveis de env confirmadas
- [ ] Database migrations tested
- [ ] Health check respondendo
- [ ] Team aguardando feedbacks

### Pós-deploy (24-48h):

- [ ] Monitor dashboards constantemente
- [ ] Verificar logs a cada 15min
- [ ] Teste de cada feature manualmente
- [ ] Verificar upload de arquivos
- [ ] Teste de autenticação
- [ ] Load test se possível

---

## 📞 Contatos & Escalonamento

```
Nível 1 (Dev Support)
├─ Verificar logs
├─ Reiniciar app
└─ Rollback se necessário

Nível 2 (DevOps/Infra)
├─ Database issues
├─ Network/connectivity
├─ S3/AWS issues
└─ Server resources

Nível 3 (Vendor Support)
├─ Manu.ia OAuth down
├─ AWS service issues
└─ Third-party integration

Emergency Escalation:
└─ CTO / Tech Lead (se production down)
```

---

## 🎓 Documentação Pós-Deploy

Manter atualizado:

- [ ] Deployment runbook
- [ ] Incident playbooks
- [ ] Architecture diagram
- [ ] Credential rotation schedule
- [ ] Backup/restore procedures
- [ ] Load testing results
- [ ] Monitoring dashboard links
- [ ] On-call contacts

---

**Última atualização:** 24 de abril de 2026  
**Status:** Pronto para deploy  
**Próxima revisão:** Após go-live
