# Diagrama de Arquitetura - Validador de Entrega Web Continental

## Visão Geral do Sistema

O **Validador de Entrega** é uma aplicação web full-stack desenvolvida para gerenciar e registrar entregas de produtos da Webcontinental. A aplicação utiliza **React + Vite** no frontend, **Node.js + Express** no backend, e **Supabase** (PostgreSQL + Storage) como banco de dados e armazenamento.

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO FINAL                                │
│                    (Entregador/Transportadora)                       │
│                           Mobile                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  App.tsx (Router Principal)                                  │  │
│  │  Validator.tsx (Formulário de Validação - Mobile First)     │  │
│  │  Backoffice.tsx (Gestão de Entregas - Desktop First)        │  │
│  │  Scanner de Código de Barras (html5-qrcode)                 │  │
│  │  CSS Responsivo + Modais                                     │  │
│  │                                                               │  │
│  │  Rotas:                                                       │  │
│  │  • / - Página de validação e registro                        │  │
│  │  • /backoffice - Dashboard de entregas                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Porta: 5173 (Dev) | Build: /dist                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Rotas API:                                                   │  │
│  │  • GET  /api/validations - Lista todas as entregas           │  │
│  │  • GET  /api/validations?codigoEntrega={nf} - Valida NF      │  │
│  │  • POST /api/validations - Registra entrega (multipart)      │  │
│  │  • GET  /api/validations/download/:id - Download comprovante │  │
│  │  • POST /api/uploads - Upload de arquivo                     │  │
│  │  • GET  /health - Health check                               │  │
│  │                                                               │  │
│  │  Middleware:                                                  │  │
│  │  • CORS habilitado                                            │  │
│  │  • Morgan (logging)                                           │  │
│  │  • Formidable (upload de arquivos)                           │  │
│  │  • Express Static (serve frontend build)                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Porta: 3000 | Docker: Port 3000 exposto                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Supabase Client
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend as a Service)                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                        │  │
│  │  ┌────────────────────┐      ┌──────────────────────┐        │  │
│  │  │  nfs_storage       │      │  delivery_output     │        │  │
│  │  │  (Notas Fiscais)   │◄────►│  (Entregas)          │        │  │
│  │  │  ~102 colunas      │      │  ~15 colunas         │        │  │
│  │  │  - numero_nfe      │      │  - numero_nfe        │        │  │
│  │  │  - cpf_cnpj        │      │  - tipo_entrega      │        │  │
│  │  │  - cep             │      │  - empresa_logistica │        │  │
│  │  │  - produto         │      │  - nome_cliente      │        │  │
│  │  │  - cliente         │      │  - cpf_cliente       │        │  │
│  │  │  - transportadora  │      │  - comprovante_url   │        │  │
│  │  │  - status_pedido   │      │  - status_entrega    │        │  │
│  │  └────────────────────┘      └──────────────────────┘        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Supabase Storage (S3)                      │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Bucket: comprovantes_entregas                         │  │  │
│  │  │  Pasta: proofs/                                        │  │  │
│  │  │  Formato: {timestamp}-{random}.{ext}                   │  │  │
│  │  │  Tipos: PNG, JPG, JPEG                                 │  │  │
│  │  │  Acesso: Público (URL pública)                         │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Ações do Usuário

### **1. Fluxo Principal: Registro de Entrega**

```
┌─────────────────┐
│  ENTREGADOR     │
│  acessa app     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 1- ESCANEIA CÓDIGO DE BARRAS OU DIGITA NF       │
│    Scanner HTML5 (câmera do celular)         │
│    Input manual                              │
│    Exemplo: "123456789", "A", "NF001234567"     │
└────────┬─────────────────────────────────────────┘
         │
         │ Trigger automático após scan
         ▼
┌──────────────────────────────────────────────────┐
│ 2- VALIDAÇÃO NO BACKEND (Express API)           │
│    GET /api/validations?codigoEntrega={nf}      │
│    ↓                                             │
│    Query Supabase:                               │
│    SELECT * FROM nfs_storage                     │
│    WHERE numero_nfe = '123456789'                │
│                                                  │
│    Validações:                                   │
│    ✓ NF existe?                                  │
│    ✓ status_pedido != 'CANC'?                   │
└────────┬─────────────────────────────────────────┘
         │
         ├─── ❌ NF não encontrada
         │     └─► Mensagem de erro + formulário bloqueado
         │
         └─── ✅ NF validada
               │
               ▼
┌──────────────────────────────────────────────────┐
│ 3- EXIBE DADOS DA NF                            │
│    -CPF/CNPJ                                   │
│    -CEP                                         │
│    -Produto                                     │
│    -Cliente                                     │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 4- PREENCHE DADOS DE ENTREGA                    │
│    • Tipo: Cliente ou Transportadora            │
│    • Se Transportadora: Nome da empresa         │
│    • Se Cliente: Nome completo + CPF            │
│    • Foto do comprovante (câmera)            │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 5- SUBMETE FORMULÁRIO                           │
│    POST /api/validations (multipart/form-data)  │
│    ↓                                             │
│    Backend processa:                             │
│    1. Upload da foto → Supabase Storage         │
│    2. Insere registro → delivery_output         │
│    3. Retorna confirmação                        │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 6- MODAL DE SUCESSO                             │
│    "Entrega Registrada!"                      │
│    Botão: Nova Entrega                        │
│    → Limpa formulário e reinicia                │
└──────────────────────────────────────────────────┘
```
               ▼
         ┌─────────────────────────────────────┐
         │ EXIBE DADOS DA NF:                 │
         │ • CPF (mascarado): 123.***.***-**  │
         │ • CEP: 01310-100                   │
         │ • Produto: Samsung Galaxy S23...   │
         └─────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│ 3- SELECIONA TIPO DE ENTREGA                    │
