import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getSupabase } from '../services/supabaseClient.js';
import formidable from 'formidable';
import fs from 'fs';

// Upload para Supabase Storage (bucket: comprovantes_entregas)
const uploadToSupabase = async (supabase, file) => {
  const bucket = 'comprovantes_entregas';
  const ext = file.originalFilename?.split('.').pop() || 'bin';
  const path = `proofs/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const fileBuffer = await fs.promises.readFile(file.filepath);
  const { error } = await supabase.storage.from(bucket).upload(path, fileBuffer, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.mimetype || 'application/octet-stream',
  });
  if (error) throw error;
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl.publicUrl;
};

const router = Router();

const mockValidations = new Map();

// Lista geral com Supabase (fallback mock)
router.get('/', async (req, res) => {
  const { codigoEntrega } = req.query;
  const supabase = getSupabase();

  console.log('🔍 GET /api/validations - Supabase instance:', supabase ? 'CONNECTED' : 'MOCK MODE');

  if (!supabase) {
    const all = [...mockValidations.values()];
    const result = codigoEntrega ? all.filter(v => v.codigoEntrega === codigoEntrega) : all;
    console.log('⚠️ Returning MOCK data:', result.length, 'records');
    return res.json(result);
  }

  try {
    // Consulta tabela delivery_output
    let query = supabase
      .from('delivery_output')
      .select('*')
      .order('created_at', { ascending: false });

    if (codigoEntrega) {
      query = query.eq('numero_nfe', codigoEntrega);
    }

    const { data, error } = await query;
    if (error) throw error;

    console.log(`📊 Found ${data?.length || 0} records in delivery_output`);

    const mapped = (data || []).map((row) => ({
      id: row.id,
      codigoEntrega: row.numero_nfe,
      status: row.status_entrega || 'pendente',
      metadados: {
        clientName: row.nome_cliente,
        clientCpf: row.cpf_cliente,
        produto: row.tipo_entrega,
        valor: null,
        proofUrl: row.comprovante_url,
        logisticsCompany: row.empresa_logistica,
        observacoes: row.observacoes,
      },
      createdAt: row.created_at,
      dataEntrega: row.data_entrega,
    }));

    return res.json(mapped);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Falha ao consultar Supabase' });
  }
});

router.get('/:id', (req, res) => {
  const item = mockValidations.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Validação não encontrada' });
  res.json(item);
});

// Rota para download de comprovante
router.get('/download/:id', async (req, res) => {
  const supabase = getSupabase();
  
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase não configurado' });
  }

  try {
    const { id } = req.params;
    
    // Buscar registro na tabela delivery_output
    const { data, error } = await supabase
      .from('delivery_output')
      .select('comprovante_url, numero_nfe')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data || !data.comprovante_url) {
      return res.status(404).json({ error: 'Comprovante não encontrado' });
    }

    // Extrair path do bucket da URL pública
    const urlParts = data.comprovante_url.split('/storage/v1/object/public/comprovantes_entregas/');
    if (urlParts.length < 2) {
      return res.status(500).json({ error: 'URL inválida' });
    }
    const filePath = urlParts[1];

    // Fazer download do arquivo do Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('comprovantes_entregas')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Converter blob para buffer e enviar como download
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const filename = `comprovante_${data.numero_nfe}.jpg`;
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Falha ao buscar comprovante' });
  }
});

router.post('/', (req, res) => {
  const supabase = getSupabase();
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: 'Falha ao processar formulário' });
    }

    const codigoEntrega = fields.codigoEntrega?.toString();
    if (!codigoEntrega) return res.status(400).json({ error: 'codigoEntrega é obrigatório' });

    try {
      const proofFile = files.proof;
      let proofUrl = null;
      if (proofFile) {
        const file = Array.isArray(proofFile) ? proofFile[0] : proofFile;
        if (!supabase) throw new Error('Supabase não configurado para upload');
        proofUrl = await uploadToSupabase(supabase, file);
      }

      const payload = {
        numero_nfe: codigoEntrega,
        tipo_entrega: fields.deliveryType?.toString() || null,
        empresa_logistica: fields.logisticsCompany?.toString() || null,
        nome_cliente: fields.clientName?.toString() || null,
        cpf_cliente: fields.clientCpf?.toString() || null,
        comprovante_url: proofUrl,
        status_entrega: 'recebido',
        data_hora_registro: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('delivery_output').insert(payload).select().single();
      if (error) throw error;
      return res.status(201).json({
        id: data.id,
        codigoEntrega: data.numero_nfe,
        status: data.status_entrega,
        metadados: {
          tipo_entrega: data.tipo_entrega,
          empresa_logistica: data.empresa_logistica,
          nome_cliente: data.nome_cliente,
          cpf_cliente: data.cpf_cliente,
          comprovante_url: data.comprovante_url,
        },
        createdAt: data.created_at,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Falha ao registrar entrega' });
    }
  });
});

export default router;
