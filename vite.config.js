import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // <-- isso obriga o Vite a aceitar conexões externas
    port: 5173,
  },
});
