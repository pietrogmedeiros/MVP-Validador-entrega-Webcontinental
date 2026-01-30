-- Script para criar políticas de acesso público no bucket comprovantes_entregas

-- Policy 1: Permitir INSERT (upload) público
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'comprovantes_entregas');

-- Policy 2: Permitir SELECT (read) público
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'comprovantes_entregas');

-- Policy 3: Permitir DELETE público (opcional, para deletar arquivos)
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'comprovantes_entregas');

-- Policy 4: Permitir UPDATE público (opcional, para atualizar metadados)
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'comprovantes_entregas');
