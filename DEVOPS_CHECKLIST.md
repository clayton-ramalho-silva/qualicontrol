# 📋 DevOps Checklist - QualiControl

**Resumo Executivo para preparar o ambiente de produção**

---

## 🎯 Resumo Rápido

**Aplicação:** QualiControl - Dashboard de Desvios  
**Stack:** Node.js 18+ + React + MySQL 8+  
**Tamanho:** Aplicação Full-Stack (Frontend + Backend)  
**Dependências externas:** AWS S3, Manu.ia OAuth, Claude API  

---

## 📦 1. Infraestrutura Necessária

### ✅ Computação

- [ ] **Servidor/Instância** (EC2, VPS, ou Heroku Dyno)
  - Mínimo: 1 vCPU, 512MB RAM
  - Recomendado: 2 vCPU, 2GB RAM
  - Teste com: `t3.small` no AWS EC2
  
- [ ] **Node.js 18+**
  ```bash
  node --version  # Deve ser v18.0.0+
  pnpm --version  # Deve ser v8+
  ```

### ✅ Banco de Dados

- [ ] **MySQL 8.0+** (RDS, Cloud SQL, ou local)
  - Database: `qualicontrol`
  - User: `dbadmin` (ou similar)
  - Storage: Mínimo 20GB, recomendado 50GB+
  - Backup: Diário (7+ dias retenção)
  - **Connection Pool:** Configurar para 10-50 conexões

- [ ] **Migrações aplicadas**
  ```bash
  DATABASE_URL="..." pnpm db:push
  ```

### ✅ Storage (S3 ou similar)

- [ ] **AWS S3 Bucket**
  - Nome: `qualicontrol-prod-uploads` (ou similar)
  - Região: Same as compute (ex: us-east-1)
  - Versioning: Enabled
  - Lifecycle: Delete old uploads após 30-90 dias
  - CORS: Configurado para seu domínio

### ✅ Domínio & SSL

- [ ] **Domínio** registrado
  - Apontar DNS para seu servidor
  - TTL: 300-600s

- [ ] **Certificado SSL/TLS**
  - Let's Encrypt (grátis) - `certbot`
  - Renovação automática configurada
  - ou AWS Certificate Manager

### ✅ Load Balancer / Proxy (Produção)

- [ ] **NGINX** ou **Apache** (proxy reverso)
  - Redirecionar HTTP → HTTPS
  - Servir arquivos estáticos (`/dist/public`)
  - Proxy para Node.js na porta 3000

---

## 🔐 2. Segurança & Credenciais

### ✅ Variáveis de Ambiente (Secrets Management)

Crie um arquivo `.env` seguro no servidor com:

```bash
# ESSENCIAIS
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@host:3306/qualicontrol
JWT_SECRET=<gerar-novo-seguro-32-chars>

# OAUTH MANU.IA
VITE_APP_ID=<obter-de-console.manus.space>
VITE_OAUTH_PORTAL_URL=https://id.manus.space
OAUTH_SERVER_URL=https://id.manus.space
OWNER_OPEN_ID=<obter-de-console.manus.space>

# INTEGRAÇÕES
BUILT_IN_FORGE_API_URL=https://api.forge.manus.space
BUILT_IN_FORGE_API_KEY=<obter-de-manus>
AWS_ACCESS_KEY_ID=<IAM-key>
AWS_SECRET_ACCESS_KEY=<IAM-secret>
AWS_S3_BUCKET=qualicontrol-prod-uploads
AWS_REGION=us-east-1
```

⚠️ **IMPORTANTE:**
- [ ] `JWT_SECRET` - Gerar novo com: `openssl rand -hex 16`
- [ ] AWS credentials - Usar IAM user com permissão S3 apenas
- [ ] Armazenar em: Secrets Manager, Vault, ou variáveis de ambiente
- [ ] Nunca commitar `.env` no Git

### ✅ OAuth Manu.ia (Produção)

1. [ ] Acessar https://console.manus.space
2. [ ] Criar aplicação de PRODUÇÃO
3. [ ] Copiar: `App ID`, `Owner ID`
4. [ ] Adicionar URLs permitidas:
   - Callback: `https://qualicontrol.seu-dominio.com/api/oauth/callback`
   - CORS: `https://qualicontrol.seu-dominio.com`

### ✅ AWS IAM

