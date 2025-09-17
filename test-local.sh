#!/bin/bash

# Validador de Entrega - Web Continental
# Script de Deploy Local para Testes

echo "🧪 Iniciando ambiente de teste local"
echo "=================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js não encontrado. Instale: https://nodejs.org/"
    exit 1
fi

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 não encontrado."
    exit 1
fi

echo "[INFO] Iniciando servidor HTTP local na porta 8000..."
echo "[INFO] Acesse: http://localhost:8000"
echo "[INFO] Para parar o servidor, pressione Ctrl+C"

# Iniciar servidor HTTP simples
python3 -m http.server 8000