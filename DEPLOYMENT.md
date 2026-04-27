# 🚀 Deployment em Produção

Guia completo para colocar a aplicação QualiControl em produção.

---

## 📋 Pré-requisitos

- [ ] Aplicação testada localmente (`npm run dev` rodando sem erros)
- [ ] Build verifi­cado localmente (`npm run build`)
- [ ] Domínio registrado (ex: `qualicontrol.seu-dominio.com`)
- [ ] Certificado SSL/TLS
- [ ] Banco MySQL 8+ em servidor remoto
- [ ] Credenciais Manu.ia atualizadas para produção (App ID, OAuth URL)
- [ ] AWS S3 bucket configurado para uploads (fotos/evidências)
- [ ] Node.js 18+ no servidor

---

## 🏢 Opções de Hosting

### Opção 1: Heroku (Mais simples - recomendado para MVP)
### Opção 2: AWS EC2 + RDS (Escalável, gerenciado)
### Opção 3: DigitalOcean App Platform (Bom custo-benefício)
### Opção 4: Seu próprio servidor VPS (máximo controle)

---

## 🔧 Preparação Geral (Todas opções)

### 1. Build da aplicação

```bash
# Em sua máquina local
pnpm install
pnpm build

# Verificar artefatos gerados
ls -la dist/
# Esperado:
# - dist/index.js (server compilado)
# - dist/public/ (frontend compilado - arquivos estáticos)
```

### 2. Variáveis de Ambiente para Produção

**Arquivo `.env` (exemplo para produção):**

```bash
# ==========================================
# SERVER
# ==========================================
NODE_ENV=production
PORT=3000

# ==========================================
# DATABASE (MYSQL)
# ==========================================
# Usar conexão remota ao RDS/Cloud SQL
DATABASE_URL="mysql://user:password@db.seu-servidor.com:3306/qualicontrol"

# ==========================================
# SECURITY
# ==========================================
# Gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="gerar-um-novo-super-secreto-com-32-caracteres-minimo"

# ==========================================
# MANU.IA OAUTH (Credenciais PRODUÇÃO)
# ==========================================
# Obtenha em: https://console.manus.space (conta de produção)
VITE_APP_ID="prod-app-id-aqui"
VITE_OAUTH_PORTAL_URL="https://id.manus.space"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="prod-owner-id-aqui"

# ==========================================
# FORGE API (Manu.ia IA - para relatórios)
# ==========================================
BUILT_IN_FORGE_API_URL="https://api.forge.manus.space"
BUILT_IN_FORGE_API_KEY="prod-api-key-aqui"

# ==========================================
# AWS S3 (Upload de fotos/evidências)
# ==========================================
AWS_ACCESS_KEY_ID="sua-access-key-prod"
AWS_SECRET_ACCESS_KEY="sua-secret-key-prod"
AWS_S3_BUCKET="qualicontrol-prod-uploads"
AWS_REGION="us-east-1"

# ==========================================
# ANALYTICS (Opcional - Umami)
# ==========================================
# VITE_ANALYTICS_ENDPOINT="https://analytics.seu-dominio.com"
# VITE_ANALYTICS_WEBSITE_ID="seu-website-id"
```

⚠️ **IMPORTANTE:**
- Nunca commite `.env` com valores reais no Git
- Use variáveis de ambiente do servidor (secrets management)
- Regenere `JWT_SECRET` para produção

### 3. Atualizar URLs OAuth no Manu.ia

1. Acesse: https://console.manus.space
2. Sua aplicação → Configurações
3. URLs permitidas (adicione):
   - **Callback:** `https://qualicontrol.seu-dominio.com/api/oauth/callback`
   - **CORS Origin:** `https://qualicontrol.seu-dominio.com`

---

## 🟪 Opção 1: Heroku (Recomendado para MVP)

### 1.1 Preparação

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create qualicontrol-prod

# Adicionar buildpack Node.js
heroku buildpacks:add heroku/nodejs
```

### 1.2 Configurar banco MySQL

**Opção A: JawsDB (MySQL hospedado no Heroku)**
```bash
# Adicionar add-on
heroku addons:create jawsdb:kitefin

