#!/bin/bash

# =============================================================================
# Script de Setup Rápido - QualiControl
# =============================================================================
# Este script configura o ambiente de desenvolvimento automaticamente

set -e  # Exit on error

echo "🚀 QualiControl - Setup Rápido"
echo "========================================"

# 1. Verificar pré-requisitos
echo ""
echo "📋 Verificando pré-requisitos..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em https://nodejs.org"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm não encontrado. Instalando..."
    npm install -g pnpm
fi

echo "✅ Node.js: $(node --version)"
echo "✅ pnpm: $(pnpm --version)"

# 2. Copiar .env.example se .env não existe
echo ""
echo "⚙️  Configurando variáveis de ambiente..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env criado a partir de .env.example"
        echo "⚠️  EDITE o arquivo .env com seus valores!"
    fi
else
    echo "✅ .env já existe"
fi

# 3. Instalar dependências
echo ""
echo "📦 Instalando dependências..."
pnpm install

# 4. Verificar MySQL
echo ""
echo "🗄️  Verificando MySQL..."

if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL CLI não encontrado, mas OK se usar Docker"
fi

# 5. Mensagem final
echo ""
echo "✅ Setup concluído!"
echo ""
echo "========================================"
echo "📝 Próximos passos:"
echo "========================================"
echo ""
echo "1️⃣  EDITE o arquivo .env com seus valores:"
echo "    - DATABASE_URL (MySQL connection)"
echo "    - VITE_APP_ID, OAUTH_SERVER_URL, OWNER_OPEN_ID"
echo ""
echo "2️⃣  Configure o banco de dados:"
echo "    pnpm db:push"
echo ""
echo "3️⃣  Inicie o servidor de desenvolvimento:"
echo "    pnpm dev"
echo ""
echo "🌐 Acesse: http://localhost:3000"
echo ""
echo "📚 Para mais informações, veja SETUP_DESENVOLVIMENTO.md"
