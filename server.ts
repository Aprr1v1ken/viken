import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { apiRouter } from './server/api.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API endpoints
app.use('/api', apiRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'Rute API tidak ditemukan' });
});

// Serve static frontend assets
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req, res) => {
    res
      .status(503)
      .type('text/plain; charset=utf-8')
      .send('Frontend belum dibangun. Jalankan: npm run build, lalu mulai ulang server (npm start).');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SYSJEGER V2.0 Server running on port ${PORT}`);
});
