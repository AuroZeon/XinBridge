/**
 * XinBridge chat API
 *
 * - Mobile (Capacitor native): calls OpenAI-compatible `/v1/chat/completions` with
 *   `CapacitorHttp` so requests bypass WebView CORS (plain `fetch` to OpenAI fails in browsers).
 * - Web: prefers backend `/api/chat` when no client key; with `VITE_OPENAI_*` tries `fetch`
 *   (often blocked by CORS) and falls back to `/api/chat` in dev.
 *
 * Client keys must use the `VITE_` prefix — they are embedded in the app bundle (treat as exposed).
 */

import { Capacitor } from '@capacitor/core'

export type ChatApiMessage = { role: 'user' | 'assistant'; content: string }

export type ChatApiResult = {
  text: string
  provider?: string
}

const MAX_BODY_CHARS = 12000
const DEFAULT_MAX_OUT_TOKENS = 2500

/** New OpenAI chat models use `max_completion_tokens`; legacy models use `max_tokens`. */
function samplingParams(): Record<string, number> {
  const raw = import.meta.env.VITE_OPENAI_MAX_TOKENS
  const max =
    typeof raw === 'string' && raw.trim() !== '' ? Number.parseInt(raw, 10) : DEFAULT_MAX_OUT_TOKENS
  const n = Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX_OUT_TOKENS
  const legacy = import.meta.env.VITE_OPENAI_USE_LEGACY_MAX_TOKENS === 'true'
  return legacy ? { max_tokens: n } : { max_completion_tokens: n }
}

function cleanSecret(v: string | undefined): string {
  return String(v ?? '')
    .trim()
    .replace(/^Bearer\s+/i, '')
}

function hasClientAiKeys(): boolean {
  return !!(
    cleanSecret(import.meta.env.VITE_OPENAI_API_KEY) ||
    cleanSecret(import.meta.env.VITE_CHINA_AI_API_KEY)
  )
}

function apiBase(): string {
  const base = import.meta.env.VITE_API_URL
  return typeof base === 'string' ? base.replace(/\/$/, '') : ''
}

export function getChatApiUrl(): string {
  return `${apiBase()}/api/chat`
}

function buildOpenAIMessages(
  messages: ChatApiMessage[],
  systemPrompt: string,
): { role: string; content: string }[] {
  const safe: ChatApiMessage[] = []
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue
    const content = String(m.content || '').slice(0, MAX_BODY_CHARS)
    if (!content.trim()) continue
    safe.push({ role: m.role, content })
  }
  const sys = String(systemPrompt).slice(0, MAX_BODY_CHARS)
  if (!sys.trim()) throw new Error('Invalid system prompt')
  return [{ role: 'system', content: sys }, ...safe]
}

function resolveClientEndpoint(locale: 'zh' | 'en'): {
  endpoint: string
  apiKey: string
  model: string
  providerId: string
} {
  const isZh = locale === 'zh' || String(locale).toLowerCase().startsWith('zh')
  const openaiKey = cleanSecret(import.meta.env.VITE_OPENAI_API_KEY)
  const chinaKey = cleanSecret(import.meta.env.VITE_CHINA_AI_API_KEY)
  const chinaBase = (import.meta.env.VITE_CHINA_AI_BASE_URL || 'https://api.deepseek.com/v1').replace(
    /\/$/,
    '',
  )
  const chinaModel = import.meta.env.VITE_CHINA_AI_MODEL || 'deepseek-chat'
  const openaiModel = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'
  const openaiBase = (import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  )

  if (isZh && chinaKey) {
    return {
      endpoint: `${chinaBase}/chat/completions`,
      apiKey: chinaKey,
      model: chinaModel,
      providerId: 'china',
    }
  }
  if (openaiKey) {
    return {
      endpoint: `${openaiBase}/chat/completions`,
      apiKey: openaiKey,
      model: openaiModel,
      providerId: 'openai',
    }
  }
  if (chinaKey) {
    return {
      endpoint: `${chinaBase}/chat/completions`,
      apiKey: chinaKey,
      model: chinaModel,
      providerId: 'china',
    }
  }
  const err = new Error('NO_CLIENT_AI_KEY')
  ;(err as Error & { code?: string }).code = 'NO_API_KEY'
  throw err
}

/** OpenAI may return `content` as a string or as an array of parts (newer models). */
function parseMessageContent(content: unknown): string {
  if (content == null) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    const parts: string[] = []
    for (const item of content) {
      if (typeof item === 'string') {
        parts.push(item)
        continue
      }
      if (item && typeof item === 'object') {
        const o = item as { type?: string; text?: string }
        if (typeof o.text === 'string') parts.push(o.text)
      }
    }
    return parts.join('\n').trim()
  }
  return ''
}

