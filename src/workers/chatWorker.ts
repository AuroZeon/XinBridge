/**
 * Chat inference worker - runs Transformers.js off main thread to keep UI responsive.
 */
import { EMPATHY_SYSTEM_EN, EMPATHY_SYSTEM_ZH } from '../lib/empathyPrompt'

const MOBILE_MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let generator: any = null

async function ensureModel() {
  if (generator) return generator
  const { pipeline } = await import('@huggingface/transformers')
  generator = await pipeline('text-generation', MOBILE_MODEL, { device: 'wasm' })
  return generator
}

self.onmessage = async (e: MessageEvent<{ type: string; payload?: { userInput: string; locale: 'zh' | 'en'; systemPrompt?: string; chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }> } }>) => {
  const { type, payload } = e.data
  try {
    if (type === 'init') {
      self.postMessage({ type: 'init-start' })
      await ensureModel()
      self.postMessage({ type: 'init-done' })
      return
    }
    if (type === 'chat' && payload) {
      const { userInput, locale, systemPrompt, chatHistory } = payload
      const gen = await ensureModel()
      if (!gen) throw new Error('Model not loaded')
      const sys = systemPrompt ?? (locale === 'zh' ? EMPATHY_SYSTEM_ZH : EMPATHY_SYSTEM_EN)
      const history = chatHistory?.length ? chatHistory : [{ role: 'user' as const, content: userInput.trim() }]
      const chatMessages = [
        { role: 'system' as const, content: sys },
        ...history,
      ]
      const out = await gen(chatMessages, { max_new_tokens: 400, return_full_text: false })
      const raw = out?.[0]?.generated_text
      let text = ''
      if (typeof raw === 'string') text = raw.trim()
      else if (Array.isArray(raw) && raw.length > 0) {
        const last = raw[raw.length - 1]
        const content = typeof last === 'object' && last && 'content' in last ? last.content : ''
        if (typeof content === 'string') text = content.trim()
      }
      self.postMessage({ type: 'chat-result', text })
      return
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    self.postMessage({ type: 'error', message: msg })
  }
}
