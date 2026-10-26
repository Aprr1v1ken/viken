import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import express from 'express';
import { apiRouter } from './server/api.ts';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          const app = express();
          app.use(express.json({ limit: '10mb' }));
          app.use(express.urlencoded({ extended: true }));
          app.use('/api', apiRouter);
          // Sajikan foto jemaat yang diunggah saat mode pengembangan juga.
          app.use('/uploads', express.static(path.resolve(import.meta.dirname, 'uploads')));
          app.use('/uploads', (_req: any, res: any) => { res.statusCode = 404; res.end('Berkas tidak ditemukan'); });
          server.middlewares.use(app);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      // Izinkan diakses lewat host pratinjau/tunnel (mis. *.e2b.app) saat pengembangan.
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
