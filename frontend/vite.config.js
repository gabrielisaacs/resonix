import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: mode === 'development' 
          ? 'http://localhost:5001'
          : 'https://resonixbe.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  define: {
    __DEV__: mode === 'development'
  }
}));