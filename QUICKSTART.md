# ⚡ Quick Start (5 minutos)

**Resumo rápido para rodar a aplicação em desenvolvimento**

---

## 1️⃣ Preparar Ambiente

```bash
# Copiar diretório se necessário
cd seu-diretorio/qualicontrol

# Copiar .env de exemplo
cp .env.example .env

# Editar .env com seus valores:
nano .env
# Ou abrir em editor visual
```

Valores mínimos para .env:
```bash
DATABASE_URL="mysql://root:root@localhost:3306/qualicontrol"
JWT_SECRET="seu-secret-seguro-32-caracteres-minimo"
VITE_APP_ID="seu-app-id"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="seu-owner-id"
```

---

## 2️⃣ MySQL (Escolha uma opção)

### 🐳 Opção A: Docker (Recomendado)
```bash
docker run --name qualicontrol-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=qualicontrol \
  -p 3306:3306 -d mysql:8

sleep 10  # Aguarde inicialização
```

### 🖥️ Opção B: MySQL Local
```bash
# Se tiver MySQL instalado
mysql -u root -p -e "CREATE DATABASE qualicontrol;"
```

---

## 3️⃣ Instalar e Rodar

```bash
# Instalar dependências
pnpm install

# Aplicar migrações do banco
pnpm db:push

# Iniciar servidor (development)
pnpm dev
```

**Pronto! 🎉**

Abra: **http://localhost:3000**

---

## 📝 Próximos Passos

- [ ] Login com Manu.ia (se credenciais corretas)
- [ ] Criar desvio teste
- [ ] Upload foto teste
- [ ] Ver relatório

---

## 🐛 Se der erro...

| Erro | Solução |
|------|---------|
| `DATABASE_URL is required` | Copie `.env.example` para `.env` |
| `Cannot connect to MySQL` | Docker rodando? `docker ps` |
| `pnpm not found` | `npm install -g pnpm` |
| `Port 3000 in use` | Mude PORT no `.env` |

---

## 📊 Credenciais Manu.ia?

Ver: [MANUS_CREDENTIALS.md](./MANUS_CREDENTIALS.md)

---

## 📚 Documentação Completa

- [SETUP_DESENVOLVIMENTO.md](./SETUP_DESENVOLVIMENTO.md) - Setup detalhado
- [ARQUITETURA.md](./ARQUITETURA.md) - Estrutura técnica
- [CHECKLIST_TESTES.md](./CHECKLIST_TESTES.md) - Validação
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy produção

---

**Tempo total**: ~5 minutos (sem aguardo do MySQL)
