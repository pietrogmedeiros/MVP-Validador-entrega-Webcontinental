import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getSupabase } from '../services/supabaseClient.js';
import formidable from 'formidable';

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

  if (!supabase) {
    const all = [...mockValidations.values()];
    const result = codigoEntrega ? all.filter(v => v.codigoEntrega === codigoEntrega) : all;
    return res.json(result);
  }

  try {
    // Consulta tabela nfs_storage filtrando por numero_nfe
    let query = supabase
      .from('nfs_storage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (codigoEntrega) {
      query = query.eq('numero_nfe', codigoEntrega);
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((row) => ({
      id: row.id,
      codigoEntrega: row.numero_nfe,
      status: row.status_entrega || row.status_pedido || 'pendente',
      metadados: {
        cpf: row.cpf_cnpj,
        cep: row.cep,
        produto: row.produto,
        cliente: row.cliente,
        transportadora: row.transportadora,
        pedido_mkp: row.pedido_mkp,
        canal_any: row.canal_any,
      },
      createdAt: row.created_at,
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
