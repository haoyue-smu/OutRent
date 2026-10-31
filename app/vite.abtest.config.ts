import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { renameSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The A/B test site: abtest.html, built to dist-abtest/ and served from "/". The live app's vite.config.ts and vercel.json
// do not change, and the live build does not see this entry.
const OUT = 'dist-abtest'
const abtestAtRoot = (): Plugin => ({
  name: 'abtest-at-root',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/' || req.url?.startsWith('/?')) req.url = '/abtest.html' + req.url.slice(1)
      next()
    })
  },
  closeBundle() { renameSync(join(OUT, 'abtest.html'), join(OUT, 'index.html')) },
})

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_ABTEST_')
  // A build without the server settings would look fine and lose every participant.
  if (command === 'build' && (!env.VITE_ABTEST_SUPABASE_URL || !env.VITE_ABTEST_SUPABASE_ANON)) {
    throw new Error('Set VITE_ABTEST_SUPABASE_URL and VITE_ABTEST_SUPABASE_ANON in app/.env.local before building the test site.')
  }
  return {
    plugins: [react(), abtestAtRoot()],
    resolve: {
      alias: {
        '@design': fileURLToPath(new URL('../design', import.meta.url)),
        '@photos': fileURLToPath(new URL('../work/haoyue', import.meta.url)),
      },
    },
    server: { fs: { allow: ['..'] } },
    build: { outDir: OUT, rollupOptions: { input: 'abtest.html' } },
  }
})
