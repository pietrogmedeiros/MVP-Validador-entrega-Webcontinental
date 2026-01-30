# Diagrama de Arquitetura - Validador de Entrega Web Continental

## Visão Geral do Sistema

O **Validador de Entrega** é uma aplicação web full-stack desenvolvida para gerenciar e registrar entregas de produtos. A aplicação utiliza **Supabase** (PostgreSQL + Storage) como backend e está hospedada na **Vercel**.

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO FINAL                                │
│                    (Entregador/Transportadora)                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Vercel)                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  index.html (Formulário de Validação)                        │  │
│  │  script.js (Lógica de Frontend)                              │  │
│  │  styles.css (Design Responsivo)                              │  │
│  │  supabase.js (Cliente Supabase)                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ API REST (HTTPS + JWT)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend as a Service)                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                        │  │
│  │  ┌────────────────────┐      ┌──────────────────────┐        │  │
│  │  │  nfs_storage       │      │  delivery_output     │        │  │
│  │  │  (Notas Fiscais)   │◄────►│  (Entregas)          │        │  │
│  │  │  ~102 colunas      │      │  ~15 colunas         │        │  │
│  │  └────────────────────┘      └──────────────────────┘        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Supabase Storage (S3)                      │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Bucket: comprovantes_entregas                         │  │  │
│  │  │  Estrutura: comprovantes/YYYY-MM-DD/NUMERO_NF_*.jpg    │  │  │
│  │  │  Permissões: Público (leitura/escrita)                 │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │ Consultas
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKOFFICE (Área Administrativa)                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Backoffice-Validador/index.html                             │  │
│  │  - Visualizar todas as entregas                              │  │
│  │  - Filtrar por status, NF, transportadora                    │  │
│  │  - Ver comprovantes fotográficos                             │  │
│  │  - Atualizar status de entrega                               │  │
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
│ 1️⃣ DIGITA NÚMERO DA NOTA FISCAL                 │
│    Input: numero_nfe                            │
│    Exemplo: "A", "B", "NF001234567"             │
└────────┬─────────────────────────────────────────┘
         │
         │ Evento: onBlur (sai do campo)
         ▼
┌──────────────────────────────────────────────────┐
│ 2️⃣ VALIDAÇÃO NO SUPABASE                        │
│    Query: SELECT * FROM nfs_storage             │
│           WHERE numero_nfe = 'A'                │
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
         ┌─────────────────────────────────────┐
         │ EXIBE DADOS DA NF:                 │
         │ • CPF (mascarado): 123.***.***-**  │
         │ • CEP: 01310-100                   │
         │ • Produto: Samsung Galaxy S23...   │
         └─────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│ 3️⃣ SELECIONA TIPO DE ENTREGA                    │
