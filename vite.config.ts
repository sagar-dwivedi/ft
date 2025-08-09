import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';

export default defineConfig({
  server: { port: 3000 },

  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ['./tsconfig.json'] }),

    tanstackStart({
      // Build target
      target: 'bun',
      customViteReactPlugin: true,

      // Prerender configuration
      prerender: {
        enabled: true,
        crawlLinks: false,
      },

      // Explicitly declare the single page we want
      pages: [
        {
          path: '/',
          prerender: { enabled: true },
        },
      ],
      sitemap: {
        enabled: true,
        host: 'http://localhost:3000',
      },
    }),

    viteReact(),
  ],
});
