#!/bin/bash

echo "🚀 Deploy Rápido - Validador de Entrega"
echo "======================================"

# Gerar nome único
TIMESTAMP=$(date +%s)
STACK_NAME="validador-${TIMESTAMP}"

echo "[INFO] Criando stack: $STACK_NAME"

# Deploy simples
sam deploy \
  --stack-name "$STACK_NAME" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=prod \
  --region us-east-2 \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
    echo "================================="
    echo "Stack Name: $STACK_NAME"
    echo ""
    echo "📋 Obtendo URLs dos recursos..."
    
    # Obter outputs
    aws cloudformation describe-stacks \
      --stack-name "$STACK_NAME" \
      --region us-east-2 \
      --query 'Stacks[0].Outputs[*].{Key:OutputKey,Value:OutputValue}' \
      --output table
      
    echo ""
    echo "🎯 Aplicação pronta para uso!"
else
    echo "❌ Erro no deploy"
    exit 1
fi