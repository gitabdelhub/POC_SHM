import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

const copyLogoPlugin = () => ({
  name: 'copy-root-logo',
  buildStart() {
    const assetsLogo = path.resolve(__dirname, 'assets', 'logo_saham.png');
    const publicLogo = path.resolve(__dirname, 'public', 'logo_saham.png');
    const rootLogo = path.resolve(__dirname, 'logo_saham.png');
    
    // Try to copy from assets first, then root
    const sourceFile = fs.existsSync(assetsLogo) ? assetsLogo : 
                      fs.existsSync(rootLogo) ? rootLogo : null;
    
    if (sourceFile) {
      if (!fs.existsSync(path.resolve(__dirname, 'public'))) {
        fs.mkdirSync(path.resolve(__dirname, 'public'), { recursive: true });
      }
      fs.copyFileSync(sourceFile, publicLogo);
    }
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
