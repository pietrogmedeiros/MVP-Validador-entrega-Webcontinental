#!/bin/bash

# Deploy Atualizado - Validador de Entrega com Scanner de Código de Barras
echo "🚀 Deploy Atualizado - Validador de Entrega"
echo "=========================================="

# Usar bucket existente
BUCKET_NAME="validador-entrega-website-1762472623"
API_URL="https://mw8t3gzzo9.execute-api.us-east-2.amazonaws.com/prod"

echo "[INFO] Atualizando bucket: $BUCKET_NAME"
echo "[INFO] API URL: $API_URL"

# Upload dos arquivos principais atualizados
echo "[INFO] Fazendo upload dos arquivos atualizados..."
aws s3 cp index.html s3://$BUCKET_NAME/ --content-type text/html
aws s3 cp styles.css s3://$BUCKET_NAME/ --content-type text/css
aws s3 cp script-fixed.js s3://$BUCKET_NAME/ --content-type application/javascript

# Upload dos assets
echo "[INFO] Atualizando assets..."
aws s3 cp assets/ s3://$BUCKET_NAME/assets/ --recursive

echo ""
echo "✅ DEPLOY ATUALIZADO COM SUCESSO!"
echo "=================================="
echo ""
echo "🌐 Website Principal: http://$BUCKET_NAME.s3-website.us-east-2.amazonaws.com"
echo "🏢 Backoffice Admin: http://$BUCKET_NAME.s3-website.us-east-2.amazonaws.com/backoffice/"
echo "🔗 API URL: $API_URL"
echo ""
echo "🎯 Nova Funcionalidade:"
echo "  ✅ Scanner de Código de Barras para Nota Fiscal"
echo "  ✅ Preenchimento automático do campo NF"
echo "  ✅ Interface moderna e profissional"
echo ""
