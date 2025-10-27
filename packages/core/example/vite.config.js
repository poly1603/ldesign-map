import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5000,
    open: true
  },
  resolve: {
    alias: {
      '@ldesign-map/core': '../src/index.ts'
    }
  }
});

