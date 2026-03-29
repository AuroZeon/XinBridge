/** Types for `chatCore.mjs` (Vercel + Vite dev middleware). */
export function runChatCompletion(
  body: Record<string, unknown>,
  env: NodeJS.ProcessEnv
): Promise<{ status: number; json: Record<string, unknown> }>
