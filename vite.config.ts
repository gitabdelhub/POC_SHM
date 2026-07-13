import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

const copyLogoPlugin = () => ({
  name: 'copy-root-logo',
  buildStart() {
    const rootLogo = path.resolve(__dirname, 'logo_saham.png');
    const publicLogo = path.resolve(__dirname, 'public', 'logo_saham.png');
    if (fs.existsSync(rootLogo)) {
      if (!fs.existsSync(path.resolve(__dirname, 'public'))) {
        fs.mkdirSync(path.resolve(__dirname, 'public'));
      }
      fs.copyFileSync(rootLogo, publicLogo);
    }
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/logo_saham.png') {
        const rootLogo = path.resolve(__dirname, 'logo_saham.png');
        if (fs.existsSync(rootLogo)) {
          res.setHeader('Content-Type', 'image/png');
          res.end(fs.readFileSync(rootLogo));
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      copyLogoPlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
