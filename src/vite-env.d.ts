/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CONVEX_SITE_URL: string;
  // add more as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
