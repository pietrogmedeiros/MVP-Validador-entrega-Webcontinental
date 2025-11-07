#!/bin/bash

# Setup HTTPS para o bucket original - Validador de Entrega
echo "🔒 Configurando HTTPS para o bucket original"
echo "============================================="

# Usar o bucket original que já funciona
ORIGINAL_BUCKET="validador-entrega-website-1758128536"
DISTRIBUTION_CONFIG="cloudfront-original-config.json"

echo "[INFO] Configurando CloudFront para bucket original: $ORIGINAL_BUCKET"

# Criar configuração do CloudFront para o bucket original
cat > $DISTRIBUTION_CONFIG << EOF
{
    "CallerReference": "validador-original-$(date +%s)",
    "Comment": "Validador de Entrega Web Continental - HTTPS (Bucket Original)",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-${ORIGINAL_BUCKET}",
                "DomainName": "${ORIGINAL_BUCKET}.s3.us-east-2.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${ORIGINAL_BUCKET}",
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

# Criar nova distribuição CloudFront
echo "[INFO] Criando distribuição CloudFront para bucket original..."
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file://$DISTRIBUTION_CONFIG --output json)

if [ $? -eq 0 ]; then
    # Extrair informações da distribuição
    DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.Id')
    DOMAIN_NAME=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.DomainName')
    
    echo ""
    echo "✅ HTTPS CONFIGURADO PARA BUCKET ORIGINAL!"
    echo "=========================================="
    echo ""
    echo "🌐 Aplicação Principal (HTTP): https://$ORIGINAL_BUCKET.s3.us-east-2.amazonaws.com/index.html"
    echo "🔒 Aplicação Principal (HTTPS): https://$DOMAIN_NAME/index.html"
    echo "🏢 Backoffice (HTTP): https://$ORIGINAL_BUCKET.s3.us-east-2.amazonaws.com/backoffice/"
    echo "🔒 Backoffice (HTTPS): https://$DOMAIN_NAME/backoffice/"
    echo "🆔 Distribution ID: $DISTRIBUTION_ID"
    echo ""
    echo "⚠️  IMPORTANTE: A aplicação principal continua funcionando no link original!"
    echo "✅ Link original mantido: https://$ORIGINAL_BUCKET.s3.us-east-2.amazonaws.com/index.html"
    echo "✅ Backoffice adicionado: https://$ORIGINAL_BUCKET.s3.us-east-2.amazonaws.com/backoffice/"
    echo "🆕 URLs HTTPS opcionais disponíveis via CloudFront"
    echo ""
    echo "⏳ Aguarde 5-15 minutos para o CloudFront propagar globalmente"
    
    # Limpar arquivo temporário
    rm $DISTRIBUTION_CONFIG
    
    # Salvar informações
    echo "ORIGINAL_HTTP=https://$ORIGINAL_BUCKET.s3.us-east-2.amazonaws.com/index.html" > .env-final
    echo "BACKOFFICE_HTTP=https://$ORIGINAL_BUCKET.s3.us-east-2.amazonaws.com/backoffice/" >> .env-final
    echo "HTTPS_URL=https://$DOMAIN_NAME" >> .env-final
    echo "DISTRIBUTION_ID=$DISTRIBUTION_ID" >> .env-final
    
    echo ""
    echo "💾 URLs salvas em .env-final"
    
else
    echo "❌ Erro ao criar distribuição CloudFront"
    rm $DISTRIBUTION_CONFIG
    exit 1
fi