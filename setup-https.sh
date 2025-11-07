#!/bin/bash

# Setup HTTPS com CloudFront para o Validador de Entrega
echo "🔒 Configurando HTTPS com CloudFront"
echo "===================================="

# Variáveis
BUCKET_NAME="validador-entrega-website-1759792000"
DISTRIBUTION_CONFIG="cloudfront-config.json"

# Criar configuração do CloudFront
echo "[INFO] Criando configuração do CloudFront..."
cat > $DISTRIBUTION_CONFIG << EOF
{
    "CallerReference": "validador-entrega-$(date +%s)",
    "Comment": "Validador de Entrega Web Continental - HTTPS",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-${BUCKET_NAME}",
                "DomainName": "${BUCKET_NAME}.s3-website.us-east-2.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${BUCKET_NAME}",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "Compress": true
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

# Criar distribuição CloudFront
echo "[INFO] Criando distribuição CloudFront..."
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file://$DISTRIBUTION_CONFIG --output json)

if [ $? -eq 0 ]; then
    # Extrair informações da distribuição
    DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.Id')
    DOMAIN_NAME=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.DomainName')
    
    echo ""
    echo "✅ HTTPS CONFIGURADO COM SUCESSO!"
    echo "================================"
    echo ""
    echo "🔒 Website Principal (HTTPS): https://$DOMAIN_NAME"
    echo "🏢 Backoffice Admin (HTTPS): https://$DOMAIN_NAME/backoffice/"
    echo "🆔 Distribution ID: $DISTRIBUTION_ID"
    echo ""
    echo "⏳ Aguarde 5-15 minutos para o CloudFront propagar globalmente"
    echo "📱 Teste no celular: https://$DOMAIN_NAME"
    echo "💼 Backoffice: https://$DOMAIN_NAME/backoffice/"
    
    # Limpar arquivo temporário
    rm $DISTRIBUTION_CONFIG
    
    # Salvar informações em arquivo
    echo "HTTPS_URL=https://$DOMAIN_NAME" > .env-https
    echo "BACKOFFICE_URL=https://$DOMAIN_NAME/backoffice/" >> .env-https
    echo "DISTRIBUTION_ID=$DISTRIBUTION_ID" >> .env-https
    
    echo ""
    echo "💾 URLs salvas em .env-https para referência futura"
    
else
    echo "❌ Erro ao criar distribuição CloudFront"
    rm $DISTRIBUTION_CONFIG
    exit 1
fi