# Verá: DATABASE_URL automaticamente
heroku config | grep DATABASE_URL
```

**Opção B: Banco MySQL externo (AWS RDS, etc)**
```bash
# Configurar manualmente
heroku config:set DATABASE_URL="mysql://user:pass@host:3306/db"
```

### 1.3 Configurar variáveis de ambiente

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="seu-secret-seguro"
heroku config:set VITE_APP_ID="prod-app-id"
heroku config:set VITE_OAUTH_PORTAL_URL="https://id.manus.space"
heroku config:set OAUTH_SERVER_URL="https://id.manus.space"
heroku config:set OWNER_OPEN_ID="prod-owner-id"
heroku config:set BUILT_IN_FORGE_API_URL="https://api.forge.manus.space"
heroku config:set BUILT_IN_FORGE_API_KEY="prod-api-key"
heroku config:set AWS_ACCESS_KEY_ID="seu-access-key"
heroku config:set AWS_SECRET_ACCESS_KEY="seu-secret-key"
heroku config:set AWS_S3_BUCKET="qualicontrol-prod"
heroku config:set AWS_REGION="us-east-1"
```

### 1.4 Deploy

```bash
# Push para Heroku
git push heroku main

# Ver logs
heroku logs --tail

# Aplicar migrações
heroku run "pnpm db:push"

# Abrir aplicação
heroku open
```

---

## 🟠 Opção 2: AWS EC2 + RDS (Recomendado para produção)

### 2.1 Setup AWS

**RDS MySQL:**
```bash
# Via AWS Console:
# 1. RDS → Databases → Create database
# 2. Engine: MySQL 8.0
# 3. Instance: db.t3.micro (free tier) ou t3.small
# 4. Storage: 100GB
# 5. Multi-AZ: No (sim para produção crítica)
# 6. Database name: qualicontrol
# 7. Master user: dbadmin
# 8. Backup retention: 7 days
# 9. Enhanced monitoring: disabled (para costs)

# Ao final, copie:
# Endpoint: qualicontrol.xxxxx.us-east-1.rds.amazonaws.com
# Port: 3306
```

**EC2:**
```bash
# 1. Launch instance (Ubuntu 22.04 LTS)
# 2. Instance type: t3.small
# 3. Storage: 50GB gp3
# 4. Security group: Allow SSH (22), HTTP (80), HTTPS (443)
# 5. KeyPair: Salve seguro (.pem)

# SSH na instância
ssh -i seu-key.pem ubuntu@seu-instance-ip

# Update sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (process manager)
npm install -g pm2
```

### 2.2 Deploy manualmente

```bash
# Na instância EC2:

# Clone do repositório
git clone https://seu-repo.git qualicontrol
cd qualicontrol

# Setup
pnpm install
pnpm build

# Criar .env com variáveis de produção
nano .env

# Aplicar migrações
NODE_ENV=production DATABASE_URL="..." pnpm db:push

# Iniciar com PM2
pm2 start dist/index.js --name "qualicontrol"
pm2 save
pm2 startup

# Ver status
pm2 status
pm2 logs qualicontrol

# NGINX (proxy reverso)
sudo apt install -y nginx

# Config NGINX
sudo nano /etc/nginx/sites-available/qualicontrol
```

**NGINX Config:**
```nginx
server {
    listen 80;
    server_name qualicontrol.seu-dominio.com;

    # Redirecionar HTTP → HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name qualicontrol.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/qualicontrol.seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qualicontrol.seu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/qualicontrol /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Certificado SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d qualicontrol.seu-dominio.com
```

---

## � Opção 3: VPS Genérica (DigitalOcean, Linode, Vultr, etc)

### 3.1 Setup Servidor

```bash
# SSH na VPS
ssh root@seu-vps-ip

# Update sistema
apt update && apt upgrade -y

# Instalar Node.js, pnpm, Git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs git

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (process manager)
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

### 3.2 Clonar e Deploy

```bash
# Criar diretório
mkdir -p /var/www/qualicontrol
cd /var/www/qualicontrol

# Clonar repositório
git clone https://seu-repo.git .
cd qualicontrol

# Instalar dependências
pnpm install --frozen-lockfile

# Build
pnpm build

# Criar arquivo .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://user:password@db-host:3306/qualicontrol"
JWT_SECRET="seu-secret-gerado"
VITE_APP_ID="prod-app-id"
VITE_OAUTH_PORTAL_URL="https://id.manus.space"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="seu-owner-id"
BUILT_IN_FORGE_API_URL="https://api.forge.manus.space"
BUILT_IN_FORGE_API_KEY="sua-api-key"
AWS_ACCESS_KEY_ID="sua-key"
AWS_SECRET_ACCESS_KEY="sua-secret"
AWS_S3_BUCKET="qualicontrol-uploads"
AWS_REGION="us-east-1"
EOF

# Aplicar migrações
pnpm db:push

