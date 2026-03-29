/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_OPENAI_BASE_URL?: string
  readonly VITE_OPENAI_MODEL?: string
  /** Max output tokens (default 2500). */
  readonly VITE_OPENAI_MAX_TOKENS?: string
  /** Set `true` if your model only accepts `max_tokens` (older APIs). */
  readonly VITE_OPENAI_USE_LEGACY_MAX_TOKENS?: string
  readonly VITE_CHINA_AI_API_KEY?: string
  readonly VITE_CHINA_AI_BASE_URL?: string
  readonly VITE_CHINA_AI_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
