/**
 * Shared chat completion logic for Vercel (api/chat.js) and Vite dev middleware.
 * API keys come from process.env only — never bundled into the client.
 */
const MAX_BODY_CHARS = 12000

/** @param {unknown} content */
function parseMessageContent(content) {
  if (content == null) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    const parts = []
    for (const item of content) {
      if (typeof item === 'string') parts.push(item)
      else if (item && typeof item === 'object' && typeof item.text === 'string') parts.push(item.text)
    }
    return parts.join('\n').trim()
  }
  return ''
}

/**
 * @param {Record<string, unknown>} body - parsed JSON body
 * @param {NodeJS.ProcessEnv} env
 * @returns {Promise<{ status: number, json: Record<string, unknown> }>}
 */
export async function runChatCompletion(body, env) {
  const { messages, systemPrompt, locale } = body || {}
  if (!Array.isArray(messages) || typeof systemPrompt !== 'string') {
    return { status: 400, json: { error: 'Invalid payload' } }
  }

  const safeMessages = []
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue
    const content = String(m.content || '').slice(0, MAX_BODY_CHARS)
    if (!content.trim()) continue
    safeMessages.push({ role: m.role, content })
  }

  const sys = String(systemPrompt).slice(0, MAX_BODY_CHARS)
  if (!sys.trim()) return { status: 400, json: { error: 'Invalid system prompt' } }

  const isZh = locale === 'zh' || String(locale || '').toLowerCase().startsWith('zh')

  /** Strip whitespace and accidental `Bearer ` prefix from pasted keys */
  const cleanSecret = (v) => {
    const s = String(v ?? '').trim().replace(/^Bearer\s+/i, '')
    return s
  }

  const openaiKey = cleanSecret(env.OPENAI_API_KEY)
  const chinaKey = cleanSecret(env.CHINA_AI_API_KEY)
  const chinaBase = (env.CHINA_AI_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/$/, '')
  const chinaModel = env.CHINA_AI_MODEL || 'deepseek-chat'
  const openaiModel = env.OPENAI_MODEL || 'gpt-4o-mini'
  const openaiBase = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')

  let endpoint
  let apiKey
  let model
  let providerId

  if (isZh && chinaKey) {
    endpoint = `${chinaBase}/chat/completions`
    apiKey = chinaKey
    model = chinaModel
    providerId = 'china'
  } else if (openaiKey) {
    endpoint = `${openaiBase}/chat/completions`
    apiKey = openaiKey
    model = openaiModel
    providerId = 'openai'
  } else if (chinaKey) {
    endpoint = `${chinaBase}/chat/completions`
    apiKey = chinaKey
    model = chinaModel
    providerId = 'china'
  } else {
    return { status: 503, json: { error: 'AI service not configured', code: 'NO_API_KEY' } }
  }

  const chatMessages = [{ role: 'system', content: sys }, ...safeMessages]

  const maxOut = (() => {
    const raw = env.OPENAI_MAX_TOKENS
    const n = raw != null && String(raw).trim() !== '' ? Number.parseInt(String(raw), 10) : 2500
    return Number.isFinite(n) && n > 0 ? n : 2500
  })()
  const useLegacyMaxTokens = env.OPENAI_USE_LEGACY_MAX_TOKENS === 'true'
  const sampling = useLegacyMaxTokens
    ? { max_tokens: maxOut }
    : { max_completion_tokens: maxOut }

  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.75,
        ...sampling,
      }),
    })

    const rawText = await r.text()
    if (!r.ok) {
      console.error('Chat API provider error', r.status, rawText.slice(0, 800))
      return {
        status: 502,
        json: {
          error: 'AI provider error',
          code: 'PROVIDER_ERROR',
          detail: rawText.slice(0, 400),
        },
      }
    }

    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      return { status: 502, json: { error: 'Invalid provider response', code: 'PROVIDER_ERROR' } }
    }

    const text = parseMessageContent(data.choices?.[0]?.message?.content).trim()
    return {
      status: 200,
      json: {
        text,
        provider: providerId,
        model,
      },
    }
  } catch (err) {
    console.error('Chat API fetch error', err)
    return { status: 502, json: { error: 'Network error', code: 'NETWORK' } }
  }
}
