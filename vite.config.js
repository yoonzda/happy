import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function localProjectsAdminPlugin() {
  return {
    name: 'local-projects-admin',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.server) {
          return html
            .replace(/<link[^>]*data-prod-only[^>]*>\s*/g, '')
            .replace(
              /<script[^>]*data-prod-only[^>]*><\/script>/,
              '<script type="module" src="/src/main.jsx"></script>'
            );
        }
        return html;
      },
    },
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
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body);
              if (!Array.isArray(parsed)) {
                throw new Error('Projects data must be an array');
              }
              const targetPath = path.resolve(process.cwd(), 'src/data/projects.json');
              fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2) + '\n', 'utf-8');
              try {
                await build({ configFile: path.resolve(process.cwd(), 'vite.config.js') });
              } catch {
                // ignore background bundle errors during dev
              }
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
  base: './',
  plugins: [react(), localProjectsAdminPlugin()],
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    outDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(process.cwd(), 'src/main.jsx'),
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: '[name].js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
});
