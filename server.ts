import express from 'express';
import path from 'path';
import { apiRouter } from './server/api.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API endpoints
app.use('/api', apiRouter);

// Serve static frontend assets
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SYSJEGER V2.0 Server running on port ${PORT}`);
});
