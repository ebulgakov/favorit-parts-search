import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// API отдаётся по http и без CORS-заголовков, поэтому из браузера
// ходим на свой origin (/api), а dev-сервер проксирует запрос дальше.
const apiProxy = {
  '/api': {
    target: 'http://api.favorit-parts.ru',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/hs'),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
