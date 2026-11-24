import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function localApiPlugin() {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      if (env.MONGODB_URI && !process.env.MONGODB_URI) {
        process.env.MONGODB_URI = env.MONGODB_URI;
      }

      server.middlewares.use('/api/data', async (req, res) => {
        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBody = Buffer.concat(chunks).toString('utf8');
          req.body = rawBody ? JSON.parse(rawBody) : undefined;

          const wrappedRes = {
            setHeader: (k, v) => res.setHeader(k, v),
            status(code) {
              res.statusCode = code;
              return this;
            },
            json(payload) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(payload));
            },
            end(payload) {
              res.end(payload);
            },
          };

          const { default: handler } = await import('./api/data.js');
          await handler(req, wrappedRes);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Local API error' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
