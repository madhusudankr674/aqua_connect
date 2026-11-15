import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const UPLOAD_DIR = path.join('/tmp', 'aqua_connect_uploads');
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

async function createServer() {
  const app = express();

  app.use(express.json({ limit: '8mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'aqua-connect',
      timestamp: new Date().toISOString(),
    });
  });

  // Fallback image upload endpoint when direct Firebase Storage bucket rules are not yet deployed
  app.post('/api/uploads', (req, res) => {
    try {
      const { dataUrl, complaintId } = req.body as {
        dataUrl?: string;
        complaintId?: string;
      };

      if (!dataUrl || typeof dataUrl !== 'string') {
        res.status(400).json({ error: 'Missing image payload.' });
        return;
      }

      const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) {
        res.status(400).json({ error: 'Invalid image format. Only JPEG, PNG, and WebP are allowed.' });
        return;
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.byteLength === 0 || buffer.byteLength > MAX_UPLOAD_BYTES) {
        res.status(400).json({ error: 'Image exceeds the 5 MB upload limit.' });
        return;
      }

      const safePrefix =
        typeof complaintId === 'string' && /^[a-zA-Z0-9_-]{3,40}$/.test(complaintId)
          ? complaintId
          : 'report';
      const ext = MIME_TO_EXT[mimeType] || '.jpg';
      const filename = `${safePrefix}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      const targetPath = path.join(UPLOAD_DIR, filename);

      fs.writeFileSync(targetPath, buffer);
      res.status(201).json({ url: `/api/uploads/${filename}` });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to store uploaded image.' });
    }
  });

  app.get('/api/uploads/:filename', (req, res) => {
    const filename = path.basename(req.params.filename || '');
    if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(filename)) {
      res.status(400).json({ error: 'Invalid file name.' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Image not found.' });
      return;
    }

    const ext = path.extname(filename).toLowerCase();
    res.setHeader('Content-Type', EXT_TO_MIME[ext] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(filePath).pipe(res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aqua Connect server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
