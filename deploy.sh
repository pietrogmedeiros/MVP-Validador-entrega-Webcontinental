#!/bin/bash

# Validador de Entrega - Web Continental
# Script de Deploy Automático para AWS

set -e  # Exit on any error

echo "🚀 Iniciando deploy do Validador de Entrega - Web Continental"
echo "=================================================="

# Configurações
STACK_NAME="validador-entrega-webcontinental"
AWS_REGION="us-east-2"
S3_BUCKET="validador-entrega-deployment-${RANDOM}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar pré-requisitos
echo ""
log "Verificando pré-requisitos..."

# Verificar AWS CLI
if ! command -v aws &> /dev/null; then
    error "AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar SAM CLI
if ! command -v sam &> /dev/null; then
    error "SAM CLI não encontrado. Instale: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html"
    exit 1
fi

# Verificar credenciais AWS
if ! aws sts get-caller-identity &> /dev/null; then
    error "Credenciais AWS não configuradas. Execute: aws configure"
    exit 1
fi

log "Pré-requisitos verificados ✅"

# Verificar se já existe stack
echo ""
log "Verificando stack existente..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION &> /dev/null; then
    warn "Stack $STACK_NAME já existe. Será atualizada."
    DEPLOY_TYPE="update"
else
    log "Nova stack será criada: $STACK_NAME"
    DEPLOY_TYPE="create"
fi

# Instalar dependências do backend
echo ""
log "Instalando dependências do backend..."
cd backend
npm install --production
cd ..

# Build do SAM
echo ""
log "Executando SAM build..."
sam build --region $AWS_REGION

# Deploy do SAM
echo ""
log "Executando SAM deploy..."
sam deploy \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --capabilities CAPABILITY_IAM \
    --resolve-s3 \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --parameter-overrides Environment=prod

# Obter outputs do CloudFormation
echo ""
log "Obtendo informações da infraestrutura..."

API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
    --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text)

log "API Gateway URL: $API_URL"
log "S3 Bucket: $S3_BUCKET"
log "Website URL: $WEBSITE_URL"

# Atualizar frontend com URL da API
echo ""
log "Configurando frontend para produção..."

# Criar versão de produção do index.html
cp index.html index-prod.html
sed -i.bak "s|script.js|script-api.js|g" index-prod.html

# Atualizar script com URL da API real
cp script-api.js script-prod.js
sed -i.bak "s|API_GATEWAY_URL_PLACEHOLDER|$API_URL|g" script-prod.js

# Upload do frontend para S3
echo ""
log "Fazendo upload do frontend para S3..."

aws s3 cp index-prod.html s3://$S3_BUCKET/index.html --content-type "text/html"
aws s3 cp script-prod.js s3://$S3_BUCKET/script-api.js --content-type "application/javascript"
aws s3 cp styles.css s3://$S3_BUCKET/styles.css --content-type "text/css"
aws s3 cp favicon.png s3://$S3_BUCKET/favicon.png --content-type "image/png"
aws s3 cp assets/ s3://$S3_BUCKET/assets/ --recursive

# Configurar cache headers
aws s3 cp s3://$S3_BUCKET/styles.css s3://$S3_BUCKET/styles.css --metadata-directive REPLACE --cache-control "max-age=31536000" --content-type "text/css"
aws s3 cp s3://$S3_BUCKET/script-api.js s3://$S3_BUCKET/script-api.js --metadata-directive REPLACE --cache-control "max-age=31536000" --content-type "application/javascript"

# Invalidar cache do CloudFront
echo ""
log "Invalidando cache do CloudFront..."

DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Validador de Entrega Distribution - prod'].Id" \
    --output text)

if [ ! -z "$DISTRIBUTION_ID" ]; then
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" > /dev/null
    log "Cache invalidado para distribuição: $DISTRIBUTION_ID"
else
    warn "Distribuição CloudFront não encontrada"
fi

# Limpar arquivos temporários
rm -f index-prod.html index-prod.html.bak script-prod.js script-prod.js.bak

# Testar API
echo ""
log "Testando API..."
if curl -f -s "$API_URL/health" > /dev/null; then
    log "API está respondendo ✅"
else
    warn "API não está respondendo ainda (pode levar alguns minutos)"
fi

# Resultado final
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Informações do Deploy:${NC}"
echo "• Stack: $STACK_NAME"
echo "• Região: $AWS_REGION"
echo "• Website: $WEBSITE_URL"
echo "• API: $API_URL"
echo ""
echo -e "${BLUE}🧪 Notas Fiscais para Teste:${NC}"
echo "• NF001234567 - Samsung Galaxy S23"
echo "• NF002345678 - Notebook Dell"
echo "• NF003456789 - Smart TV LG"
echo "• NF004567890 - Fone Sony"
echo "• NF005678901 - Câmera Canon"
echo "• NF006789012 - iPad Air"
echo "• NF007890123 - PlayStation 5"
echo "• NF008901234 - Nespresso"
echo "• NF009012345 - Monitor ASUS"
echo "• NF010123456 - Ar Condicionado"
echo ""
echo -e "${GREEN}✅ A aplicação está pronta para uso!${NC}"
echo "=================================================="