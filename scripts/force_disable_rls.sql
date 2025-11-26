-- Script SQL para FORÇAR desabilitar RLS e permitir acesso público
-- Execute este script no Supabase SQL Editor

-- 1. Forçar desabilitar RLS nas tabelas
ALTER TABLE IF EXISTS nfs_storage DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_output DISABLE ROW LEVEL SECURITY;

-- 2. Verificar status do RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('nfs_storage', 'delivery_output')
ORDER BY tablename;

-- 3. Deletar políticas existentes nas tabelas
DROP POLICY IF EXISTS "Enable read access for all users" ON nfs_storage;
DROP POLICY IF EXISTS "Enable read access for all users" ON delivery_output;
DROP POLICY IF EXISTS "Enable insert for all users" ON delivery_output;
DROP POLICY IF EXISTS "nfs_storage_public_access" ON nfs_storage;
DROP POLICY IF EXISTS "delivery_output_public_insert" ON delivery_output;
DROP POLICY IF EXISTS "delivery_output_public_select" ON delivery_output;

-- 4. Re-habilitar RLS e adicionar políticas permissivas
ALTER TABLE nfs_storage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nfs_storage_public_access" ON nfs_storage FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE delivery_output ENABLE ROW LEVEL SECURITY;
CREATE POLICY "delivery_output_public_insert" ON delivery_output FOR INSERT WITH CHECK (true);
CREATE POLICY "delivery_output_public_select" ON delivery_output FOR SELECT USING (true);
CREATE POLICY "delivery_output_public_update" ON delivery_output FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Verificar bucket storage
SELECT id, name, public FROM storage.buckets WHERE id = 'comprovantes_entregas';

-- 6. Se bucket não existir, criar
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes_entregas', 'comprovantes_entregas', true)
ON CONFLICT (id) DO UPDATE SET public = true;
