import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import healthRouter from './routes/health.js';
import validationsRouter from './routes/validations.js';
import uploadsRouter from './routes/uploads.js';
import nfsRouter from './routes/nfs.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use('/api/validations', validationsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/nfs', nfsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`🚀 Express server running on port ${port}`);
});