│    Options:                                      │
│    • Cliente (pessoa retirou no balcão)         │
│    • Transportadora (empresa de logística)      │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 4️⃣ PREENCHE DADOS ADICIONAIS                    │
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
│ 5️⃣ UPLOAD DO COMPROVANTE FOTOGRÁFICO            │
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
│ 6️⃣ CLICA "REGISTRAR ENTREGA"                    │
│    Button: #submit-btn                          │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│ 7️⃣ PROCESSAMENTO BACKEND                        │
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
│ 8️⃣ CONFIRMAÇÃO DE SUCESSO                       │
│    • Mensagem: "Entrega registrada com sucesso!"│
│    • Botão: "Nova Entrega" (reset formulário)   │
└──────────────────────────────────────────────────┘
```

---

## Estrutura das Tabelas do Banco de Dados

### **Tabela 1: `nfs_storage`** (Notas Fiscais)

**Descrição**: Armazena todas as informações das notas fiscais/pedidos importadas dos marketplaces.

**Função**: Fonte de dados para validação. A aplicação consulta esta tabela para verificar se a NF existe e obter dados do cliente.

#### **Colunas Principais (~102 no total)**

| Coluna | Tipo | Descrição | Uso na Aplicação |
|--------|------|-----------|------------------|
| `id` | `bigint` (PK) | ID único auto-incremento | Chave primária |
| **`numero_nfe`** | `varchar(9)` | **Número da Nota Fiscal** | **🔑 Campo de busca principal** |
| `numero_serie_nfe` | `varchar(4)` | Série da NF | Identificação complementar |
| `chave_acesso_nfe` | `varchar(44)` | Chave de acesso completa | Rastreabilidade fiscal |
| **`status_pedido`** | `varchar(100)` | **Status do pedido** | **Validação: bloqueia se = 'CANC'** |
| **`cliente`** | `varchar(50)` | **Nome do cliente** | Exibido após validação |
| **`cpf_cnpj`** | `varchar(6)` | **CPF/CNPJ (primeiros dígitos)** | Validação mascarada (123.***) |
| `doc_cliente` | `varchar(14)` | Documento completo | Validação interna |
| **`cep`** | `integer` | **CEP de entrega** | Exibido após validação |
| `endereco` | `varchar(100)` | Endereço completo | Referência de entrega |
| `numero` | `bigint` | Número do endereço | Complemento do endereço |
| `complemento` | `varchar(100)` | Complemento | Referência adicional |
| `bairro` | `varchar(50)` | Bairro | Localização |
| `municipio` | `varchar(50)` | Cidade | Localização |
| `estado` | `varchar(50)` | Estado (UF) | Localização |
| `uf` | `varchar(2)` | Sigla UF | Filtros regionais |
| **`produto`** | `varchar(255)` | **Descrição do produto** | **Exibido após validação** |
| `sku_produto` | `varchar(35)` | SKU interno | Controle de estoque |
| `ean_produto` | `bigint` | Código de barras EAN | Identificação do produto |
| `quantidade` | `integer` | Quantidade de itens | Conferência |
| `valor_unitario` | `numeric(20,6)` | Valor por unidade | Valor comercial |
| `total_produtos` | `numeric(20,6)` | Valor total produtos | Cálculo financeiro |
| `frete` | `numeric(20,6)` | Valor do frete | Custo logístico |
| `total_pedido` | `numeric(20,6)` | Valor total do pedido | Total da NF |
| `data_pedido` | `timestamp` | Data do pedido | Histórico |
| `data_emissao_nfe` | `timestamp` | Data emissão NF | Controle fiscal |
| **`data_entrega`** | `timestamp` | **Data prevista de entrega** | SLA de entrega |
| `previsao_esperada` | `timestamp` | Previsão estimada | Planejamento logístico |
| **`transportadora`** | `varchar(50)` | **Nome da transportadora** | Empresa responsável |
| `codigo_rastreio` | `varchar(100)` | Código de rastreio | Tracking |
| `url_rastreio` | `varchar(100)` | URL tracking | Link para rastreamento |
| `pedido_mkp` | `varchar(50)` | ID do pedido marketplace | Integração marketplace |
| `id_anymarket` | `varchar(14)` | ID no Anymarket | Sistema ERP |
| `canal_any` | `varchar(50)` | Canal de venda | Origem do pedido |
| `abreviacao_marketplace` | `varchar(6)` | Sigla marketplace (MELI, B2W) | Filtro por canal |
| `email` | `varchar(50)` | Email do cliente | Notificações |
| `telefone` | `bigint` | Telefone do cliente | Contato |
| `forma_pagamento` | `varchar(150)` | Método de pagamento | Financeiro |
| `status_anymarket` | `varchar(15)` | Status no ERP | Sincronização |
| `status_entrega` | `varchar(25)` | Status logístico | Acompanhamento |
| `status_entrega_mkp` | `varchar(15)` | Status marketplace | Integração |
| `data_ocorrencia` | `timestamp` | Data última ocorrência | Log de eventos |
| `created_at` | `timestamp` | Data de criação do registro | Auditoria |

#### **Índices para Performance**
```sql
CREATE INDEX idx_nfs_storage_numero_serie_nfe ON nfs_storage(numero_serie_nfe);
CREATE INDEX idx_nfs_storage_chave_acesso ON nfs_storage(chave_acesso_nfe);
CREATE INDEX idx_nfs_storage_pedido_mkp ON nfs_storage(pedido_mkp);
CREATE INDEX idx_nfs_storage_codigo_rastreio ON nfs_storage(codigo_rastreio);
CREATE INDEX idx_nfs_storage_status_pedido ON nfs_storage(status_pedido);
CREATE INDEX idx_nfs_storage_data_pedido ON nfs_storage(data_pedido);
CREATE INDEX idx_nfs_storage_cliente ON nfs_storage(cliente);
```

#### **Exemplo de Dados**
```sql
{
  "id": 1,
  "numero_nfe": "A",
  "cliente": "João Silva Santos",
  "cpf_cnpj": "123456",
  "doc_cliente": "12345678901",
  "cep": 1310100,
  "endereco": "Av. Paulista, 1578",
  "municipio": "São Paulo",
  "estado": "SP",
  "produto": "Samsung Galaxy S23 128GB Preto",
  "status_pedido": "OK",
  "total_pedido": 2499.99,
  "transportadora": "Loggi",
  "data_pedido": "2025-11-20T10:00:00Z"
}
```

---

### **Tabela 2: `delivery_output`** (Registro de Entregas)

**Descrição**: Armazena todos os registros de entregas realizadas com comprovantes.

**Função**: Persistir dados de cada entrega + URL do comprovante fotográfico.

#### **Colunas Principais (~15 no total)**

| Coluna | Tipo | Descrição | Alimentada Por | Leitura Por |
|--------|------|-----------|----------------|-------------|
| `id` | `uuid` (PK) | ID único UUID | Sistema (auto) | Backoffice |
| **`numero_nfe`** | `varchar(50)` | **Número da NF** | **Frontend (input usuário)** | **Backoffice (filtro)** |
| **`tipo_entrega`** | `varchar(50)` | **Tipo: 'cliente' ou 'transportadora'** | **Frontend (select)** | **Backoffice (visualização)** |
| **`empresa_logistica`** | `varchar(100)` | **Nome da transportadora** | **Frontend (select)** | **Backoffice (filtro)** |
| **`nome_cliente`** | `varchar(150)` | **Nome de quem recebeu** | **Frontend (input)** | **Backoffice (visualização)** |
| **`cpf_cliente`** | `varchar(20)` | **CPF de quem recebeu** | **Frontend (input)** | **Backoffice (validação)** |
| **`comprovante_url`** | `text` | **URL do comprovante no bucket** | **Backend (uploadProof)** | **Backoffice (download)** |
| **`data_hora_registro`** | `timestamp` | **Quando foi registrado** | **Backend (new Date())** | **Backoffice (histórico)** |
| `data_entrega` | `timestamp` | Data efetiva da entrega | Frontend (opcional) | Backoffice (relatórios) |
| `status_entrega` | `varchar(50)` | Status: 'pendente', 'entregue', 'devolvido' | Sistema (default: 'entregue') | Backoffice (filtro) |
| `observacoes` | `text` | Observações adicionais | Frontend (textarea) | Backoffice (detalhes) |
| `assinatura_cliente` | `text` | Assinatura digital (base64) | Frontend (futuro) | Backoffice (validação) |
| `created_at` | `timestamp` | Timestamp de criação | Sistema (auto) | Auditoria |

#### **Índices para Performance**
```sql
CREATE INDEX idx_delivery_output_numero_nfe ON delivery_output(numero_nfe);
CREATE INDEX idx_delivery_output_status ON delivery_output(status_entrega);
CREATE INDEX idx_delivery_output_data_registro ON delivery_output(data_hora_registro);
```

#### **Relacionamento com `nfs_storage`**
```sql
-- Relacionamento lógico (não há FK física, mas busca por numero_nfe)
delivery_output.numero_nfe → nfs_storage.numero_nfe (1:N)
```

#### **Exemplo de Dados**
```sql
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero_nfe": "A",
  "tipo_entrega": "transportadora",
  "empresa_logistica": "Loggi",
  "nome_cliente": null,
  "cpf_cliente": null,
  "comprovante_url": "https://pnbsjmwatuhyijsuyjqe.supabase.co/storage/v1/object/public/comprovantes_entregas/comprovantes/2025-12-01/A_1733068800000.jpg",
  "data_hora_registro": "2025-12-01T14:30:00Z",
  "data_entrega": "2025-12-01T14:30:00Z",
  "status_entrega": "entregue",
  "created_at": "2025-12-01T14:30:00Z"
}
```

#### **Fluxo de Alimentação da Tabela**
```javascript
// No arquivo supabase.js - Função saveDelivery()