- [ ] Criar IAM user específico para app
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::qualicontrol-prod-uploads/*"
      }
    ]
  }
  ```

---

## 🚀 3. Build & Deployment

### ✅ Processo de Build

```bash
# 1. Checkout código
git clone https://seu-repo/qualicontrol.git
cd qualicontrol

# 2. Instalar dependências
pnpm install --frozen-lockfile

# 3. Build (gera dist/)
pnpm build

# 4. Verificar artefatos
ls -la dist/
# Deve ter: dist/index.js + dist/public/
```

### ✅ Deployment Options

**Option A: Heroku (Mais simples)**
```bash
# Automatizado - veja DEPLOYMENT.md
heroku create qualicontrol-prod
heroku config:set NODE_ENV=production ...
git push heroku main
heroku run "pnpm db:push"
```

**Option B: EC2 + PM2 (Recomendado)**
```bash
# No servidor:
npm install -g pm2
pm2 start dist/index.js --name "qualicontrol" --instances max
pm2 save
pm2 startup
```

**Option C: VPS (DigitalOcean, Linode, Vultr)**
```bash
# SSH + setup manual
ssh root@seu-vps
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git nginx
npm install -g pnpm pm2
git clone seu-repo && pnpm build
pm2 start dist/index.js
# Configurar Nginx + SSL
```

**Option D: Hostinger Compartilhada (Mais fácil)**
```bash
# Via painel Hostinger:
# 1. Criar Node.js App
# 2. Conectar com GitHub (auto-deploy)
# 3. Adicionar env vars no painel
# 4. Push para main = deploy automático!
```

**Option E: Docker + Kubernetes (Enterprise)**
- Dockerfile fornecido? Não (não há na documentação)
- Criar Dockerfile:
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY dist ./dist
  COPY package.json pnpm-lock.yaml ./
  RUN npm install -g pnpm && pnpm install --prod
  CMD ["node", "dist/index.js"]
  ```

### ✅ Migrações Banco de Dados

```bash
# Executar ANTES de iniciar a aplicação
NODE_ENV=production DATABASE_URL="..." pnpm db:push

# Verificar status
mysql -h host -u user -p qualicontrol -e "SHOW TABLES;"
```

---

## 📊 4. Monitoramento & Logs

### ✅ Process Management

- [ ] **PM2** instalado e configurado
  ```bash
  pm2 list
  pm2 logs qualicontrol
  pm2 monit
  ```

### ✅ Log Aggregation

- [ ] Logs centralizados (CloudWatch, Datadog, ELK, etc)
  - Error logs → alertas imediatos
  - Access logs → 30 dias de retenção

### ✅ Health Checks

- [ ] Endpoint `/api/health` respondendo
  ```bash
  curl https://qualicontrol.seu-dominio.com/api/health
  # {"status":"ok","timestamp":"..."}
  ```

### ✅ Performance Monitoring

- [ ] APM tool configurado (opcional)
  - New Relic
  - DataDog
  - CloudWatch

---

## 🔄 5. Backup & Disaster Recovery

### ✅ Database Backups

- [ ] Backup automático MySQL
  - Frequência: Diária (mínimo)
  - Retenção: 7-30 dias
  - Teste restauração: 1x/mês

  ```bash
  # Exemplo cron job
  0 2 * * * /usr/local/bin/backup-mysql.sh
  ```

### ✅ File/Media Backups

- [ ] S3 versioning habilitado
- [ ] Lifecycle policy para arquivos antigos (30+ dias)

### ✅ RTO/RPO

- Recovery Time Objective: < 1 hora
- Recovery Point Objective: < 24 horas

---

## 🔧 6. Performance Tuning

### ✅ Banco de Dados

```sql
-- Adicionar índices (já devem estar em migrações)
CREATE INDEX idx_desvios_status ON desvios(status);
CREATE INDEX idx_desvios_obra_id ON desvios(obra_id);
CREATE INDEX idx_planos_prazo ON planos_acao(prazo);
```

### ✅ Node.js Tunning

```bash
# No servidor (aumentar file descriptors)
ulimit -n 65535

# PM2 config
pm2 start dist/index.js --instances max --max-memory-restart 500M
```

### ✅ Cache

- [ ] Redis (opcional) para sessions/cache
  - Reduz carga no MySQL
  - Melhora tempo de resposta

### ✅ CDN (Opcional)

- [ ] CloudFront / Cloudflare para assets estáticos
  - Distribuição global
  - Cache agressivo para `.js`, `.css`, imagens

---

## 🧪 7. Testing Pré-Deploy

### ✅ Checklist Antes de Go-Live

```bash
# 1. Health check
curl -s https://qualicontrol.seu-dominio.com/api/health

# 2. Login test (manual)
# Acessar https://qualicontrol.seu-dominio.com
# Fazer login com credenciais de teste

# 3. Upload test
# Criar um desvio com foto
# Verificar se enviou para S3

# 4. Database test
mysql -h host -u user -p qualicontrol -e \
  "SELECT COUNT(*) FROM desvios;"

# 5. Load test (opcional)
# ab -n 1000 -c 100 https://qualicontrol.seu-dominio.com/api/health
```

---

## 📞 8. Runbook (Ops)

### Em caso de erro:

1. **Aplicação crash**
   ```bash
   pm2 list
   pm2 logs qualicontrol --lines 100
   pm2 restart qualicontrol
   ```

2. **Banco de dados indisponível**
   ```bash
   mysql -h host -u user -p -e "SELECT 1;"
   # Recheck credenciais no .env
   ```

3. **S3 upload fails**
   ```bash
   aws s3 ls s3://qualicontrol-prod-uploads/
   # Verificar IAM permissions
   ```

4. **Memory leak/slow response**
   ```bash
   pm2 monit
   # Considerar restart automático (--max-memory-restart)
   ```

---

## ✅ Checklist Final

- [ ] Infraestrutura pronta (servidor, DB, S3)
- [ ] Variáveis de ambiente configuradas
- [ ] Certificado SSL ativo
- [ ] Backup strategy definida
- [ ] Monitoring/logging setup
- [ ] OAuth Manu.ia registrado
- [ ] Build testado localmente
- [ ] Migrações DB prontas
- [ ] Health check respondendo
- [ ] Teste de login funciona
- [ ] Teste upload de arquivo funciona
- [ ] Alertas de erro configurados
- [ ] RTO/RPO documentado
- [ ] Runbook de operações pronto

---

## 📚 Referências

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Instruções detalhadas por plataforma
- [SETUP_DESENVOLVIMENTO.md](./SETUP_DESENVOLVIMENTO.md) - Stack técnico
- [MANUS_CREDENTIALS.md](./MANUS_CREDENTIALS.md) - Setup OAuth
- [ARQUITETURA.md](./ARQUITETURA.md) - Stack e estrutura de dados

---

**Dúvidas?** Contacte o time de desenvolvimento ou verifique os docs mencionados acima.
