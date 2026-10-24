import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// The design system lives one level up, in design/. It is imported unchanged.
// Haoyue's photos stay in work/haoyue/<page>/assets/ and are imported as @photos/<page>/assets/<name>.webp.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@design': fileURLToPath(new URL('../design', import.meta.url)),
      '@photos': fileURLToPath(new URL('../work/haoyue', import.meta.url)),
    },
  },
  server: { fs: { allow: ['..'] } },
})
