import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  server: {headers: {'Cache-Control': 'no-store'}},
  preview: {headers: {'Cache-Control': 'no-store'}},
  build: {
    rollupOptions: {
      input: Object.fromEntries(['index.html', 'about/index.html', 'portfolio/index.html', 'approach/index.html', 'contact/index.html', 'privacy/index.html', 'companies/protocol-tomorrow/index.html', 'companies/fugly-media/index.html', 'companies/blue-water-spices/index.html'].map(file => [file.replace('/index.html', '').replace('.html', ''), resolve(process.cwd(), file)])),
    },
  },
});
