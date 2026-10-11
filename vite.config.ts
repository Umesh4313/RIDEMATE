import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const backendPort = process.env.BACKEND_PORT || 8085;
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/data/**', '**/java-backend/**', '**/.git/**', '**/node_modules/**'],
      },
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          secure: false,
        },
        '/cars': {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