│    Options:                                      │
│    • Cliente (pessoa retirou no balcão)         │
│    • Transportadora (empresa de logística)      │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 4- PREENCHE DADOS ADICIONAIS                    │
│    Se Cliente:                                   │
│    • Nome completo                              │
│    • CPF                                        │
│                                                  │
│    Se Transportadora:                            │
│    • Seleciona empresa (Loggi, Correios, etc)  │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 5- UPLOAD DO COMPROVANTE FOTOGRÁFICO            │
│    Input: <input type="file" accept="image/*"   │
│           capture="environment">                │
│                                                  │
│    Comportamento:                                │
│    • Mobile: Abre câmera traseira               │
│    • Desktop: Seletor de arquivo                │
│                                                  │
│    Validações Frontend:                          │
│    ✓ É imagem?                                   │
│    ✓ Tamanho < 10MB?                             │
│    ✓ Preview gerado                              │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 6- CLICA "REGISTRAR ENTREGA"                    │
│    Button: #submit-btn                          │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 7- PROCESSAMENTO BACKEND                        │
│    Passo 1: Upload para Bucket                  │
│    • Função: uploadProof(numero_nfe, file)      │
│    • Bucket: comprovantes_entregas              │
│    • Path: comprovantes/2025-12-01/A_*.jpg      │
│    • Retorna: URL pública                       │
│                                                  │
│    Passo 2: Salvar no Database                  │
│    • Função: saveDelivery(deliveryData)         │
│    • Tabela: delivery_output                    │
│    • Dados: NF, tipo, empresa, cliente, URL     │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 8- CONFIRMAÇÃO DE SUCESSO                       │
│    • Mensagem: "Entrega registrada com sucesso!"│
│    • Botão: "Nova Entrega" (reset formulário)   │
└──────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

### **Frontend**
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Roteamento**: React Router DOM 7
- **Scanner**: html5-qrcode (scanner de código de barras)
- **Estilização**: CSS puro com design responsivo
- **HTTP Client**: Fetch API nativa

### **Backend**
- **Runtime**: Node.js 22
- **Framework**: Express 5
- **Linguagem**: JavaScript (ES Modules)
- **Upload**: Formidable 3.5
- **CORS**: cors 2.8
- **Logging**: Morgan 1.10
- **Hot Reload**: Nodemon 3.1

### **Banco de Dados e Storage**
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Storage**: S3-compatible (Supabase Storage)
- **Client**: @supabase/supabase-js 2.93

### **DevOps**
- **Containerização**: Docker + Docker Compose
- **Base Image**: node:22-bullseye
- **Build**: Multi-stage Docker build
- **Porta**: 3000 (backend serve frontend)

---

## Estrutura de Diretórios

```
Validador-entrega-1P/
├── back/
│   └── express/
│       ├── src/
│       │   ├── server.js              # Entry point do Express
│       │   ├── routes/
│       │   │   ├── validations.js     # Rotas de validação e registro
│       │   │   ├── uploads.js         # Upload de arquivos
│       │   │   ├── nfs.js             # Consulta de NFs
│       │   │   └── health.js          # Health check
│       │   └── services/
│       │       └── supabaseClient.js  # Cliente Supabase
│       ├── public/                    # Frontend build (copiado)
│       ├── .env                       # Variáveis de ambiente
│       ├── package.json
│       └── ROTAS-API.md              # Documentação das APIs
├── front/
│   └── app/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Validator.tsx      # Formulário principal
│       │   │   └── Backoffice.tsx     # Área administrativa
│       │   ├── App.tsx                # Componente raiz
│       │   ├── App.css                # Estilos globais
│       │   └── main.tsx               # Entry point
│       ├── dist/                      # Build de produção
│       ├── .env                       # Variáveis (VITE_API_URL)
│       ├── package.json
│       └── vite.config.ts
├── docker-compose.yaml                # Orquestração Docker
├── Dockerfile                         # Build do container
└── DIAGRAMA-ARQUITETURA.md           # Este arquivo
```

