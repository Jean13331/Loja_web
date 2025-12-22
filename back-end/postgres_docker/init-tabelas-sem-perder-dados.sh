#!/bin/bash
# Script para criar tabelas sem perder dados existentes
# Execute este script se você já tem dados no banco

echo "🔍 Verificando se o container está rodando..."
if ! docker ps | grep -q postgres_local; then
    echo "❌ Container postgres_local não está rodando!"
    echo "Execute: docker-compose up -d"
    exit 1
fi

echo "✅ Container está rodando"
echo ""
echo "📋 Verificando tabelas existentes..."
docker exec -it postgres_local psql -U appuser -d appdb -c "\dt" | head -20

echo ""
echo "🚀 Executando script de criação de tabelas..."
echo "⚠️  As tabelas serão criadas apenas se não existirem (CREATE TABLE IF NOT EXISTS)"
echo ""

# Executar o script SQL
docker exec -i postgres_local psql -U appuser -d appdb < ./init/01-init.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script executado com sucesso!"
    echo ""
    echo "📋 Verificando tabelas criadas..."
    docker exec -it postgres_local psql -U appuser -d appdb -c "\dt"
    echo ""
    echo "✨ Pronto! Suas tabelas foram criadas e seus dados foram preservados."
else
    echo ""
    echo "❌ Erro ao executar o script. Verifique os logs acima."
    exit 1
fi

