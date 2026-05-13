#!/bin/bash
# Script para atualizar o banco de dados com as novas tabelas

echo "====================================="
echo "Atualizando banco de dados..."
echo "====================================="

cd /Users/guilhermehenriquedeoliveira/Documents/site-bella-acessorios/bella-acessorios

echo ""
echo "1. Gerando Prisma Client..."
npx prisma generate

echo ""
echo "2. Enviando mudanças para o banco (pode demorar alguns minutos)..."
npx prisma db push --skip-generate

echo ""
echo "====================================="
echo "Concluído!"
echo "====================================="