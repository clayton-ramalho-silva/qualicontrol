# 🚀 Deployment em Produção

Guia completo para colocar a aplicação QualiControl em produção.

---

## 📋 Pré-requisitos

- [ ] Aplicação testada localmente
- [ ] Domínio registrado (ex: `qualicontrol.seu-dominio.com`)
- [ ] Certificado SSL/TLS
- [ ] Banco MySQL 8+ em servidor remoto
- [ ] Credenciais Manu.ia atualizadas para produção

---

## 🏢 Opções de Hosting

### Opção 1: Heroku (Mais simples)
### Opção 2: AWS (Mais escalável)
### Opção 3: DigitalOcean (Bom custo-benefício)
### Opção 4: Próprio servidor (máximo controle)

---

## 🔧 Preparação Geral (Todas opções)

### 1. Build da aplicação

```bash
# Em sua máquina local
pnpm build

# Verificar artefatos
ls -la dist/
# Deve ter: dist/index.js (server) + dist/client/ (static)
```

### 2. Variáveis de Ambiente para Produção

```bash
# .env.production (NUNCA commite!)
NODE_ENV=production
PORT=3000

# Database (remoto)
DATABASE_URL="mysql://user:password@db.seu-servidor.com:3306/qualicontrol"

# Segurança
JWT_SECRET="seu-secret-muito-seguro-ALTERADO"

# Manu.ia (credenciais de produção)
VITE_APP_ID="prod-app-id"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="seu-owner-id"

# Forge API
BUILT_IN_FORGE_API_URL="https://api.forge.manus.space"
BUILT_IN_FORGE_API_KEY="chave-prod"

# AWS S3 (se usar storage)
AWS_ACCESS_KEY_ID="seu-access-key"
AWS_SECRET_ACCESS_KEY="seu-secret"
AWS_S3_BUCKET="qualicontrol-uploads"
AWS_REGION="us-east-1"
```

### 3. Atualizar URLs OAuth no Manu.ia

1. Vá para: https://console.manus.space
2. Sua aplicação → Configurações
3. URLs permitidas:
   - Callback: `https://qualicontrol.seu-dominio.com/api/oauth/callback`
   - CORS Origin: `https://qualicontrol.seu-dominio.com`

---

## 🟪 Opção 1: Heroku

### 1.1 Preparação

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
