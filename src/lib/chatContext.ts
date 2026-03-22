/**
 * Builds chat history from dialog messages with summarization when context is too large.
 * Ensures the model focuses on the latest user question.
 */
import type { ChatMessage } from '../types'

const MAX_CONTEXT_CHARS = 900
const MAX_RECENT_CHARS = 600
const BULLET_MAX_LEN = 60

export interface ChatHistoryResult {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  contextAppendix: string
}

/**
 * Summarize older turns to bullet points to fit within context budget.
 */
function summarizeToBullets(
  turns: Array<{ role: 'user' | 'assistant'; content: string }>,
  locale: 'zh' | 'en'
): string {
  const labelUser = locale === 'zh' ? '用户' : 'User'
  const labelAi = locale === 'zh' ? '心桥' : 'XinBridge'
  const bullets = turns.map((t) => {
    const label = t.role === 'user' ? labelUser : labelAi
    const short = t.content.length > BULLET_MAX_LEN
      ? t.content.slice(0, BULLET_MAX_LEN) + (locale === 'zh' ? '…' : '…')
      : t.content
    return `• ${label}: ${short.trim()}`
  })
  const prefix = locale === 'zh' ? '【此前对话摘要】\n' : '[Earlier dialog summary]\n'
  return prefix + bullets.join('\n')
}

/**
 * Build chat history from messages. When total context exceeds limit, older turns
 * are condensed to bullet points. The latest user message is always included in full.
 */
export function buildChatHistory(
  messages: ChatMessage[],
  currentUserContent: string,
  locale: 'zh' | 'en' = 'zh'
): ChatHistoryResult {
  const excludeInitial = messages.filter((m) => m.id !== '0')
  const turns: Array<{ role: 'user' | 'assistant'; content: string }> = []
  for (const m of excludeInitial) {
    const role = m.isUser ? ('user' as const) : ('assistant' as const)
    const content = m.text?.trim() || ''
    if (!content) continue
    turns.push({ role, content })
  }
  turns.push({ role: 'user', content: currentUserContent })

  let totalLen = turns.reduce((s, t) => s + t.content.length, 0)

  const focusInstruction =
    turns.length > 1
      ? (locale === 'zh'
        ? '\n\n你的回答必须直接针对用户最后一条消息。'
        : "\n\nYour answer must directly address the user's latest message.")
      : ''

  if (totalLen <= MAX_CONTEXT_CHARS) {
    return {
      messages: turns,
      contextAppendix: focusInstruction,
    }
  }

  const recent: Array<{ role: 'user' | 'assistant'; content: string }> = []
  const older: Array<{ role: 'user' | 'assistant'; content: string }> = []
  let recentLen = 0
  const recentTarget = Math.min(MAX_RECENT_CHARS, totalLen - 200)

  for (let i = turns.length - 1; i >= 0; i--) {
    const t = turns[i]!
    if (recentLen + t.content.length <= recentTarget || older.length === 0) {
      recent.unshift(t)
      recentLen += t.content.length
    } else {
      older.unshift(t)
    }
  }

  const summary = older.length > 0 ? summarizeToBullets(older, locale) : ''
  const appendix = focusInstruction + (summary ? `\n\n${summary}` : '')

  return {
    messages: recent,
    contextAppendix: appendix,
  }
}
