import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow the hosted preview domain (Arena / e2b) in addition to localhost.
    allowedHosts: ['.e2b.app', '.arena.ai', 'localhost', '127.0.0.1'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['.e2b.app', '.arena.ai', 'localhost', '127.0.0.1'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 2048,
    // No manualChunks: naming three.js as its own chunk makes Vite emit a
    // modulepreload for it in index.html, which defeats lazy loading.
    // Letting Rollup split the dynamic import keeps Three.js off the critical path.
    chunkSizeWarningLimit: 900,
  },
});
