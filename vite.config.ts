import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Это критически важно для GitHub Pages, чтобы пути были относительными
  build: {
    outDir: 'dist',
  }
});