/**
 * If UTF-8 text was mis-decoded as Latin-1 (each byte 0x00–0xFF), recover Unicode.
 * Safe to skip when the string already contains code points > U+00FF (normal CJK).
 */
function maybeFixUtf8Mojibake(s: string): string {
  if (!s) return s
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 255) return s
  }
  let hasHighByte = false
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c >= 0x80 && c <= 0xff) {
      hasHighByte = true
      break
    }
  }
  if (!hasHighByte) return s
  const bytes = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

function parseCompletionJson(data: unknown): string {
  const d = data as {
    choices?: { message?: { content?: unknown } }[]
  }
  const raw = parseMessageContent(d?.choices?.[0]?.message?.content)
  return maybeFixUtf8Mojibake(raw).trim()
}

async function sendOpenAiViaCapacitorHttp(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<string> {
  const { CapacitorHttp } = await import('@capacitor/core')
  const res = await CapacitorHttp.post({
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    data: body,
  })

  if (res.status < 200 || res.status >= 300) {
    const detail =
      typeof res.data === 'string' ? res.data : JSON.stringify(res.data ?? {}).slice(0, 800)
    const err = new Error(`AI provider error: ${detail}`)
    ;(err as Error & { code?: string }).code = 'PROVIDER_ERROR'
    throw err
  }

  const raw = res.data
  const parsed =
    typeof raw === 'object' && raw !== null ? raw : JSON.parse(String(raw ?? '{}'))
  return parseCompletionJson(parsed)
}

async function sendOpenAiViaFetch(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  })
  const text = await res.text()
  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch {
    const err = new Error(`AI provider error: ${text.slice(0, 400)}`)
    ;(err as Error & { code?: string }).code = 'PROVIDER_ERROR'
    throw err
  }
  if (!res.ok) {
    const detail = typeof data === 'object' && data !== null ? JSON.stringify(data) : String(data)
    const err = new Error(`AI provider error: ${detail.slice(0, 800)}`)
    ;(err as Error & { code?: string }).code = 'PROVIDER_ERROR'
    throw err
  }
  return parseCompletionJson(data)
}

/** Direct OpenAI-compatible call (native uses Capacitor HTTP to avoid CORS). */
async function sendClientDirectCompletion(params: {
  messages: ChatApiMessage[]
  systemPrompt: string
  locale: 'zh' | 'en'
  signal?: AbortSignal
}): Promise<ChatApiResult> {
  const { endpoint, apiKey, model, providerId } = resolveClientEndpoint(params.locale)
  const chatMessages = buildOpenAIMessages(params.messages, params.systemPrompt)
  const body = {
    model,
    messages: chatMessages,
    temperature: 0.75,
    ...samplingParams(),
  }

  let text: string
  if (Capacitor.isNativePlatform()) {
    text = await sendOpenAiViaCapacitorHttp(endpoint, apiKey, body)
  } else {
    try {
      text = await sendOpenAiViaFetch(endpoint, apiKey, body, params.signal)
    } catch (e) {
      const isNetwork =
        e instanceof TypeError ||
        (e instanceof Error && /Failed to fetch|NetworkError|Load failed/i.test(e.message))
      if (import.meta.env.DEV && isNetwork && hasClientAiKeys()) {
        return sendViaBackendProxy(params)
      }
      throw e
    }
  }

  return { text, provider: providerId }
}

async function sendViaBackendProxy(params: {
  messages: ChatApiMessage[]
  systemPrompt: string
  locale: 'zh' | 'en'
  signal?: AbortSignal
}): Promise<ChatApiResult> {
  const url = getChatApiUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AI-Consent': 'accepted',
    },
    body: JSON.stringify({
      messages: params.messages,
      systemPrompt: params.systemPrompt,
      locale: params.locale,
    }),
    signal: params.signal,
  })

  const text = await res.text()
  let data: { text?: string; error?: string; code?: string; detail?: string }
  try {
    data = JSON.parse(text) as typeof data
  } catch {
    throw new Error('Invalid response from server')
  }

  if (!res.ok) {
    const detail = typeof data.detail === 'string' ? data.detail.trim() : ''
    const base = data.error || `Request failed (${res.status})`
    const message = detail.length > 0 ? `${base}: ${detail.slice(0, 800)}` : base
    const err = new Error(message)
    ;(err as Error & { code?: string; detail?: string }).code = data.code
    ;(err as Error & { code?: string; detail?: string }).detail = detail || undefined
    throw err
  }

  return {
    text: (data.text ?? '').trim(),
    provider: undefined,
  }
}

export async function sendChatCompletion(params: {
  messages: ChatApiMessage[]
  systemPrompt: string
  locale: 'zh' | 'en'
  signal?: AbortSignal
}): Promise<ChatApiResult> {
  if (hasClientAiKeys()) {
    return sendClientDirectCompletion(params)
  }
  return sendViaBackendProxy(params)
}
