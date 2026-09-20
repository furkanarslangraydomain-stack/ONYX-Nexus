import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'env-diagnostic-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/diagnostics/env') {
              const apiPoolUrl = process.env.API_POOL_BASE_URL || process.env.API_POOL_URL || '';
              const apiPoolKey = process.env.API_POOL_KEY || process.env.API_POOL_API_KEY || '';
              const groq = process.env.GROQ_API_KEY || '';
              const e2b = process.env.E2B_API_KEY || '';
              const notion = process.env.NOTION_API_KEY || '';
              const notionDb = process.env.NOTION_DATABASE_ID || '';

              const isValidUrl = (u: string) => {
                try {
                  new URL(u);
                  return true;
                } catch {
                  return false;
                }
              };

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  API_POOL_BASE_URL: {
                    exported: Boolean(apiPoolUrl && apiPoolUrl.trim().length > 0),
                    value: apiPoolUrl,
                    prefix: apiPoolUrl.startsWith('https://') ? 'HTTPS Gateway' : apiPoolUrl.startsWith('http://') ? 'HTTP LAN / Gateway' : 'Invalid Protocol',
                    length: apiPoolUrl.length,
                    validFormat: isValidUrl(apiPoolUrl),
                    expectedFormat: 'http(s)://<router-ip-or-domain>:<port>/v1',
                  },
                  API_POOL_KEY: {
                    exported: Boolean(apiPoolKey && apiPoolKey.trim().length > 0),
                    prefix: apiPoolKey.startsWith('sk-') ? 'sk- (Standard)' : apiPoolKey ? 'Custom Token' : 'None (Public/LAN)',
                    length: apiPoolKey.length,
                    masked: apiPoolKey ? `${apiPoolKey.slice(0, 4)}...${apiPoolKey.slice(-4)}` : 'None (No auth needed)',
                    validFormat: true,
                    expectedFormat: 'Pool bearer token (optional)',
                  },
                  E2B_API_KEY: {
                    exported: Boolean(e2b && e2b.trim().length > 0),
                    prefix: e2b.startsWith('e2b_') ? 'e2b_ (E2B)' : e2b ? 'Custom' : 'None',
                    length: e2b.length,
                    masked: e2b ? `${e2b.slice(0, 4)}...${e2b.slice(-4)}` : '',
                    validFormat: Boolean(e2b && e2b.length >= 16),
                    expectedFormat: 'Starts with e2b_ (min 16 chars)',
                  },
                  NOTION_API_KEY: {
                    exported: Boolean(notion && notion.trim().length > 0),
                    prefix: notion.startsWith('secret_') || notion.startsWith('ntn_') ? 'secret_ / ntn_' : notion ? 'Custom' : 'None',
                    length: notion.length,
                    masked: notion ? `${notion.slice(0, 6)}...${notion.slice(-4)}` : '',
                    validFormat: Boolean(notion && notion.length >= 20),
                    expectedFormat: 'Starts with secret_ or ntn_',
                  },
                  GROQ_API_KEY: {
                    exported: Boolean(groq && groq.trim().length > 0),
                    masked: groq ? `${groq.slice(0, 4)}...${groq.slice(-4)}` : '',
                    validFormat: Boolean(groq && groq.length >= 20),
                    expectedFormat: 'Optional direct fallback key',
                  },
                  timestamp: new Date().toISOString(),
                })
              );
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
