/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INGREDIENT_OCR_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
