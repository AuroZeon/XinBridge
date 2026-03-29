/**
 * Local-only chat sessions (device storage). Keeps past talks so users can continue later.
 */
import { getItem, setItem } from './storage'
import type { ChatMessage } from '../types'

const STORAGE_KEY = 'chatSessions_v1'
const MAX_SESSIONS = 40

export interface ChatSession {
  id: string
  updatedAt: number
  messages: ChatMessage[]
}

export interface ChatSessionsStore {
  activeId: string
  sessions: ChatSession[]
}

export function createWelcomeMessage(initialText: string): ChatMessage {
  return { id: '0', text: initialText, isUser: false, timestamp: Date.now() }
}

export function loadChatSessionsStore(): ChatSessionsStore | null {
  return getItem<ChatSessionsStore | null>(STORAGE_KEY, null)
}

export function saveChatSessionsStore(store: ChatSessionsStore): void {
  const sorted = [...store.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
  const sessions = sorted.slice(0, MAX_SESSIONS)
  const activeStillExists = sessions.some((s) => s.id === store.activeId)
  const activeId = activeStillExists ? store.activeId : sessions[0]?.id ?? store.activeId
  setItem(STORAGE_KEY, { activeId, sessions })
}

export function upsertActiveSession(store: ChatSessionsStore, messages: ChatMessage[]): ChatSessionsStore {
  const { activeId } = store
  const nextSession: ChatSession = {
    id: activeId,
    updatedAt: Date.now(),
    messages: messages.map((m) => ({ ...m })),
  }
  const without = store.sessions.filter((s) => s.id !== activeId)
  return {
    activeId,
    sessions: [nextSession, ...without].sort((a, b) => b.updatedAt - a.updatedAt),
  }
}

export function addNewSession(store: ChatSessionsStore, initialWelcome: string): ChatSessionsStore {
  const id = `${Date.now()}`
  const messages = [createWelcomeMessage(initialWelcome)]
  return {
    activeId: id,
    sessions: [{ id, updatedAt: Date.now(), messages }, ...store.sessions],
  }
}

export function setActiveSession(store: ChatSessionsStore, sessionId: string): ChatSessionsStore | null {
  const session = store.sessions.find((s) => s.id === sessionId)
  if (!session) return null
  return { ...store, activeId: sessionId }
}

export function sessionListLabel(session: ChatSession, locale: 'zh' | 'en'): string {
  const firstUser = session.messages.find((m) => m.isUser && m.text.trim())
  if (firstUser) {
    const t = firstUser.text.trim().replace(/\s+/g, ' ')
    return t.length > 26 ? `${t.slice(0, 26)}…` : t
  }
  return locale === 'zh' ? '新对话' : 'New chat'
}

export function sessionSubLabel(updatedAt: number, locale: 'zh' | 'en'): string {
  const d = new Date(updatedAt)
  if (locale === 'zh') {
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
