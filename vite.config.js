import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    proxy: {
      // '/api/sql': {
      //   target: 'https://hh5vrqb6-s0p7ijwn-n46b5jytq7ww.vcb1.mcprev.cn',
      //   changeOrigin: true,
      //   secure: false,
      //   ws: true,
      //   rewrite: (path) => path
      // },

      // Proxying requests from /api to http://jsonplaceholder.typicode.com
      '/sqlai': {
        target: 'http://localhost:8080/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sqlai/, '/sqlai'),
        },
    },
      
  },
  optimizeDeps: {
    include: ['monaco-editor']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor']
        }
      }
    }
  }
})
