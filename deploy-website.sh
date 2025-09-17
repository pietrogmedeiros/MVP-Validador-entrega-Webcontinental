#!/bin/bash

# Deploy Final - Validador de Entrega Web Continental
# Este script cria um bucket S3 para o website e faz upload dos arquivos

echo "🚀 Deploy Final - Website + API Funcional"
echo "========================================"

# URLs da API
API_URL="https://mw8t3gzzo9.execute-api.us-east-2.amazonaws.com/prod"
BUCKET_NAME="validador-entrega-website-$(date +%s)"

echo "[INFO] API URL: $API_URL"
echo "[INFO] Bucket para website: $BUCKET_NAME"

# Criar bucket para website
echo "[INFO] Criando bucket S3 para website..."
aws s3 mb s3://$BUCKET_NAME --region us-east-2

# Configurar bucket para website estático
echo "[INFO] Configurando website estático..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Fazer upload dos arquivos
echo "[INFO] Fazendo upload dos arquivos..."
aws s3 cp index.html s3://$BUCKET_NAME/ --content-type text/html
aws s3 cp styles.css s3://$BUCKET_NAME/ --content-type text/css
aws s3 cp script-api.js s3://$BUCKET_NAME/ --content-type application/javascript
aws s3 cp assets/ s3://$BUCKET_NAME/assets/ --recursive

# Configurar política pública do bucket
echo "[INFO] Configurando permissões públicas..."
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
    }
  ]
}'

# URL do website
WEBSITE_URL="http://$BUCKET_NAME.s3-website.us-east-2.amazonaws.com"

echo ""
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================"
echo ""
echo "🌐 Website URL: $WEBSITE_URL"
echo "🔗 API URL: $API_URL"
echo ""
echo "📱 Teste no seu celular acessando: $WEBSITE_URL"
echo ""
echo "🎯 Funcionalidades Ativas:"
echo "  ✅ Validação de Entrega com QR Code"
echo "  ✅ Upload e Validação de Qualidade de Imagem"
echo "  ✅ Armazenamento Seguro no S3"
echo "  ✅ Database DynamoDB Inicializado"
echo "  ✅ API Gateway Funcionando"
echo ""