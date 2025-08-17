import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  if (!env.VITE_CONVEX_URL) {
    throw new Error('Missing required environment variable: VITE_CONVEX_URL')
  }

  return {
    server: { port: 3000 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ['./tsconfig.json'] }),
      tanstackStart({ customViteReactPlugin: true }),
      viteReact(),
    ],
  }
})