export async function saveDelivery(deliveryData) {
    const { data, error } = await supabase
        .from('delivery_output')
        .insert([{
            numero_nfe: deliveryData.invoiceNumber,        // ← do input frontend
            tipo_entrega: deliveryData.deliveryType,       // ← do select frontend
            empresa_logistica: deliveryData.logisticsCompany || null,  // ← do select
            nome_cliente: deliveryData.clientName || null, // ← do input
            cpf_cliente: deliveryData.clientCpf || null,   // ← do input
            comprovante_url: deliveryData.proofUrl,        // ← retorno do uploadProof()
            data_hora_registro: new Date().toISOString(),  // ← timestamp backend
            created_at: new Date().toISOString()           // ← timestamp backend
        }])
        .select()
    
    return data[0]
}
```

---

## Bucket de Storage: `comprovantes_entregas`

### **Configuração do Bucket**

**Nome**: `comprovantes_entregas`  
**Tipo**: Público (leitura/escrita permitidas)  
**Provider**: Supabase Storage (S3-compatível)  
**URL Base**: `https://pnbsjmwatuhyijsuyjqe.supabase.co/storage/v1/object/public/comprovantes_entregas/`

### **Estrutura de Pastas**

```
comprovantes_entregas/
├── comprovantes/
│   ├── 2025-11-30/
│   │   ├── A_1701360000000.jpg
│   │   ├── B_1701360123456.jpg
│   │   └── NF001234567_1701360987654.jpg
│   ├── 2025-12-01/
│   │   ├── A_1733068800000.jpg
│   │   ├── C_1733069000000.jpg
│   │   └── D_1733070000000.jpg
│   └── 2025-12-02/
│       └── E_1733155200000.jpg
```

