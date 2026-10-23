import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// The design system lives one level up, in design/. It is imported unchanged.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@design': fileURLToPath(new URL('../design', import.meta.url)) } },
  server: { fs: { allow: ['..'] } },
})
