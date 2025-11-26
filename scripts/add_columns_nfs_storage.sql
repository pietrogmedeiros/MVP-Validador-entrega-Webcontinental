-- Script SQL para adicionar colunas na tabela nfs_storage
-- Data: 25 de novembro de 2025
-- Descrição: Adiciona campos de informações de pedido, cliente, produto, entrega e marketplace

BEGIN;

ALTER TABLE nfs_storage
ADD COLUMN IF NOT EXISTS id_anymarket varchar(14),
ADD COLUMN IF NOT EXISTS cpf_cnpj varchar(6),
ADD COLUMN IF NOT EXISTS doc_cliente varchar(14),
ADD COLUMN IF NOT EXISTS cliente varchar(50),
ADD COLUMN IF NOT EXISTS telefone bigint,
ADD COLUMN IF NOT EXISTS email varchar(50),
ADD COLUMN IF NOT EXISTS pedido_mkp varchar(50),
ADD COLUMN IF NOT EXISTS data_pedido timestamp,
ADD COLUMN IF NOT EXISTS canal_any varchar(50),
ADD COLUMN IF NOT EXISTS municipio varchar(50),
ADD COLUMN IF NOT EXISTS estado varchar(50),
ADD COLUMN IF NOT EXISTS cep integer,
ADD COLUMN IF NOT EXISTS endereco varchar(100),
ADD COLUMN IF NOT EXISTS numero bigint,
ADD COLUMN IF NOT EXISTS complemento varchar(100),
ADD COLUMN IF NOT EXISTS bairro varchar(50),
ADD COLUMN IF NOT EXISTS forma_entrega varchar(255),
ADD COLUMN IF NOT EXISTS frete_lojista numeric(20,6),
ADD COLUMN IF NOT EXISTS status_anymarket varchar(15),
ADD COLUMN IF NOT EXISTS data_pagamento timestamp,
ADD COLUMN IF NOT EXISTS frete numeric(20,6),
ADD COLUMN IF NOT EXISTS desconto numeric(20,6),
ADD COLUMN IF NOT EXISTS total_produtos numeric(20,6),
ADD COLUMN IF NOT EXISTS total_pedido numeric(20,6),
ADD COLUMN IF NOT EXISTS forma_pagamento varchar(150),
ADD COLUMN IF NOT EXISTS produto varchar(255),
ADD COLUMN IF NOT EXISTS quantidade integer,
ADD COLUMN IF NOT EXISTS valor_unitario numeric(20,6),
ADD COLUMN IF NOT EXISTS sku_produto varchar(35),
ADD COLUMN IF NOT EXISTS ean_produto bigint,
ADD COLUMN IF NOT EXISTS conta varchar(50),
ADD COLUMN IF NOT EXISTS numero_nfe varchar(9),
ADD COLUMN IF NOT EXISTS numero_serie_nfe varchar(4),
ADD COLUMN IF NOT EXISTS chave_acesso_nfe varchar(44),
ADD COLUMN IF NOT EXISTS cfop varchar(4),
ADD COLUMN IF NOT EXISTS data_emissao_nfe timestamp,
ADD COLUMN IF NOT EXISTS transportadora varchar(50),
ADD COLUMN IF NOT EXISTS codigo_rastreio varchar(100),
ADD COLUMN IF NOT EXISTS data_ocorrencia timestamp,
ADD COLUMN IF NOT EXISTS quem_retira varchar(10),
ADD COLUMN IF NOT EXISTS codigo_loja_marketplace varchar(10),
ADD COLUMN IF NOT EXISTS nome_loja varchar(10),
ADD COLUMN IF NOT EXISTS cod_marketplace varchar(50),
ADD COLUMN IF NOT EXISTS status_pedido varchar(100),
ADD COLUMN IF NOT EXISTS entrega_esperada timestamp,
ADD COLUMN IF NOT EXISTS previsao_esperada timestamp,
ADD COLUMN IF NOT EXISTS url_rastreio varchar(100),
ADD COLUMN IF NOT EXISTS data_entrega timestamp,
ADD COLUMN IF NOT EXISTS entrega_transportadora timestamp,
ADD COLUMN IF NOT EXISTS inscricao_estadual varchar(14),
ADD COLUMN IF NOT EXISTS motivo_cancelamento varchar(10),
ADD COLUMN IF NOT EXISTS bandeira varchar(30),
ADD COLUMN IF NOT EXISTS nome_oficial_loja varchar(25),
ADD COLUMN IF NOT EXISTS origem_cancelamento varchar(15),
ADD COLUMN IF NOT EXISTS data_cancelamento timestamp,
ADD COLUMN IF NOT EXISTS quantidade_parcelas varchar(30),
ADD COLUMN IF NOT EXISTS tipo_listagem varchar(10),
ADD COLUMN IF NOT EXISTS cod_entrega varchar(15),
ADD COLUMN IF NOT EXISTS cod_plataforma varchar(6),
ADD COLUMN IF NOT EXISTS numero_parceiro varchar(9),
ADD COLUMN IF NOT EXISTS frete_gratis varchar(4),
ADD COLUMN IF NOT EXISTS sku_kit varchar(35),
ADD COLUMN IF NOT EXISTS e_kit varchar(4),
ADD COLUMN IF NOT EXISTS fullfiment varchar(11),
ADD COLUMN IF NOT EXISTS desconto_produto numeric(20,6),
ADD COLUMN IF NOT EXISTS sku_produto_marketplace varchar(35),
ADD COLUMN IF NOT EXISTS loja varchar(10),
ADD COLUMN IF NOT EXISTS canal varchar(10),
ADD COLUMN IF NOT EXISTS id_pagamento_mkp varchar(100),
ADD COLUMN IF NOT EXISTS juros numeric(20,6),
ADD COLUMN IF NOT EXISTS desconto_mkp_metadata numeric(20,6),
ADD COLUMN IF NOT EXISTS produto_catalogo varchar(4),
ADD COLUMN IF NOT EXISTS sku_originou_catalogo varchar(35),
ADD COLUMN IF NOT EXISTS alerta_importacao varchar(15),
ADD COLUMN IF NOT EXISTS risco_cancelamento varchar(25),
ADD COLUMN IF NOT EXISTS status_entrega varchar(25),
ADD COLUMN IF NOT EXISTS status_entrega_mkp varchar(15),
ADD COLUMN IF NOT EXISTS substatus_entrega_mkp varchar(25),
ADD COLUMN IF NOT EXISTS taxas_mkp numeric(20,6),
ADD COLUMN IF NOT EXISTS taxas_meio_pagamento numeric(20,6),
ADD COLUMN IF NOT EXISTS cod_pedido_carrinho varchar(35),
ADD COLUMN IF NOT EXISTS condicao_produto varchar(20),
ADD COLUMN IF NOT EXISTS tipo_devolucao varchar(10),
ADD COLUMN IF NOT EXISTS data_importacao timestamp,
ADD COLUMN IF NOT EXISTS abreviacao_marketplace varchar(6),
ADD COLUMN IF NOT EXISTS uf varchar(2),
ADD COLUMN IF NOT EXISTS vertical varchar(2),
ADD COLUMN IF NOT EXISTS data_pedido_simples date,
ADD COLUMN IF NOT EXISTS data_atualizado_dl timestamp;

-- Criar índices para melhor performance nas buscas mais comuns
CREATE INDEX IF NOT EXISTS idx_nfs_storage_numero_serie_nfe ON nfs_storage(numero_serie_nfe);
CREATE INDEX IF NOT EXISTS idx_nfs_storage_chave_acesso ON nfs_storage(chave_acesso_nfe);
CREATE INDEX IF NOT EXISTS idx_nfs_storage_pedido_mkp ON nfs_storage(pedido_mkp);
CREATE INDEX IF NOT EXISTS idx_nfs_storage_codigo_rastreio ON nfs_storage(codigo_rastreio);
CREATE INDEX IF NOT EXISTS idx_nfs_storage_status_pedido ON nfs_storage(status_pedido);
CREATE INDEX IF NOT EXISTS idx_nfs_storage_data_pedido ON nfs_storage(data_pedido);
CREATE INDEX IF NOT EXISTS idx_nfs_storage_cliente ON nfs_storage(cliente);

COMMIT;

-- Verificar se as colunas foram adicionadas com sucesso
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'nfs_storage' ORDER BY ordinal_position;
