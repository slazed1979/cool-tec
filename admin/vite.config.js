import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Das CMS läuft unter https://<seite>/admin
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3123', '/img': 'http://localhost:3123', '/brand': 'http://localhost:3123', '/admin-icon': 'http://localhost:3123' } },
});
