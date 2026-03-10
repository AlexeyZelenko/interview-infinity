import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
      vue(),
      vueDevTools(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('d3-') || id.includes('/d3/')) return 'vendor-d3';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('sweetalert2')) return 'vendor-sweetalert';
            if (id.includes('@monaco-editor') || id.includes('monaco')) return 'vendor-monaco';
            if (id.includes('prismjs')) return 'vendor-prismjs';
            if (id.includes('vue-i18n') || id.includes('@intlify')) return 'vendor-i18n';
            if (id.includes('openai')) return 'vendor-openai';
            if (id.includes('@stripe')) return 'vendor-stripe';
            if (id.includes('moment')) return 'vendor-moment';
            if (id.includes('axios')) return 'vendor-axios';
            if (id.includes('@webcontainer')) return 'vendor-webcontainer';
          }
        },
      },
    },
  },
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
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});