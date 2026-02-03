# Rotas API - Validador de Entrega

Base URL: `http://localhost:3000`

---

## 🔍 **Validação de Nota Fiscal**

### `GET /api/validations`

Busca informações de uma nota fiscal no banco de dados.

**Query Parameters:**
- `codigoEntrega` (string, obrigatório) - Número da nota fiscal

**Exemplo de Requisição:**
```bash
GET http://localhost:3000/api/validations?codigoEntrega=123456789
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "uuid",
    "codigoEntrega": "123456789",
    "status": "pendente",
    "metadados": {
      "cpf": "12345678900",
      "cep": "12345-678",
      "produto": "Produto XYZ",
      "cliente": "Nome do Cliente",
      "transportadora": "Transportadora ABC",
      "pedido_mkp": "PED123",
      "canal_any": "Online"
    },
    "createdAt": "2026-02-03T15:30:00Z"
  }
]
```

**Resposta quando não encontrada:**
```json
[]
```

---

## 📦 **Registro de Entrega**

### `POST /api/validations`

Registra uma nova entrega com comprovante fotográfico.

**Content-Type:** `multipart/form-data`

**Body Parameters:**
- `codigoEntrega` (string, obrigatório) - Número da nota fiscal
- `deliveryType` (string, obrigatório) - Tipo de entrega: "transportadora" | "cliente"
- `logisticsCompany` (string, condicional) - Nome da empresa de logística (obrigatório se deliveryType = "transportadora")
- `clientName` (string, condicional) - Nome completo do cliente (obrigatório se deliveryType = "cliente")
- `clientCpf` (string, condicional) - CPF do cliente (obrigatório se deliveryType = "cliente")
- `proof` (file, obrigatório) - Foto do comprovante de entrega (imagem)

**Exemplo de Requisição:**
```javascript
const formData = new FormData()
formData.append('codigoEntrega', '123456789')
formData.append('deliveryType', 'transportadora')
formData.append('logisticsCompany', 'Jadlog')
formData.append('proof', fileObject)

fetch('http://localhost:3000/api/validations', {
  method: 'POST',
  body: formData
})
```

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid",
  "codigoEntrega": "123456789",
  "status": "recebido",
  "metadados": {
    "tipo_entrega": "transportadora",
    "empresa_logistica": "Jadlog",
    "nome_cliente": null,
    "cpf_cliente": null,
    "comprovante_url": "https://supabase.co/storage/v1/object/public/comprovantes_entregas/proofs/..."
  },
  "createdAt": "2026-02-03T17:01:46.503907+00"
}
```

**Campos no Banco (delivery_output):**
- `numero_nfe` - Número da nota fiscal
- `tipo_entrega` - Tipo de entrega
- `empresa_logistica` - Empresa de logística
- `nome_cliente` - Nome do cliente
- `cpf_cliente` - CPF do cliente
- `comprovante_url` - URL da foto no Supabase Storage
- `status_entrega` - Status (sempre "recebido" no registro inicial)
- `data_hora_registro` - Data/hora do registro

---

## 📤 **Upload de Arquivo**

### `POST /api/uploads`

Faz upload de um arquivo para o Supabase Storage.

**Content-Type:** `multipart/form-data`

**Body Parameters:**
- `file` (file, obrigatório) - Arquivo a ser enviado

**Exemplo de Requisição:**
```javascript
const formData = new FormData()
formData.append('file', fileObject)

fetch('http://localhost:3000/api/uploads', {
  method: 'POST',
  body: formData
})
```

**Resposta de Sucesso (201):**
```json
{
  "url": "https://supabase.co/storage/v1/object/public/comprovantes_entregas/proofs/..."
}
```

---

## 🏥 **Health Check**

### `GET /health`

Verifica se a API está funcionando.

**Resposta (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T17:00:00Z"
}
```

---

## ⚙️ **Configuração**

### Variáveis de Ambiente (.env)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Servidor
PORT=3000
LOG_LEVEL=info
```

### CORS
CORS está habilitado para todas as origens em desenvolvimento.

### Storage
- **Bucket:** `comprovantes_entregas`
- **Pasta:** `proofs/`
- **Formato dos arquivos:** `{timestamp}-{random}.{ext}`

---

## 🚀 **Como Executar**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

---

## 📊 **Estrutura do Banco de Dados**

### Tabela: `nfs_storage`
Armazena informações das notas fiscais para validação.

### Tabela: `delivery_output`
Armazena os registros de entregas realizadas.

### Bucket: `comprovantes_entregas`
Armazena as fotos dos comprovantes de entrega.
