import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
      vue(),
      vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@router': resolve(__dirname, 'src/router'),
      '@store': resolve(__dirname, 'src/store'),
    },
    extensions: [".vue", ".ts", ".js"]
  },
  worker: {
    format: 'es',
    plugins: () => []
  },
  server: {
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    },
    proxy: {
      '/api': {
        target: 'https://dev-hire-bot-254341905127.us-central1.run.app',
        changeOrigin: true, // важно для CORS
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});