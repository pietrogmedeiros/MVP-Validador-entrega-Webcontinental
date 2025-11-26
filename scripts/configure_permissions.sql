-- Script SQL para configurar permissões no Supabase
-- Data: 25 de novembro de 2025
-- Descrição: Remove RLS ou adiciona políticas públicas para desenvolvimento

BEGIN;

-- ========================================
-- 1. DESABILITAR RLS NAS TABELAS
-- ========================================

-- Desabilitar RLS na tabela nfs_storage
ALTER TABLE nfs_storage DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS na tabela delivery_output
ALTER TABLE delivery_output DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. CONFIGURAR BUCKET DE STORAGE
-- ========================================

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes_entregas', 'comprovantes_entregas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

COMMIT;

-- ========================================
-- 3. VERIFICAR CONFIGURAÇÕES
-- ========================================

-- Verificar RLS nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('nfs_storage', 'delivery_output');

-- Verificar bucket
SELECT id, name, public FROM storage.buckets WHERE id = 'comprovantes_entregas';
