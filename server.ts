import express from 'express';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Security Headers, relaxed for iframe preview support
  app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false
  }));
  app.use(express.json());

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TITANIC OS Hybrid API Active' });
  });

  // Future Route: Sync offline data to central server
  app.post('/api/sync', (req, res) => {
    // In the future: Rate limiting and payload validation with Zod
    res.json({ status: 'success', syncedAt: new Date().toISOString() });
  });

  // --- Vite Middleware (Development / Frontend Fallback) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const APP_PORT = parseInt(process.env.PORT || '3000', 10);

  const server = app.listen(APP_PORT, '0.0.0.0', () => {
    console.log(`[System Core] API & App Server running on http://localhost:${APP_PORT}`);
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.warn(`[System Core] Port ${APP_PORT} busy, trying ${APP_PORT + 1}...`);
      server.listen(APP_PORT + 1);
    }
  });
}

startServer();
