import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function localProjectsAdminPlugin() {
  return {
    name: 'local-projects-admin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__local_api/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ isLocalServer: true }));
          return;
        }

        if (req.url === '/__local_api/projects' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (!Array.isArray(parsed)) {
                throw new Error('Projects data must be an array');
              }
              const targetPath = path.resolve(process.cwd(), 'src/data/projects.json');
              fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2) + '\n', 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/__local_api/upload' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { filename, dataUrl } = JSON.parse(body);
              const matches = /^data:([A-Za-z-+/]+);base64,(.+)$/.exec(dataUrl);
              if (!matches || matches.length !== 3) {
                throw new Error('Invalid image dataUrl');
              }
              const buffer = Buffer.from(matches[2], 'base64');
              const safeName = filename
                .replace(/[^a-zA-Z0-9._-]/g, '_')
                .replace(/^_+/, '');
              const finalName = `${Date.now()}-${safeName || 'image.png'}`;
              const imagesDir = path.resolve(process.cwd(), 'public/images');
              if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
              }
              fs.writeFileSync(path.join(imagesDir, finalName), buffer);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, url: `/images/${finalName}` }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localProjectsAdminPlugin()],
  resolve: {
    preserveSymlinks: true,
  },
});
