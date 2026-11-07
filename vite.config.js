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
