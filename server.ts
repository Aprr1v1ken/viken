import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { apiRouter } from './server/api.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // PENTING: jangan kirim "X-Frame-Options: SAMEORIGIN" secara bawaan —
  // situs harus dapat ditampilkan di dalam iframe pratinjau (mis. Arena Live
  // Preview), kalau tidak halaman hanya tampil putih kosong.
  // Untuk membatasi penyematan iframe pada deployment resmi, atur variabel
  // lingkungan FRAME_ANCESTORS, contoh: FRAME_ANCESTORS="'self'"
  const frameAncestors = process.env.FRAME_ANCESTORS?.trim();
  if (frameAncestors) {
    res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);
  }
  next();
});

// Log akses ringkas (membantu diagnosis dari log proses). Nonaktifkan dengan
// ACCESS_LOG=off. Berkas statis /assets tidak dicatat agar log tidak bising.
if (process.env.ACCESS_LOG !== 'off') {
  app.use((req, res, next) => {
    if (!req.path.startsWith('/assets/')) {
      res.on('finish', () => {
        console.log(`[SYSJEGER] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
      });
    }
    next();
  });
}

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