### **Nomenclatura dos Arquivos**

**Padrão**: `{NUMERO_NF}_{TIMESTAMP}.{EXTENSAO}`

**Exemplo**: `A_1733068800000.jpg`
- `A` = Número da Nota Fiscal
- `1733068800000` = Timestamp Unix (ms)
- `jpg` = Extensão da imagem

### **Função de Upload**

```javascript
// supabase.js - uploadProof()

export async function uploadProof(invoiceNumber, file) {
    // 1. Gerar nome único com timestamp
    const timestamp = new Date().getTime();
    const extension = 'jpg';
    const fileName = `${invoiceNumber.toUpperCase()}_${timestamp}.${extension}`;
    
    // 2. Criar pasta organizada por data
    const today = new Date().toISOString().split('T')[0]; // "2025-12-01"
    const filePath = `comprovantes/${today}/${fileName}`;
    // Resultado: comprovantes/2025-12-01/A_1733068800000.jpg
    
    // 3. Upload para o bucket
    const { data, error } = await supabase
        .storage
        .from('comprovantes_entregas')
        .upload(filePath, file, {
            cacheControl: '3600',      // Cache de 1 hora
            upsert: false,             // Não sobrescrever arquivos existentes
            contentType: 'image/jpeg'  // Tipo MIME
        });
    
    // 4. Obter URL pública
    const { data: { publicUrl } } = supabase
        .storage
        .from('comprovantes_entregas')
        .getPublicUrl(filePath);
    
    // Retorna: https://.../comprovantes_entregas/comprovantes/2025-12-01/A_*.jpg
    return publicUrl;
}
```

### **Políticas de Acesso (Storage Policies)**

```sql
-- Policy 1: Permitir UPLOAD público
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'comprovantes_entregas');

-- Policy 2: Permitir LEITURA pública
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'comprovantes_entregas');

-- Policy 3: Permitir DELETE público
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'comprovantes_entregas');

-- Policy 4: Permitir UPDATE público
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'comprovantes_entregas');
```

### **Como o Bucket Funciona**

