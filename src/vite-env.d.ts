/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
  // add more as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
