import { Router } from 'express';

const router = Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, numero: `NF-${id}`, status: 'mock', data: new Date().toISOString() });
});

router.get('/', (req, res) => {
  const { cnpj, periodo } = req.query;
  if (!cnpj) return res.status(400).json({ error: 'cnpj é obrigatório' });
  res.json({ cnpj, periodo: periodo || 'nao-informado', itens: [] });
});

export default router;