1. **Upload (Escrita)**
   - Frontend captura foto/arquivo
   - JavaScript converte para Blob/File
   - `uploadProof()` faz upload via Supabase Storage SDK
   - Bucket salva arquivo com path único
   - Retorna URL pública permanente

2. **Leitura (Download)**
   - Backoffice busca `delivery_output.comprovante_url`
   - URL pública pode ser acessada diretamente no navegador
   - Sem necessidade de autenticação (bucket público)

3. **Organização**
   - Pastas por data facilitam manutenção
   - Timestamp garante unicidade
   - Fácil de fazer backups/arquivamento

4. **Metadados**
   - Cada arquivo tem `contentType`, `size`, `created_at`
   - Supabase Storage mantém versionamento (se habilitado)

---

## Fluxo Completo de Dados (End-to-End)

### **Diagrama Sequencial**

```
USUÁRIO          FRONTEND           SUPABASE           BUCKET          DATABASE
   │                 │                  │                │                │
   │ 1. Digite NF    │                  │                │                │
   ├────────────────►│                  │                │                │
   │                 │ 2. Valida NF     │                │                │
   │                 ├─────────────────►│                │                │
   │                 │                  │ 3. Query       │                │
   │                 │                  ├───────────────────────────────►│
   │                 │                  │                │   SELECT *     │
   │                 │                  │                │   FROM nfs     │
   │                 │                  │                │   WHERE nf='A' │
   │                 │                  │◄───────────────────────────────┤
   │                 │◄─────────────────┤ 4. Retorna dados               │
   │◄────────────────┤ 5. Exibe dados   │                │                │
   │                 │                  │                │                │
   │ 6. Preenche form│                  │                │                │
   ├────────────────►│                  │                │                │
   │                 │                  │                │                │
   │ 7. Seleciona foto                  │                │                │
   ├────────────────►│                  │                │                │
   │                 │ 8. Preview OK    │                │                │
   │◄────────────────┤                  │                │                │
   │                 │                  │                │                │
   │ 9. Clica Enviar │                  │                │                │
   ├────────────────►│                  │                │                │
   │                 │ 10. Upload foto  │                │                │
   │                 ├─────────────────►│                │                │
   │                 │                  │ 11. Salva      │                │
   │                 │                  ├───────────────►│                │
   │                 │                  │                │ comprovantes/  │
   │                 │                  │                │ 2025-12-01/    │
   │                 │                  │                │ A_*.jpg        │
   │                 │                  │◄───────────────┤                │
   │                 │◄─────────────────┤ 12. Retorna URL│                │
   │                 │                  │                │                │
   │                 │ 13. Salva entrega│                │                │
   │                 ├─────────────────►│                │                │
   │                 │                  │ 14. INSERT     │                │
   │                 │                  ├───────────────────────────────►│
   │                 │                  │                │   INSERT INTO  │
   │                 │                  │                │   delivery_out │
   │                 │                  │                │   VALUES (...)  │
   │                 │                  │◄───────────────────────────────┤
   │                 │◄─────────────────┤ 15. Confirma   │                │
   │◄────────────────┤ 16. Sucesso!     │                │                │
   │                 │                  │                │                │
```

### **Dados Trafegados em Cada Etapa**

#### **Etapa 2-5: Validação da NF**
```javascript
// REQUEST
GET /rest/v1/nfs_storage?numero_nfe=eq.A&select=*

// RESPONSE
{
  "numero_nfe": "A",
  "cliente": "João Silva Santos",
  "cpf_cnpj": "123456",
  "cep": 1310100,
  "produto": "Samsung Galaxy S23 128GB Preto",
  "status_pedido": "OK"
}
```

#### **Etapa 10-12: Upload do Comprovante**
```javascript
// REQUEST
POST /storage/v1/object/comprovantes_entregas/comprovantes/2025-12-01/A_1733068800000.jpg
Content-Type: image/jpeg
Body: [BINARY DATA]

// RESPONSE
{
  "Key": "comprovantes_entregas/comprovantes/2025-12-01/A_1733068800000.jpg",
  "publicUrl": "https://pnbsjmwatuhyijsuyjqe.supabase.co/storage/v1/object/public/comprovantes_entregas/comprovantes/2025-12-01/A_1733068800000.jpg"
}
```

