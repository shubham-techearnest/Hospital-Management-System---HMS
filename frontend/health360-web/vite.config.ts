import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', '@emotion/react', '@emotion/styled', '@mui/material'],
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173,
      path: '/vite-hmr',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
