/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GPT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
