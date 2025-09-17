# 📦 Validador de Entrega - Web Continental

Uma aplicação web serverless completa para validação e registro de entregas através de QR Code, construída com AWS Lambda, DynamoDB, API Gateway e CloudFront.

## 🏗️ Arquitetura da Solução

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   S3 Bucket     │    │   API Gateway   │
│   (CDN Global)  │    │ (Static Website)│    │   (REST API)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │  Lambda Function│
                                               │   (Node.js)     │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    DynamoDB     │
                                               │ (NoSQL Database)│
                                               └─────────────────┘
```

## 🚀 Funcionalidades

- ✅ **Validação de Nota Fiscal em Tempo Real**: API serverless com DynamoDB
- 📱 **Design Mobile-First**: Interface otimizada para smartphones
- 📸 **Captura de Foto**: Upload direto da câmera traseira
- 🎨 **Interface Profissional**: Design da Web Continental
- ⚡ **Performance Global**: CloudFront CDN
- 🔒 **Segurança**: IAM roles, HTTPS, dados mascarados
- 📊 **Escalabilidade Automática**: Serverless architecture
- 💰 **Pay-per-Use**: Sem custos fixos de infraestrutura

## 🛠️ Stack Tecnológica

### **Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Design responsivo com CSS Grid/Flexbox
- Progressive Web App (PWA) ready

### **Backend:**
- **AWS Lambda**: Node.js 18.x runtime
- **API Gateway**: REST API com CORS
- **DynamoDB**: Base de dados NoSQL serverless
- **CloudFormation/SAM**: Infrastructure as Code

### **DevOps:**
- **S3**: Hospedagem de site estático
- **CloudFront**: CDN global
- **AWS CLI/SAM CLI**: Deploy automatizado
- **Git**: Controle de versão

## 📋 Base de Dados de Produtos para Teste

A aplicação vem pré-configurada com **10 produtos reais** para validação:

| Nota Fiscal | Produto | Valor | Cliente | CEP | Status |
|-------------|---------|-------|---------|-----|--------|
| **NF001234567** | Samsung Galaxy S23 128GB Preto | R$ 2.499,99 | João Silva Santos | 01310-100 | Pendente |
| **NF002345678** | Notebook Dell Inspiron 15 i5 8GB | R$ 3.299,00 | Maria Oliveira Costa | 04567-890 | Pendente |
| **NF003456789** | Smart TV LG 55" 4K ThinQ AI | R$ 2.899,90 | Carlos Roberto Lima | 22071-900 | Pendente |
| **NF004567890** | Sony WH-1000XM4 Bluetooth | R$ 1.299,99 | Ana Paula Ferreira | 30112-000 | Pendente |
| **NF005678901** | Canon EOS Rebel T7i Kit 18-55mm | R$ 3.799,00 | Pedro Henrique Souza | 70040-010 | Pendente |
| **NF006789012** | iPad Air 64GB Wi-Fi Space Gray | R$ 4.199,00 | Fernanda Castro Alves | 90010-150 | Pendente |
| **NF007890123** | PlayStation 5 Digital Edition | R$ 4.299,99 | Lucas Matheus Rocha | 80020-360 | Pendente |
| **NF008901234** | Nespresso Vertuo Plus + Aeroccino | R$ 899,90 | Juliana Santos Barbosa | 40070-110 | Pendente |
| **NF009012345** | Monitor ASUS TUF Gaming 24" 144Hz | R$ 1.499,99 | Rafael Augusto Dias | 88010-000 | Pendente |
| **NF010123456** | Ar Condicionado Electrolux 12000 BTUs | R$ 1.899,00 | Camila Rodrigues Melo | 60175-047 | Pendente |

### 📍 **Informações Detalhadas dos Produtos:**

#### 🔹 **NF001234567 - Samsung Galaxy S23**
- **Especificações**: Tela 6.1" Dynamic AMOLED 2X, 128GB, Câmera 50MP
- **Peso**: 174g | **Dimensões**: 14.6 x 7.06 x 0.76 cm
- **Entrega**: Av. Paulista, 1578 - São Paulo/SP

#### 🔹 **NF002345678 - Notebook Dell Inspiron 15**
- **Especificações**: Intel Core i5, 8GB RAM, SSD 256GB, Tela 15.6"
- **Peso**: 1.83kg | **Dimensões**: 35.8 x 23.6 x 1.99 cm
- **Entrega**: Rua Augusta, 2690 - São Paulo/SP

#### 🔹 **NF003456789 - Smart TV LG 55"**
- **Especificações**: 4K UHD, ThinQ AI, HDR Ativo, WebOS
- **Peso**: 15.9kg | **Dimensões**: 124.3 x 77.8 x 8.6 cm
- **Entrega**: Av. Atlântica, 1702 - Rio de Janeiro/RJ

#### 🔹 **NF004567890 - Sony WH-1000XM4**
- **Especificações**: Noise Cancelling, Bluetooth 5.0, 30h bateria
- **Peso**: 254g | **Dimensões**: 25.4 x 22.0 x 8.9 cm
- **Entrega**: Av. Afonso Pena, 1270 - Belo Horizonte/MG

#### 🔹 **NF005678901 - Canon EOS Rebel T7i**
- **Especificações**: DSLR 24.2MP, Kit 18-55mm, Full HD Video
- **Peso**: 532g | **Dimensões**: 13.1 x 10.2 x 7.6 cm
- **Entrega**: SCS Quadra 02, Bloco C - Brasília/DF

## � Deploy Automático na AWS

### **Pré-requisitos:**

1. **AWS CLI** instalado e configurado:
```bash
aws configure
```

2. **SAM CLI** instalado:
```bash
# macOS
brew install aws-sam-cli

