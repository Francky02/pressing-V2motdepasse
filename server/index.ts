import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes.js';
import { companyRouter } from './routes/company.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { publicRouter } from './routes/public.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Allow up to 10mb for logo base64 payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent browser from caching authenticated API responses (crucial for clean logout)
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Relancio Backend API', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/public', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/company', companyRouter);
app.use('/api/entreprise', companyRouter);
app.use('/api/admin', adminRouter);

// Global Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`Relancio API Server running on port ${PORT}`);
});
