import { defineConfig } from 'vite'

export default defineConfig({
  // root: '.',
  base: './',
  server: {
    open: 'index.html',
  },
  worker: {
    format: 'esm'
  },
  // exclude @niivue/niimath from optimization
  optimizeDeps: {
    exclude: ['@niivue/niimath']
  }
})