# Windows
choco install aws-sam-cli

# Linux
pip install aws-sam-cli
```

3. **Permissões AWS** necessárias:
   - CloudFormation full access
   - Lambda full access
   - DynamoDB full access
   - S3 full access
   - API Gateway full access
   - CloudFront full access
   - IAM role creation

### **Deploy com Um Comando:**

```bash
./deploy.sh
```

O script automaticamente:
- ✅ Verifica pré-requisitos
- ✅ Instala dependências do backend
- ✅ Faz build da aplicação SAM
- ✅ Cria infraestrutura AWS (CloudFormation)
- ✅ Popula DynamoDB com dados de teste
- ✅ Configura frontend para produção
- ✅ Faz upload para S3
- ✅ Invalida cache do CloudFront
- ✅ Testa a API
- ✅ Fornece URLs finais

### **Saída Esperada:**
```
🚀 Iniciando deploy do Validador de Entrega - Web Continental
==================================================
[INFO] Verificando pré-requisitos...
[INFO] Pré-requisitos verificados ✅
[INFO] Executando SAM build...
[INFO] Executando SAM deploy...
[INFO] Obtendo informações da infraestrutura...
[INFO] API Gateway URL: https://abc123.execute-api.us-east-1.amazonaws.com/prod
[INFO] S3 Bucket: validador-entrega-prod-123456789
[INFO] Website URL: https://d1234567890.cloudfront.net

🎉 Deploy concluído com sucesso!

📋 Informações do Deploy:
• Website: https://d1234567890.cloudfront.net
• API: https://abc123.execute-api.us-east-1.amazonaws.com/prod

🧪 Notas Fiscais para Teste:
• NF001234567 - Samsung Galaxy S23
• NF002345678 - Notebook Dell
• [... mais produtos ...]

✅ A aplicação está pronta para uso!
```

## 🧪 Como Testar a Aplicação

### **1. Acesso à Aplicação**
Após o deploy, acesse a URL fornecida pelo CloudFront.

### **2. Fluxo de Teste Completo**

#### **Passo 1: Validação da Nota Fiscal**
1. Digite uma das notas fiscais de teste (ex: `NF001234567`)
2. Saia do campo (blur) para disparar a validação
3. ✅ **Resultado esperado**: Dados do produto aparecem mascarados

#### **Passo 2: Seleção da Transportadora**
1. Selecione uma opção no dropdown
2. Opções: Loggi, Correios, Jadlog, Frota Própria

#### **Passo 3: Upload do Comprovante**
1. Clique no campo de arquivo
2. **Mobile**: Câmera traseira abre automaticamente
3. **Desktop**: Seletor de arquivo padrão
4. ✅ **Resultado esperado**: Preview da imagem

#### **Passo 4: Registro da Entrega**
1. Clique em "Registrar Entrega"
2. ✅ **Resultado esperado**: Tela de sucesso
3. Dados são salvos no DynamoDB

#### **Passo 5: Nova Entrega**
1. Clique em "Nova Entrega"
2. ✅ **Resultado esperado**: Formulário resetado

### **3. Validação de API Direta**

#### **Health Check:**
```bash
curl https://sua-api-url/prod/health
```

#### **Validar Nota Fiscal:**
```bash
curl https://sua-api-url/prod/validate/NF001234567
```

#### **Registrar Entrega:**
```bash
curl -X POST https://sua-api-url/prod/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "NF001234567",
    "logisticsCompany": "loggi",
    "deliveryProof": "data:image/jpeg;base64,..."
  }'
