# 🔑 Configurar Credenciais Manu.ia

Guia passo-a-passo para obter as credenciais necessárias para integração com Manu.ia.

---

## 📝 Variáveis Necessárias

Para que a aplicação funcione com autenticação Manu.ia, você precisa de:

```bash
VITE_APP_ID          # ID da aplicação no Manu.ia
OAUTH_SERVER_URL     # URL do servidor OAuth (geralmente https://id.manus.space)
OWNER_OPEN_ID        # ID único do proprietário/organização
BUILT_IN_FORGE_API_KEY    # Chave API para LLM (opcional)
```

---

## 🔐 Passo 1: Acessar Console Manu.ia

1. Vá para: **https://console.manus.space**
2. Faça login com sua conta Manu.ia
3. Procure por "Aplicações" ou "Applications"

---

## 📋 Passo 2: Criar/Registrar Aplicação

### Se aplicação NÃO existe:
1. Clique em **"Nova Aplicação"** ou **"New Application"**
2. Preencha:
   - **Nome**: `QualiControl Dashboard`
   - **Descrição**: `Dashboard para gestão de desvios de construção`
   - **Tipo**: SPA (Single Page Application) ou Web App
   - **URL de callback**: `http://localhost:3000/api/oauth/callback` (desenvolvimento)

3. Clique "Criar" ou "Create"

### Se aplicação JÁ existe:
1. Encontre "QualiControl" na lista
2. Clique para abrir detalhes

---

## 🔍 Passo 3: Copiar Credenciais

Na página de detalhes da aplicação, você encontrará:

### Campo: App ID / Client ID
```
Copie este valor e coloque em .env como:
VITE_APP_ID="seu-valor-aqui"
```

### Campo: Client Secret (se existir)
```
⚠️  NUNCA coloque secret no frontend (.env do cliente)
Use apenas no backend se necessário
```

### Campo: OAuth Server URL
```
Normalmente é:
OAUTH_SERVER_URL="https://id.manus.space"

Ou verifique a documentação se diferente
```

---

## 👤 Passo 4: Obter Owner Open ID

### Opção A: Via Console
1. Na seção **"Configurações de Conta"** ou **"Account Settings"**
2. Procure por **"Open ID"** ou **"User ID"**
3. Copie para .env como:
   ```
   OWNER_OPEN_ID="seu-open-id-aqui"
   ```

### Opção B: Via API (Desenvolvimento)
```bash
# Se tiver acesso à API Manu.ia
curl -H "Authorization: Bearer {token}" \
  https://api.manus.space/v1/me

# Resposta conterá seu ID
# {
#   "openId": "sua-open-id-aqui",
#   "name": "Seu Nome",
#   ...
# }
```

---

## 🤖 Passo 5: Configurar Forge API (Opcional - para IA)

Se quer usar o assistente IA com análise inteligente:

1. Acesse: **https://console.manus.space/forge**
2. Gere ou copie sua **API Key**
3. Configure em .env:
   ```
   BUILT_IN_FORGE_API_URL="https://api.forge.manus.space"
   BUILT_IN_FORGE_API_KEY="sua-chave-aqui"
   ```

---

## ✅ Verificar Configuração

Após preencher `.env`:

```bash
# 1. Inicie o servidor
pnpm dev

# 2. Abra no navegador
http://localhost:3000

# 3. Tente fazer login com Manu.ia
# Deve redirecionar para: https://id.manus.space
# Após login, deve voltar para dashboard
```

---

## 🔗 URLs Importantes

| URL | Descrição |
|-----|-----------|
| https://console.manus.space | Dashboard/Console Manu.ia |
| https://id.manus.space | Servidor OAuth |
| https://api.manus.space | API principal |
| https://api.forge.manus.space | API Forge (LLM) |
| https://docs.manus.space | Documentação |

---

## 🚨 Troubleshooting

### ❌ "Invalid App ID"
```
✅ Solução:
1. Verifique VITE_APP_ID em .env
2. Confirme se está correto no console Manu.ia
3. Não misture com Client Secret
```

### ❌ "Redirect URI mismatch"
```
✅ Solução:
1. Configure em Manu.ia console a URL de callback:
   http://localhost:3000/api/oauth/callback (dev)
   https://qualicontrol.seu-dominio.com/api/oauth/callback (prod)

2. Ou use a URL exata que está em env.ts:
   process.env.OAUTH_SERVER_URL
```

### ❌ "CORS error"
```
✅ Solução:
1. Verifique se OAUTH_SERVER_URL está correto
2. Confirme se origens permitidas no Manu.ia incluem localhost:3000
```

### ❌ "Owner not found"
```
✅ Solução:
1. Verifique OWNER_OPEN_ID no .env
2. Confirme se é seu Open ID, não outro usuário
3. Teste com: curl https://api.manus.space/v1/me
```

---

## 🔄 Ambientes

### Desenvolvimento
```bash
# .env
VITE_APP_ID="dev-app-id"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="seu-open-id"
# Callbacks podem ser localhost
```

### Staging/Teste
```bash
VITE_APP_ID="staging-app-id"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="seu-open-id"
# Registre URL: https://staging.seu-dominio.com/api/oauth/callback
```

### Produção
```bash
VITE_APP_ID="prod-app-id"
OAUTH_SERVER_URL="https://id.manus.space"
OWNER_OPEN_ID="seu-open-id"
# Registre URL: https://qualicontrol.seu-dominio.com/api/oauth/callback
```

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique a documentação: https://docs.manus.space
2. Entre em contato com Manu.ia
3. Verifique console do navegador (DevTools → Console)
4. Verifique logs do servidor: `pnpm dev` output

---

**Última atualização**: 24 de abril de 2026
