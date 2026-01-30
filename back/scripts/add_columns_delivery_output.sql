-- Script SQL para adicionar colunas à tabela delivery_output
-- Data: 25 de novembro de 2025
-- Descrição: Adiciona as colunas necessárias para persistir dados de entrega

BEGIN;

-- Adicionar coluna numero_nfe (chave estrangeira para nfs_storage)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS numero_nfe VARCHAR(50);

-- Adicionar coluna tipo_entrega (tipo de entrega: Balcão, Residencial, etc)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS tipo_entrega VARCHAR(50);

-- Adicionar coluna empresa_logistica (nome da empresa de logística)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS empresa_logistica VARCHAR(100);

-- Adicionar coluna nome_cliente (nome do cliente que recebeu)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS nome_cliente VARCHAR(150);

-- Adicionar coluna cpf_cliente (CPF do cliente que recebeu)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS cpf_cliente VARCHAR(20);

-- Adicionar coluna comprovante_url (URL do comprovante/foto de entrega)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS comprovante_url TEXT;

-- Adicionar coluna data_hora_registro (data/hora do registro de entrega)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS data_hora_registro TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna data_entrega (data/hora da entrega efetiva)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS data_entrega TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna status_entrega (status: pendente, entregue, devolvido, etc)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS status_entrega VARCHAR(50);

-- Adicionar coluna observacoes (observações adicionais sobre a entrega)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Adicionar coluna assinatura_cliente (comprovante de assinatura em base64 ou URL)
ALTER TABLE delivery_output
ADD COLUMN IF NOT EXISTS assinatura_cliente TEXT;

-- Criar índice para busca rápida por numero_nfe
CREATE INDEX IF NOT EXISTS idx_delivery_output_numero_nfe ON delivery_output(numero_nfe);

-- Criar índice para busca rápida por status_entrega
CREATE INDEX IF NOT EXISTS idx_delivery_output_status ON delivery_output(status_entrega);

-- Criar índice para busca por data_hora_registro
CREATE INDEX IF NOT EXISTS idx_delivery_output_data_registro ON delivery_output(data_hora_registro);

COMMIT;

-- Verificar se as colunas foram adicionadas com sucesso
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='delivery_output' ORDER BY ordinal_position;