```

## 🔧 Estrutura do Projeto

```
Validador-entrega-1P/
├── 📁 backend/                 # Backend Lambda functions
│   ├── package.json           # Dependencies
│   ├── index.js              # Main API handler
│   └── dbInit.js             # Database initialization
├── 📁 assets/                 # Static assets
│   └── web.png               # Web Continental logo
├── 📄 index.html             # Frontend HTML (development)
├── 📄 styles.css             # CSS styles
├── 📄 script.js              # Frontend JS (development)
├── 📄 script-api.js          # Frontend JS (production)
├── 📄 template.yaml          # SAM/CloudFormation template
├── 📄 deploy.sh              # Automated deployment script
├── 📄 favicon.png            # Favicon
└── 📄 README.md              # This file
```

## 🏷️ **Endpoints da API**

### **GET /health**
Health check da API
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T10:30:00Z",
  "service": "Validador de Entrega API",
  "version": "1.0.0"
}
```

### **GET /validate/{invoiceNumber}**
Validar nota fiscal
```json
{
  "invoiceNumber": "NF001234567",
  "customerCPF": "123.***.***..**",
  "deliveryCEP": "01310-100",
  "productDescription": "Smartphone Samsung Galaxy S23 128GB Preto",
  "status": "validated",
  "validatedAt": "2025-09-17T10:30:00Z"
}
```

### **POST /delivery**
Registrar entrega
```json
{
  "success": true,
  "message": "Entrega registrada com sucesso",
  "deliveryId": "uuid-generated",
  "invoiceNumber": "NF001234567",
  "deliveredAt": "2025-09-17T10:30:00Z"
}
```

## 💰 Custos Estimados AWS

### **Uso Estimado (1000 entregas/mês):**
- **Lambda**: ~$0.20/mês (100ms avg execution)
- **DynamoDB**: ~$1.25/mês (pay-per-request)
- **API Gateway**: ~$3.50/mês (1000 requests)
- **S3**: ~$0.50/mês (hosting + transfer)
- **CloudFront**: ~$1.00/mês (global CDN)

**� Total Estimado: ~$6.45/mês**

### **Escalabilidade:**
- **10K entregas/mês**: ~$25/mês
- **100K entregas/mês**: ~$180/mês
- **1M entregas/mês**: ~$1.500/mês

## 🔒 Segurança Implementada

- ✅ **HTTPS obrigatório** (CloudFront + S3)
- ✅ **CORS configurado** para API
- ✅ **IAM roles** com menor privilégio
- ✅ **Dados mascarados** (CPF parcial)
- ✅ **Validação de entrada** rigorosa
- ✅ **Encryption at rest** (DynamoDB)
- ✅ **Logs auditáveis** (CloudWatch)

## 📊 Monitoramento e Logs

### **CloudWatch Logs:**
- `/aws/lambda/validador-entrega-api-prod`
- `/aws/lambda/validador-entrega-db-init-prod`

### **Métricas Disponíveis:**
- Invocações de Lambda
- Latência da API
- Erros 4xx/5xx
- Uso do DynamoDB
- Cache hit/miss do CloudFront

## 🗑️ Limpeza de Recursos

Para remover toda a infraestrutura:

```bash
# Deletar stack CloudFormation
aws cloudformation delete-stack --stack-name validador-entrega-prod

# Limpar bucket S3 (se necessário)
aws s3 rm s3://validador-entrega-prod-123456789 --recursive
aws s3 rb s3://validador-entrega-prod-123456789
```

## 🤝 Suporte e Manutenção

### **Logs e Debug:**
1. Verifique CloudWatch Logs
2. Use AWS X-Ray para tracing
3. Monitor API Gateway metrics

### **Atualizações:**
1. Modifique o código
2. Execute `./deploy.sh` novamente
3. CloudFormation fará update incremental

### **Troubleshooting Comum:**

#### **API retorna 502/503:**
- Verifique logs do Lambda
- Confirme permissões DynamoDB

#### **CORS errors no frontend:**
- Verifique configuração API Gateway
- Confirme headers CORS

#### **Deploy falha:**
- Verifique permissões AWS
- Confirme que SAM CLI está atualizado

---

## 🎯 **Próximos Passos (Roadmap)**

- [ ] **v1.1**: Sistema de notificações (SNS)
- [ ] **v1.2**: Dashboard administrativo
- [ ] **v1.3**: Geolocalização para confirmação
- [ ] **v1.4**: Integração com sistemas ERP
- [ ] **v1.5**: App mobile nativo
- [ ] **v1.6**: Analytics avançados

---

**Desenvolvido para:** Web Continental  
**Versão:** 1.0.0  
**Arquitetura:** AWS Serverless  
**Última atualização:** Setembro 2025

**🚀 A aplicação está pronta para produção e escalável para milhões de entregas!**