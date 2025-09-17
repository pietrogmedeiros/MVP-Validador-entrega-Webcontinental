#!/bin/bash

echo "🚀 Criando distribuição CloudFront para acesso mobile"
echo "==================================================="

BUCKET_NAME="validador-entrega-website-1758128536"
DISTRIBUTION_CONFIG='{
    "CallerReference": "'$(date +%s)'",
    "Comment": "Validador de Entrega - Web Continental - Mobile Friendly",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-'$BUCKET_NAME'",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 7,
            "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-'$BUCKET_NAME'",
                "DomainName": "'$BUCKET_NAME'.s3.us-east-2.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "PriceClass": "PriceClass_100"
}'

echo "[INFO] Criando distribuição CloudFront..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config "$DISTRIBUTION_CONFIG" --query 'Distribution.Id' --output text)

if [ $? -eq 0 ]; then
    echo "[INFO] Distribuição criada: $DISTRIBUTION_ID"
    echo "[INFO] Aguardando deploy (isso pode levar alguns minutos)..."
    
    # Pegar domain name
    DOMAIN_NAME=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
    
    echo ""
    echo "✅ CloudFront configurado com sucesso!"
    echo "=================================="
    echo ""
    echo "🌐 URL HTTPS (Mobile): https://$DOMAIN_NAME"
    echo "📱 Esta URL funcionará perfeitamente no mobile!"
    echo ""
    echo "ℹ️ O deploy pode levar 5-15 minutos para ficar totalmente ativo."
    echo "💡 Use esta URL no seu celular em vez da anterior."
    
else
    echo "❌ Erro ao criar distribuição CloudFront"
fi