#### **Etapa 13-15: Salvar Entrega**
```javascript
// REQUEST
POST /rest/v1/delivery_output
{
  "numero_nfe": "A",
  "tipo_entrega": "transportadora",
  "empresa_logistica": "Loggi",
  "nome_cliente": null,
  "cpf_cliente": null,
  "comprovante_url": "https://.../A_1733068800000.jpg",
  "data_hora_registro": "2025-12-01T14:30:00Z",
  "created_at": "2025-12-01T14:30:00Z"
}

// RESPONSE
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero_nfe": "A",
  "tipo_entrega": "transportadora",
  "empresa_logistica": "Loggi",
  "comprovante_url": "https://.../A_1733068800000.jpg",
  "data_hora_registro": "2025-12-01T14:30:00Z",
  "status_entrega": "entregue",
  "created_at": "2025-12-01T14:30:00Z"
}
```

---

## Backoffice (Área Administrativa)

### **Funcionalidades**

1. **Listagem de Entregas**
   - Busca todas as entregas de `delivery_output`
   - Exibe em tabela com paginação

2. **Filtros**
   - Por número de NF
   - Por status de entrega
   - Por empresa logística
   - Por data

3. **Visualização de Comprovantes**
   - Clica no botão "Ver Comprovante"
   - Abre modal com imagem do bucket
   - Permite download da foto

4. **Atualização de Status**
   - Mudar status: pendente → entregue → devolvido
   - `UPDATE delivery_output SET status_entrega = 'novo_status' WHERE id = 'uuid'`

### **Fluxo no Backoffice**

```javascript
// Backoffice-Validador/supabase.js

// 1. Buscar todas as entregas
async function fetchDeliveries() {
    const { data } = await supabase
        .from('delivery_output')
        .select('*')
        .order('created_at', { ascending: false });
    return data;
}

// 2. Filtrar entregas
async function fetchDeliveriesFiltered(filters) {
    let query = supabase.from('delivery_output').select('*');
    
    if (filters.numero_nfe) {
        query = query.ilike('numero_nfe', `%${filters.numero_nfe}%`);
    }
    if (filters.status_entrega) {
        query = query.eq('status_entrega', filters.status_entrega);
    }
    
    const { data } = await query.order('created_at', { ascending: false });
    return data;
}

// 3. Atualizar status
async function updateDeliveryStatus(id, newStatus) {
    const { data } = await supabase
        .from('delivery_output')
        .update({ status_entrega: newStatus })
        .eq('id', id)
        .select();
    return data[0];
}
```

---

## Segurança e Permissões

### **Autenticação**
- **Anon Key** (JWT público): Usado pelo frontend
- **Service Role Key** (admin): Usado apenas em backend seguro
- Permissões configuradas via RLS (Row Level Security)

### **RLS (Row Level Security)**

#### **Estado Atual (Desenvolvimento)**
```sql
-- RLS desabilitado para testes
ALTER TABLE nfs_storage DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_output DISABLE ROW LEVEL SECURITY;
```

#### **Produção (Recomendado)**
```sql
-- Habilitar RLS
ALTER TABLE nfs_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_output ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer um pode LER nfs_storage
CREATE POLICY "public_read_nfs" ON nfs_storage
    FOR SELECT USING (true);

-- Policy: Qualquer um pode ESCREVER em delivery_output
CREATE POLICY "public_insert_delivery" ON delivery_output
    FOR INSERT WITH CHECK (true);

-- Policy: Apenas autenticados podem ATUALIZAR delivery_output
CREATE POLICY "auth_update_delivery" ON delivery_output
    FOR UPDATE USING (auth.role() = 'authenticated');
```

### **Bucket Permissions**
```sql
-- Bucket público (leitura/escrita)
UPDATE storage.buckets
SET public = true
WHERE id = 'comprovantes_entregas';

-- Policies aplicadas (ver seção anterior)
```

---

## Estatísticas e Métricas

### **Dados Disponíveis para Análise**

