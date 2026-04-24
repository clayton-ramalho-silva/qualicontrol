# 🚀 Guia de Setup - Rodar Localmente

## 📋 Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **pnpm** 8+ (`npm install -g pnpm`)
- **MySQL** 8+ (local ou Docker)
  ```bash
  # Opção Docker (recomendado):
  docker run --name qualicontrol-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=qualicontrol -p 3306:3306 -d mysql:8
  ```

---

## ⚙️ 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na **raiz do projeto**:

```bash
# Database
DATABASE_URL="mysql://root:root@localhost:3306/qualicontrol"

# JWT & Segurança
JWT_SECRET="seu-secret-aleatorio-supersecreto-12345"

# Manu.ia OAuth (obtenha valores do cliente)
VITE_APP_ID="seu-app-id-do-manus"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="seu-owner-id"

# Forge API (opcional, só se usar IA)
BUILT_IN_FORGE_API_URL="https://api.forge.manus.space"
BUILT_IN_FORGE_API_KEY="sua-api-key"

# Opcional
PORT=3000
```

**⚠️ Valores do Manu.ia**: Peça ao cliente ou verifique no dashboard Manu.ia:
1. Acesse https://console.manus.space
2. Sua aplicação → Configurações
3. Copie: `App ID`, `OAuth URL`, `Owner ID`

---

## 📦 2. Instalar Dependências

```bash
pnpm install
```

---

## 🗄️ 3. Configurar Banco de Dados

### Opção A: Com Docker (Recomendado)

```bash
# 1. Criar container MySQL
docker run --name qualicontrol-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=qualicontrol \
  -p 3306:3306 \
  -d mysql:8

# 2. Aguarde 10s e depois continue
sleep 10

# 3. Gerar migrações e aplicar
pnpm db:push
```

### Opção B: MySQL Local

```bash
# 1. Criar banco (via MySQL CLI)
mysql -u root -p -e "CREATE DATABASE qualicontrol;"

# 2. Aplicar migrações
pnpm db:push
```

---

## 🏃 4. Rodar em Desenvolvimento

```bash
pnpm dev
```

**Output esperado:**
```
Server running on http://localhost:3000/
```

✅ Acesse: http://localhost:3000

---

## 🧪 5. Testes

```bash
# Rodar testes
pnpm test

# Com watch mode
pnpm test -- --watch
```

---

## 📦 6. Build para Produção

```bash
# Build
pnpm build

# Rodar produção localmente
pnpm start
```

---

## 🐛 Troubleshooting

### ❌ Erro: "DATABASE_URL is required"
```bash
✅ Solução: Certifique-se que o arquivo .env existe na raiz
```

### ❌ Erro: "Cannot connect to MySQL"
```bash
✅ Solução: 
- Verifique se MySQL está rodando: mysql -u root -p
- Verifique DATABASE_URL no .env
- Se usar Docker: docker ps | grep mysql
```

### ❌ Erro: "Port 3000 already in use"
```bash
✅ Solução: Mude a porta no .env
  PORT=3001
  # Ou mate o processo:
  lsof -i :3000 | grep -v PID | awk '{print $2}' | xargs kill -9
```

### ❌ Erro de autenticação OAuth
```bash
✅ Solução:
- Verifique VITE_APP_ID, OAUTH_SERVER_URL no .env
- Certifique-se que URLs coincidem no console Manu.ia
- Em desenvolvimento, pode usar sem autenticação para testes básicos
```

### ❌ Erro: "pnpm not found"
```bash
✅ Solução: npm install -g pnpm
```

---

## 📊 Estrutura do Projeto

```
├── client/              # Frontend React + Vite
│   └── src/
│       ├── pages/      # Páginas principais
│       ├── components/ # Componentes React
│       └── hooks/      # Custom hooks
│
├── server/             # Backend tRPC + Express
│   ├── routers.ts      # APIs tRPC
│   ├── db.ts           # Database queries
│   └── _core/          # Core setup
│
├── drizzle/            # Migrações + Schema
│   └── schema.ts       # Definição de tabelas
│
├── package.json        # Dependências
└── .env               # Variáveis (não commitar!)
```

---

## 🚢 Deploy para Produção

Ver: [DEPLOYMENT.md](./DEPLOYMENT.md) (quando disponível)

---

## 📞 Contato / Dúvidas

- **Cliente**: Manu.ia
- **Documentação Manu.ia**: https://docs.manus.space
- **Dashboard**: https://console.manus.space

---

**Última atualização**: 24 de abril de 2026
