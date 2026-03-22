/**
 * Shared Transformers.js inference - runs on main thread (for Capacitor native app)
 * or can be called from Worker. Native WebViews often fail with Workers.
 * Uses Qwen2.5-0.5B-Instruct for mobile/WASM.
 */
import { EMPATHY_SYSTEM_EN, EMPATHY_SYSTEM_ZH } from './empathyPrompt'

const MOBILE_MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let generator: any = null

export async function initTransformersModel(): Promise<void> {
  if (generator) return
  const { pipeline } = await import('@huggingface/transformers')
  generator = await pipeline('text-generation', MOBILE_MODEL, { device: 'wasm' })
}

export async function runTransformersChat(
  userInput: string,
  locale: 'zh' | 'en',
  systemPromptOverride?: string,
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  if (!generator) await initTransformersModel()
  if (!generator) throw new Error('Model not loaded')
  const sys = systemPromptOverride ?? (locale === 'zh' ? EMPATHY_SYSTEM_ZH : EMPATHY_SYSTEM_EN)
  const history = chatHistory?.length
    ? chatHistory
    : [{ role: 'user' as const, content: userInput.trim() }]
  const chatMessages = [
    { role: 'system' as const, content: sys },
    ...history,
  ]
  const out = await generator(chatMessages, { max_new_tokens: 400, return_full_text: false })
  const raw = out?.[0]?.generated_text
  if (typeof raw === 'string') return raw.trim()
  if (Array.isArray(raw) && raw.length > 0) {
    const last = raw[raw.length - 1]
    const content = typeof last === 'object' && last && 'content' in last ? (last as { content?: string }).content : ''
    if (typeof content === 'string') return content.trim()
  }
  return ''
}
