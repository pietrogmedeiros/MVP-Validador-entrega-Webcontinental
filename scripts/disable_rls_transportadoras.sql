-- Desabilitar RLS na tabela transportadoras_ativas
ALTER TABLE transportadoras_ativas DISABLE ROW LEVEL SECURITY;

-- Criar política pública para SELECT (leitura)
CREATE POLICY "Allow public read on transportadoras_ativas"
ON transportadoras_ativas
FOR SELECT
USING (true);

-- Criar política pública para INSERT (escrita)
CREATE POLICY "Allow public insert on transportadoras_ativas"
ON transportadoras_ativas
FOR INSERT
WITH CHECK (true);

-- Criar política pública para UPDATE
CREATE POLICY "Allow public update on transportadoras_ativas"
ON transportadoras_ativas
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Criar política pública para DELETE
CREATE POLICY "Allow public delete on transportadoras_ativas"
ON transportadoras_ativas
FOR DELETE
USING (true);

-- Verificar dados
SELECT COUNT(*) as total_transportadoras FROM transportadoras_ativas;
SELECT * FROM transportadoras_ativas LIMIT 20;
