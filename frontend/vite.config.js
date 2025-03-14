import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    proxy: {
      "/storage": {
        target: "https://firebasestorage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/storage/, ""),
      },
    },
  },
});