1. **Por NF**
   - Total de entregas por nota fiscal
   - Status de cada entrega
   - Tempo entre pedido e entrega

2. **Por Transportadora**
   - Ranking de entregas por empresa
   - Taxa de sucesso (entregue vs devolvido)

3. **Por Data**
   - Volume de entregas diárias
   - Picos de horário

4. **Por Status**
   - Pendentes, entregues, devolvidos
   - Taxa de conversão

### **Queries Úteis**

```sql
-- Total de entregas por status
SELECT status_entrega, COUNT(*) 
FROM delivery_output 
GROUP BY status_entrega;

-- Entregas por transportadora
SELECT empresa_logistica, COUNT(*) 
FROM delivery_output 
WHERE tipo_entrega = 'transportadora'
GROUP BY empresa_logistica 
ORDER BY COUNT(*) DESC;

-- Entregas nos últimos 7 dias
SELECT DATE(data_hora_registro), COUNT(*) 
FROM delivery_output 
WHERE data_hora_registro >= NOW() - INTERVAL '7 days'
GROUP BY DATE(data_hora_registro)
ORDER BY DATE(data_hora_registro);

-- Buscar NF com entrega + comprovante
SELECT 
    d.numero_nfe,
    n.cliente,
    n.produto,
    d.comprovante_url,
    d.data_hora_registro
FROM delivery_output d
LEFT JOIN nfs_storage n ON d.numero_nfe = n.numero_nfe
WHERE d.numero_nfe = 'A';
```

---

## Deploy e Ambiente

### **Frontend (Vercel)**
- **URL**: `https://validador-entrega.vercel.app`
- **Deploy Automático**: Push no GitHub → build + deploy
- **Variáveis de Ambiente**:
  ```
  VITE_SUPABASE_URL=https://pnbsjmwatuhyijsuyjqe.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  ```

### **Backend (Supabase)**
- **URL**: `https://pnbsjmwatuhyijsuyjqe.supabase.co`
- **Região**: US East (padrão)
- **PostgreSQL**: Versão 15.x
- **Storage**: S3-compatível

### **Scripts de Inicialização**

```bash
# 1. Criar estrutura das tabelas
psql -f scripts/add_columns_nfs_storage.sql
psql -f scripts/add_columns_delivery_output.sql

# 2. Popular com dados de teste
psql -f scripts/populate_nfs_storage.sql

# 3. Configurar permissões
psql -f scripts/force_disable_rls.sql
psql -f scripts/storage_policies.sql
```

---

### **Resumão**

1. **Stack**:
   - Frontend: HTML + JavaScript (Vite) na Vercel
   - Backend: Supabase (PostgreSQL + Storage)
   - Autenticação: JWT anon key

2. **Fluxo Principal**:
   ```
   Usuário digita NF → Valida em nfs_storage → 
   Preenche form → Upload foto para bucket → 
   Salva em delivery_output → Sucesso
   ```

3. **Tabelas**:
   - `nfs_storage`: Fonte de dados (READ-ONLY para app)
   - `delivery_output`: Destino de entregas (WRITE)

4. **Bucket**:
   - Nome: `comprovantes_entregas`
   - Path: `comprovantes/{data}/{nf}_{timestamp}.jpg`
   - Acesso: Público (leitura/escrita)

5. **Funções Principais**:
   - `searchNF()`: Busca NF
   - `uploadProof()`: Upload de foto
   - `saveDelivery()`: Salva entrega

6. **URLs Importantes**:
   - Frontend: `https://validador-entrega.vercel.app`
   - Supabase Dashboard: `https://supabase.com/dashboard`
   - Bucket: `https://pnbsjmwatuhyijsuyjqe.supabase.co/storage/v1/object/public/comprovantes_entregas/`

7. **Como Testar Localmente**:
   ```bash
   npm install
   npm run dev
   # Acesse: http://localhost:5173
   # Use NF: "A", "B", "C", etc (ver scripts/populate_nfs_storage.sql)
   ```
---

## Referências

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---
**Arquitetura**: Serverless (Supabase + Vercel)  
**Última Atualização**: 1 de dezembro de 2025

---