# Iniciar com PM2
pm2 start dist/index.js --name "qualicontrol" --instances max
pm2 save
pm2 startup
```

### 3.3 Configurar Nginx

```bash
# Criar config
cat > /etc/nginx/sites-available/qualicontrol << 'EOF'
server {
    listen 80;
    server_name qualicontrol.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name qualicontrol.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/qualicontrol.seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qualicontrol.seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Assets estáticos (servir diretamente)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/qualicontrol/dist/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
ln -s /etc/nginx/sites-available/qualicontrol /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar Nginx
nginx -t

# Aplicar SSL
certbot certonly --nginx -d qualicontrol.seu-dominio.com

# Restart Nginx
systemctl restart nginx
```

### 3.4 Auto-atualização (via Git)

```bash
# Criar script de deploy
cat > /var/www/qualicontrol/deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/qualicontrol
git pull origin main
pnpm install --frozen-lockfile
pnpm build
pm2 restart qualicontrol
EOF

chmod +x /var/www/qualicontrol/deploy.sh

# Adicionar webhook do GitHub (opcional)
# Ou fazer deploy manual: ./deploy.sh
```

---

## 🟦 Opção 4: Hostinger (Hospedagem Compartilhada Node.js)

Hostinger oferece suporte nativo a Node.js com deploy via GitHub.

### 4.1 Setup no Painel Hostinger

1. **Acessar painel:** https://hpanel.hostinger.com
2. **Ir para:** Aplicações Web → Node.js
3. **Criar nova aplicação Node.js:**
   - Nome: `qualicontrol`
   - Versão Node.js: `18` ou superior
   - Porta: `3000` (padrão)
   - Domínio: `qualicontrol.seu-dominio.com`

### 4.2 Conectar com GitHub

```bash
# No repositório GitHub:

1. Ir para Settings → Deployments
2. Conectar com Hostinger (via GitHub Apps)
3. Selecionar branch: `main` ou `production`
4. Enable auto-deploy
```

### 4.3 Configurar Environment Variables

**No painel Hostinger:**
1. Ir para: Node.js App → Environment Variables
2. Adicionar cada variável:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:password@db.hostinger.com:3306/qualicontrol
JWT_SECRET=seu-secret-gerado
VITE_APP_ID=prod-app-id
VITE_OAUTH_PORTAL_URL=https://id.manus.space
OAUTH_SERVER_URL=https://id.manus.space
OWNER_OPEN_ID=seu-owner-id
BUILT_IN_FORGE_API_URL=https://api.forge.manus.space
BUILT_IN_FORGE_API_KEY=sua-api-key
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=sua-secret
AWS_S3_BUCKET=qualicontrol-uploads
AWS_REGION=us-east-1
```

### 4.4 Setup do Banco de Dados

**MySQL no Hostinger:**
1. Ir para: Databases → MySQL
2. Criar database: `qualicontrol`
3. Criar user: `dbadmin`
4. Copiar connection string: `mysql://dbadmin:password@localhost:3306/qualicontrol`

**Ou usar banco externo (AWS RDS):**
- Adicionar DATABASE_URL remota nas env vars

### 4.5 Deploy Automático

**Opção A: Auto-deploy via GitHub (Recomendado)**
```bash
# Ao fazer push para main:
git add .
git commit -m "Deploy para produção"
git push origin main

# Hostinger automaticamente:
# 1. Faz clone do repo
# 2. Instala pnpm install
# 3. Executa pnpm build
# 4. Reinicia app (pm2)
```

**Opção B: Deploy Manual**
```bash
# Via SSH (se disponível):
ssh seu-usuario@seu-hostinger.com
cd apps/qualicontrol
git pull origin main
pnpm install
pnpm build
pm2 restart qualicontrol
```

### 4.6 Aplicar Migrações do Banco

**Via Hostinger Terminal:**
```bash
# No painel Hostinger: Terminal → SSH
cd /home/seu-usuario/public_html/apps/qualicontrol

# Aplicar migrações
DATABASE_URL="mysql://dbadmin:password@localhost:3306/qualicontrol" pnpm db:push
```

### 4.7 Verificar Deploy

```bash
# Acessar sua aplicação
https://qualicontrol.seu-dominio.com

# Ver logs (via painel Hostinger)
# Ir para: Node.js App → Logs

# Health check
curl https://qualicontrol.seu-dominio.com/api/health
# Esperado: {"status":"ok",...}
```

### 4.8 Troubleshooting Hostinger

| Problema | Solução |
|----------|---------|
| App não inicia | Verificar Node version (use 18+) |
| Build fail | Verificar pnpm-lock.yaml commitado |
| DB connection error | Testar DATABASE_URL no env vars |
| Static assets 404 | Usar `dist/public/` como public dir |
| Deploy não acontece | Verificar GitHub webhook no Hostinger |

---

## �📊 Health Check & Monitoring

Adicionar endpoint de health check:

```bash
# Seu servidor deve responder em:
curl https://qualicontrol.seu-dominio.com/api/health

# Resposta esperada:
# {"status":"ok","timestamp":"2026-04-24T..."}
```

---

## 🔄 CI/CD (GitHub Actions - Opcional)

Arquivo: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build
      - run: pnpm test

      # Deploy para Heroku
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: qualicontrol-prod
          heroku_email: seu-email@example.com
```

---

## 🗄️ Backup & Recovery

### MySQL Backup

```bash
# Backup manual
mysqldump -h db.seu-servidor.com -u dbadmin -p qualicontrol > backup-$(date +%Y%m%d).sql

# Restaurar
mysql -h db.seu-servidor.com -u dbadmin -p qualicontrol < backup-20260424.sql

# S3 backup automático
*/6 * * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

**Script `backup-db.sh`:**
```bash
#!/bin/bash
BACKUP_FILE="/tmp/qualicontrol-$(date +%Y%m%d-%H%M%S).sql"
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://qualicontrol-backups/
rm $BACKUP_FILE
```

---

## 📈 Performance & Scaling

### Otimizações recomendadas:

1. **CDN para assets estáticos**
   - CloudFront (AWS)
   - Cloudflare

2. **Cache**
   - Redis para sessions
   - Varnish para HTTP cache

3. **Database optimization**
   - Indexar campos utilizados em WHERE/JOIN
   - Connection pooling (MySQL)

4. **Auto-scaling** (se usar AWS)
   - ALB (Application Load Balancer)
   - Auto Scaling Group
   - Min 2, Max 10 instâncias

---

## 🐛 Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `Cannot connect to database` | DB não acessível | Verificar security groups, credenciais |
| `Invalid OAuth credentials` | App ID/Owner ID errados | Revisar console.manus.space |
| `S3 upload fails` | AWS credentials inválidas | Verificar IAM permissions |
| `500 errors` | Server crash | `pm2 logs` ou `heroku logs` |

---

## 📞 Suporte

Dúvidas durante deploy? Verifique:
1. `SETUP_DESENVOLVIMENTO.md` - Setup local
2. `MANUS_CREDENTIALS.md` - OAuth setup
3. `ARQUITETURA.md` - Stack técnico


```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create seu-app-qualicontrol

# Adicionar buildpacks
heroku buildpacks:add heroku/nodejs
```

### 1.2 Database MySQL

```bash
# Opção A: JawsDB MySQL (addon Heroku)
heroku addons:create jawsdb:kitefin

# Opção B: PlanetScale (MySQL compatível)
# https://planetscale.com - grátis até certo limite
```

### 1.3 Configurar variáveis

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="seu-secret-aleatorio"
heroku config:set VITE_APP_ID="prod-app-id"
heroku config:set OAUTH_SERVER_URL="https://id.manus.space"
heroku config:set OWNER_OPEN_ID="seu-owner-id"
heroku config:set DATABASE_URL="mysql://user:pass@host/db"
```

### 1.4 Deploy

```bash
# Push de código
git push heroku main

# Rodar migrações (se necessário)
heroku run "pnpm db:push"

# Ver logs
heroku logs --tail
```

**Custo**: A partir de $7/mês (dyno básico) + database

---

## 🟠 Opção 2: AWS (EC2 + RDS)

### 2.1 Criar instância EC2

```bash
# Recomendado: t3.small (1GB RAM, válido para MVP)
# OS: Ubuntu 22.04 LTS
# Security Group: Portas 80, 443, 3306 (SSH), 3000 (app)

# SSH para instância
ssh -i sua-chave.pem ubuntu@seu-instancia-aws

# Instalar dependências
sudo apt update && sudo apt install -y nodejs npm
npm install -g pnpm
```

### 2.2 Database RDS

```bash
# Criar RDS MySQL 8.0 via AWS Console
# Recomendado: db.t3.micro (camada gratuita)
# Copiar endpoint: seu-db.xxx.rds.amazonaws.com
```

### 2.3 Deploy da aplicação

```bash
# Na instância EC2
git clone seu-repo.git
cd qualicontrol

# Copiar .env
cp .env.production .env
# Editar com valores reais
nano .env

# Instalar e build
pnpm install
pnpm build

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Iniciar com PM2
pm2 start dist/index.js --name "qualicontrol"
pm2 startup
pm2 save

# Logs
pm2 logs qualicontrol
```

### 2.4 Nginx como reverse proxy

```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar /etc/nginx/sites-available/qualicontrol
sudo nano /etc/nginx/sites-available/qualicontrol
```

```nginx
server {
    listen 80;
    server_name qualicontrol.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/qualicontrol /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL com Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d qualicontrol.seu-dominio.com
```

**Custo**: A partir de $5/mês (t3.micro) + RDS + domínio

---

## 🟦 Opção 3: DigitalOcean

### 3.1 Criar Droplet

```bash
# Via console DigitalOcean
# - Imagem: Ubuntu 22.04 LTS
# - Tamanho: Basic $5/mês (1GB RAM)
# - SSH key

# SSH
ssh root@seu-droplet-ip

# Setup inicial
apt update && apt upgrade -y
apt install -y nodejs npm mysql-client
npm install -g pnpm
```

### 3.2 Database MySQL

```bash
# Opção A: Gerenciado DigitalOcean
# Criar via console → Managed Databases → MySQL 8

# Opção B: Instalado no próprio droplet
apt install -y mysql-server
mysql_secure_installation
```

### 3.3 Deploy

```bash
# Criar diretório
mkdir /var/www/qualicontrol
cd /var/www/qualicontrol

# Clonar repo
git clone seu-repo.git .

# Setup
pnpm install
pnpm db:push
pnpm build

# PM2 + Nginx (mesmo que AWS acima)
npm install -g pm2
pm2 start dist/index.js --name "qualicontrol"

# Nginx + SSL (mesmo que AWS)
# ...
```

**Custo**: A partir de $5/mês (Droplet) + $15/mês (Managed DB)

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] JWT_SECRET com 32+ caracteres aleatórios
- [ ] Database em subnet privada (não exposta)
- [ ] HTTPS/SSL ativado e redirecionando HTTP
- [ ] Headers de segurança configurados
- [ ] CORS configurado apenas para domínio
- [ ] Rate limiting na API
- [ ] Logs centralizados
- [ ] Backup automático do banco

### Headers de Segurança (Nginx)

```nginx
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

---

## 📊 Monitoramento

### Logs

```bash
# Ver logs em real-time
pm2 logs qualicontrol

# Ou com journalctl
journalctl -u qualicontrol -f
```

### Health Check

```bash
# Endpoint de health check (implementado em server)
curl https://qualicontrol.seu-dominio.com/api/health

# Esperado:
# { "status": "ok", "timestamp": "..." }
```

### Backup Automático

```bash
# MySQL backup diário
0 2 * * * /usr/bin/mysqldump -u user -p'password' --all-databases | gzip > /backups/mysql-$(date +\%Y\%m\%d).sql.gz

# Ou use gerenciado do serviço (Heroku, AWS, DigitalOcean)
```

---

## 🔄 Atualizações em Produção

### Zero Downtime Deploy

```bash
# 1. Build nova versão localmente
pnpm build

# 2. Upload para servidor
scp -r dist/ user@servidor:/var/www/qualicontrol/new

# 3. Swap (PM2)
pm2 reload qualicontrol

# 4. Verifique
curl https://seu-dominio.com/api/health
```

---

## 🚨 Troubleshooting Produção

### ❌ Erro 502 Bad Gateway

```bash
# Aplicação não está rodando
pm2 status
pm2 restart qualicontrol

# Verifique porta
lsof -i :3000

# Verifique variáveis de ambiente
pm2 show qualicontrol
```

### ❌ Conexão MySQL recusada

```bash
# Verifique DATABASE_URL
echo $DATABASE_URL

# Teste conexão
mysql -h seu-db.rds.amazonaws.com -u user -p

# Verifique security group/firewall
```

### ❌ Timeout em requisições

```bash
# Aumente timeout no Nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

---

## 📞 Suporte & Documentação

- **Heroku**: https://devcenter.heroku.com
- **AWS**: https://docs.aws.amazon.com
- **DigitalOcean**: https://docs.digitalocean.com
- **Node.js**: https://nodejs.org/docs
- **PM2**: https://pm2.keymetrics.io

---

## 📈 Próximos Passos (Pós-Deploy)

- [ ] Implementar CI/CD (GitHub Actions, GitLab CI)
- [ ] Monitoramento com Datadog, New Relic ou similar
- [ ] CDN para assets estáticos
- [ ] Cache com Redis
- [ ] Escalabilidade horizontal
- [ ] DR/Disaster Recovery

---

**Última atualização**: 24 de abril de 2026
