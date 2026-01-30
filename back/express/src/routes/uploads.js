import { Router } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' });
  const url = `https://mock-storage.local/${uuid()}-${req.file.originalname}`;
  res.status(201).json({ url });
});

export default router;
