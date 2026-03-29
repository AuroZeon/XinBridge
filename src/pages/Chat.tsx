import { useState, useRef, useEffect, useLayoutEffect, memo, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useChatAIState,
  NIGHT_COMPANION_ZH,
  NIGHT_COMPANION_EN,
} from '../contexts/ChatAIContext'
import { useTranslation, useLocale } from '../i18n/context'
import { images } from '../data/mediaAssets'
import { ImgWithFallback } from '../components/ImgWithFallback'
import { getAIResponse } from '../data/aiResponses'
import { getSuggestions } from '../data/chatSuggestions'
import { buildChatHistory } from '../lib/chatContext'
import type { ChatMessage } from '../types'
import { getAiConsentChoice, setAiConsentAccepted, setAiConsentDeclined } from '../utils/aiConsent'
import type { AiConsentChoice } from '../utils/aiConsent'
import {
  loadChatSessionsStore,
  saveChatSessionsStore,
  upsertActiveSession,
  addNewSession,
  setActiveSession,
  createWelcomeMessage,
  sessionListLabel,
  sessionSubLabel,
} from '../utils/chatSessions'

const SOS_KEYWORDS = ['sos', 'i give up', '救命', '放弃', '受不了了', '撑不住了']

type ScopeResult = 'allow' | 'crisis' | 'policy'

function getScopeResult(input: string): ScopeResult {
  const lower = input.toLowerCase().trim()

  if (lower.includes('色情') || /\bporn\b/.test(lower)) return 'policy'
  if (lower.includes('sex with me') || lower.includes('have sex with')) return 'policy'

  const crisisPhrases = [
    'kill myself', 'hurt myself', 'end my life', 'want to die', 'want to end it',
    '不想活了', '不想活', '想死', '想自杀', '自残', '寻死',
  ]
  if (crisisPhrases.some((p) => lower.includes(p))) return 'crisis'

  if ((lower.includes('自杀') || lower.includes('suicide')) &&
      !lower.includes('朋友') && !lower.includes('friend') && !lower.includes('预防') && !lower.includes('prevention')) {
    return 'crisis'
  }

  return 'allow'
}
const SCROLL_DEBOUNCE_MS = 50

function chatApiErrorToUserMessage(e: unknown, chatT: Record<string, string>): string {
  const code = (e as Error & { code?: string }).code
  const msg = e instanceof Error ? e.message : String(e)
  if (code === 'NO_API_KEY') return chatT.apiNotConfigured ?? chatT.apiUnavailable
  if (code === 'EMPTY_AI_RESPONSE' || msg === 'EMPTY_AI_RESPONSE') return chatT.apiEmptyReply ?? chatT.apiUnavailable
  // Provider returned JSON error body (e.g. invalid key, model) — show message, not generic "connection"
  if (code === 'PROVIDER_ERROR' && msg.length > 0) return msg
  if (msg === 'Invalid response from server') return chatT.apiUnavailable
  if (msg.startsWith('AI provider error') || msg.includes('Incorrect API key')) return msg
  return chatT.apiUnavailable
}

const SkeletonBubble = memo(function SkeletonBubble() {
  return (
    <div className="max-w-[85%] p-3.5 rounded-2xl rounded-bl-md bg-[#f3efff] border border-[#e6d9f5]/60">
      <div className="flex gap-1.5">
        <div className="h-3 w-20 rounded skeleton-shimmer" />
        <div className="h-3 w-16 rounded skeleton-shimmer" style={{ animationDelay: '0.1s' }} />
        <div className="h-3 w-24 rounded skeleton-shimmer" style={{ animationDelay: '0.2s' }} />
      </div>
      <div className="flex gap-1.5 mt-2">
        <div className="h-3 w-14 rounded skeleton-shimmer" />
        <div className="h-3 w-20 rounded skeleton-shimmer" style={{ animationDelay: '0.15s' }} />
      </div>
    </div>
  )
})

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="max-w-[85%] p-3.5 rounded-2xl rounded-bl-md bg-[#f3efff] border border-[#e6d9f5]/60 shadow-sm"
    >
      <div className="flex gap-1.5 items-center">
        <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#a78bfa]" />
        <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#a78bfa]" />
        <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#a78bfa]" />
      </div>
    </motion.div>
  )
})

const MessageBubble = memo(function MessageBubble({
  msg,
  index,
}: {
  msg: ChatMessage
  index: number
}) {
  return (
    <motion.div
      data-chat-msg-id={msg.id}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.15) }}
      className={`max-w-[85%] scroll-mt-3 ${msg.isUser ? 'ml-auto' : ''}`}
    >
      <div
        className={`relative p-3.5 rounded-2xl shadow-sm ${
          msg.isUser
            ? 'bg-[var(--color-primary)] text-white rounded-br-md'
            : 'bg-[#f3efff] border border-[#e6d9f5]/60 text-[var(--color-text)] rounded-bl-md'
        }`}
      >
        <p className="text-base leading-6 whitespace-pre-wrap">{msg.text}</p>
      </div>
    </motion.div>
  )
})

function privacyPolicyHref(): string {
  const v = import.meta.env.VITE_PRIVACY_POLICY_URL
  if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v
  try {
    return new URL('privacy.html', window.location.href).href
  } catch {
    return 'privacy.html'
  }
}

function readInitialSession(initialWelcome: string): { sessionId: string; messages: ChatMessage[]; wasFresh: boolean } {
  const loaded = loadChatSessionsStore()
  if (loaded?.sessions?.length) {
    const active = loaded.sessions.find((s) => s.id === loaded.activeId) ?? loaded.sessions[0]
    if (active?.messages?.length) {
      return {
        sessionId: active.id,
        messages: active.messages.map((m) => ({ ...m })),
        wasFresh: false,
      }
    }
  }
  const id = `${Date.now()}`
  return { sessionId: id, messages: [createWelcomeMessage(initialWelcome)], wasFresh: true }
}

export default function Chat() {
  const { init, chat } = useChatAIState()
  const abortRef = useRef<AbortController | null>(null)
  const location = useLocation()
  const t = useTranslation()
  const locale = useLocale()
  const chatT = t.chat as Record<string, string>
  const fromSleep = (location.state as { fromSleep?: boolean })?.fromSleep === true
  const systemPromptOverride = fromSleep
    ? (locale === 'zh' ? NIGHT_COMPANION_ZH : NIGHT_COMPANION_EN)
    : undefined

  const [consentChoice, setConsentChoice] = useState<AiConsentChoice>(() => getAiConsentChoice())
  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const [pendingSend, setPendingSend] = useState<string | null>(null)

  const initRef = useRef(readInitialSession(chatT.initialMessage))
  const [sessionId, setSessionId] = useState(() => initRef.current.sessionId)
  const [messages, setMessages] = useState<ChatMessage[]>(() => initRef.current.messages)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [storeTick, setStoreTick] = useState(0)
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingMessageId, setGeneratingMessageId] = useState<string | null>(null)
  const [lastResponseWasSOS, setLastResponseWasSOS] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollBottomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollAssistantTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevMessageCountRef = useRef(initRef.current.messages.length)

  const sortedSessions = useMemo(() => {
    const sessionStore = loadChatSessionsStore()
    if (!sessionStore?.sessions?.length) return []
    return [...sessionStore.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [storeTick, historyOpen, sessionId])

  useLayoutEffect(() => {
    if (!initRef.current.wasFresh) return
    const { sessionId: sid, messages: msgs } = initRef.current
    saveChatSessionsStore(upsertActiveSession({ activeId: sid, sessions: [] }, msgs))
    setStoreTick((n) => n + 1)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      const prev = loadChatSessionsStore()
      const next = upsertActiveSession(
        { activeId: sessionId, sessions: prev?.sessions ?? [] },
        messages
      )
      saveChatSessionsStore(next)
      setStoreTick((n) => n + 1)
    }, 400)
    return () => clearTimeout(t)
  }, [messages, sessionId])

  const startNewSession = useCallback(() => {
    if (isGenerating) return
    abortRef.current?.abort()
    const base = loadChatSessionsStore() ?? { activeId: sessionId, sessions: [] }
    const next = addNewSession(base, chatT.initialMessage)
    saveChatSessionsStore(next)
    const active = next.sessions.find((s) => s.id === next.activeId)
    if (!active) return
    setSessionId(next.activeId)
    setMessages(active.messages.map((m) => ({ ...m })))
    prevMessageCountRef.current = active.messages.length
    setInputText('')
    setHistoryOpen(false)
    setStoreTick((n) => n + 1)
  }, [isGenerating, sessionId, chatT.initialMessage])

  const pickSession = useCallback(
    (id: string) => {
      if (id === sessionId || isGenerating) return
      abortRef.current?.abort()
      const base = loadChatSessionsStore()
      if (!base) return
      const updated = setActiveSession(base, id)
      if (!updated) return
      const s = updated.sessions.find((x) => x.id === id)
      if (!s) return
      saveChatSessionsStore(updated)
      setSessionId(id)
      setMessages(s.messages.map((m) => ({ ...m })))
      prevMessageCountRef.current = s.messages.length
      setInputText('')
      setHistoryOpen(false)
      setStoreTick((n) => n + 1)
    },
    [sessionId, isGenerating]
  )

  const lastAiMessage = messages.filter((m) => !m.isUser).pop()
  const suggestions =
    lastAiMessage && !isGenerating
      ? getSuggestions(lastAiMessage.text, locale, 3, lastResponseWasSOS)
      : []

  const scrollToBottom = useCallback((instant = false) => {
    if (scrollBottomTimeoutRef.current) clearTimeout(scrollBottomTimeoutRef.current)
    const scroll = () => {
      bottomRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'end' })
      scrollBottomTimeoutRef.current = null
    }
    if (instant) scroll()
    else scrollBottomTimeoutRef.current = setTimeout(scroll, SCROLL_DEBOUNCE_MS)
  }, [])

  /** Scroll so the assistant bubble starts near the top of the list (read long replies from the beginning). */
  const scrollAssistantMessageToTop = useCallback((messageId: string, instant = false) => {
    if (scrollAssistantTimeoutRef.current) clearTimeout(scrollAssistantTimeoutRef.current)
    const run = () => {
      const safeId = messageId.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      const el = document.querySelector(`[data-chat-msg-id="${safeId}"]`)
      el?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' })
      scrollAssistantTimeoutRef.current = null
    }
    if (instant) run()
    else scrollAssistantTimeoutRef.current = setTimeout(run, SCROLL_DEBOUNCE_MS)
  }, [])

  // User sent a new message → keep bottom in view (their bubble).
  useEffect(() => {
    const grew = messages.length > prevMessageCountRef.current
    prevMessageCountRef.current = messages.length
    const last = messages[messages.length - 1]
    if (grew && last?.isUser) {
      scrollToBottom(false)
    }
  }, [messages, scrollToBottom])

  // Assistant reply finished → align to top of that bubble (not the end of long text).
  useEffect(() => {
    if (isGenerating) return
    const last = messages[messages.length - 1]
    if (!last || last.isUser || !last.text.trim()) return
    scrollAssistantMessageToTop(last.id, false)
    return () => {
      if (scrollAssistantTimeoutRef.current) {
        clearTimeout(scrollAssistantTimeoutRef.current)
        scrollAssistantTimeoutRef.current = null
      }
    }
  }, [messages, isGenerating, scrollAssistantMessageToTop])

  useEffect(() => {
    return () => {
      if (scrollBottomTimeoutRef.current) {
        clearTimeout(scrollBottomTimeoutRef.current)
        scrollBottomTimeoutRef.current = null
      }
      if (scrollAssistantTimeoutRef.current) {
        clearTimeout(scrollAssistantTimeoutRef.current)
        scrollAssistantTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    void init()
  }, [init])

  const headerSubtitle = useCallback(() => {
    if (consentChoice === 'accepted') return chatT.aiReady
    if (consentChoice === 'declined') return chatT.chatDeclinedSubtitle
    return chatT.subtitle
  }, [consentChoice, chatT])

  const sendMessageCore = async (trimmed: string) => {
    const isSOS = SOS_KEYWORDS.some((k) => trimmed.toLowerCase().includes(k))
    const scope = getScopeResult(trimmed)
    const consent = getAiConsentChoice()

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: trimmed,
      isUser: true,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsGenerating(true)
    setLastResponseWasSOS(false)

    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    let aiMsgIdForAbort: string | null = null

    try {
      let aiText: string

      if (scope === 'crisis') {
        aiText = getAIResponse(trimmed, locale, 'crisisSupport')
        setLastResponseWasSOS(true)
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }])
      } else if (scope === 'policy') {
        aiText = getAIResponse(trimmed, locale, 'unsafe')
        setLastResponseWasSOS(true)
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }])
      } else if (isSOS) {
        aiText = getAIResponse(trimmed, locale, 'sos')
        setLastResponseWasSOS(true)
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }])
      } else if (scope === 'allow' && consent === 'declined') {
        aiText = chatT.declinedShortReply
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }])
      } else if (scope === 'allow' && consent === 'accepted') {
        const { messages: history, contextAppendix: historyAppendix } = buildChatHistory(messages, trimmed, locale)
        const aiMsgId = (Date.now() + 1).toString()
        aiMsgIdForAbort = aiMsgId

        setMessages((prev) => [...prev, { id: aiMsgId, text: '', isUser: false, timestamp: Date.now() }])
        setGeneratingMessageId(aiMsgId)
        const opts = {
          systemPromptOverride: systemPromptOverride ?? undefined,
          contextAppendix: historyAppendix,
          signal,
        }

        try {
          aiText = await chat(history, trimmed, locale, opts)
        } catch (e) {
          aiText = chatApiErrorToUserMessage(e, chatT)
        }

        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === aiMsgId)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = { ...next[idx]!, text: aiText }
            return next
          }
          return [...prev, { id: aiMsgId, text: aiText, isUser: false, timestamp: Date.now() }]
        })
      } else {
        aiText = chatT.pendingConsentShortReply
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }])
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        if (aiMsgIdForAbort) {
          setMessages((prev) => prev.filter((m) => m.id !== aiMsgIdForAbort))
        }
        return
      }
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: chatApiErrorToUserMessage(err, chatT),
        isUser: false,
        timestamp: Date.now(),
      }])
    } finally {
      setIsGenerating(false)
      setGeneratingMessageId(null)
      abortRef.current = null
    }
  }

  const sendMessage = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || isGenerating) return

    const isSOS = SOS_KEYWORDS.some((k) => trimmed.toLowerCase().includes(k))
    const scope = getScopeResult(trimmed)

    if (scope === 'allow' && !isSOS && getAiConsentChoice() === 'pending') {
      setPendingSend(trimmed)
      setConsentModalOpen(true)
      return
    }

    await sendMessageCore(trimmed)
  }

  const handleConsentAccept = () => {
    setAiConsentAccepted()
    setConsentChoice('accepted')
    setConsentModalOpen(false)
    const text = pendingSend
    setPendingSend(null)
    if (text) void sendMessageCore(text)
  }

  const handleConsentDecline = () => {
    setAiConsentDeclined()
    setConsentChoice('declined')
    setConsentModalOpen(false)
    const text = pendingSend
    setPendingSend(null)
    if (text) void sendMessageCore(text)
  }

  const handleSuggestion = useCallback(
    (chip: { text: string; textZh: string; href?: string }) => {
      if (chip.href) return
      const text = locale === 'zh' ? chip.textZh : chip.text
      setInputText(text)
    },
    [locale]
  )

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    void sendMessage()
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 -z-10">
        <ImgWithFallback src={images.handsCare} alt="" className="w-full h-full object-cover opacity-15" fallbackClassName="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/95" />
      </div>

      <header className="header-safe flex items-center justify-between gap-4 px-4 pb-4 bg-white border-b border-[var(--color-border)] shrink-0">
        <Link to={((location.state as { from?: string })?.from) ?? '/'} className="text-[var(--color-primary)] text-sm shrink-0">
          ← {String(t.back)}
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold">{chatT.title}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] truncate">{headerSubtitle()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isGenerating && (
            <button
              type="button"
              onClick={handleStop}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
            >
              {locale === 'zh' ? '停止' : 'Stop'}
            </button>
          )}
        </div>
      </header>

      <div className="shrink-0 px-4 py-2.5 flex flex-wrap gap-2 border-b border-[var(--color-border-subtle)] bg-white/90 backdrop-blur-sm">
        <button
          type="button"
          onClick={startNewSession}
          disabled={isGenerating}
          className="flex-1 min-w-[132px] sm:flex-none py-2.5 px-4 rounded-xl text-sm font-medium bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/25 hover:bg-[var(--color-primary-muted)]/40 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {chatT.newChat}
        </button>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          disabled={isGenerating}
          className="flex-1 min-w-[132px] sm:flex-none py-2.5 px-4 rounded-xl text-sm font-medium bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-white/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {chatT.pastChats}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => {
            const isPendingEmpty = msg.id === generatingMessageId && !msg.text && isGenerating
            if (isPendingEmpty) {
              return (
                <div key={msg.id} data-chat-msg-id={msg.id} className="max-w-[85%] scroll-mt-3">
                  <SkeletonBubble />
                </div>
              )
            }
            return <MessageBubble key={msg.id} msg={msg} index={i} />
          })}
          {isGenerating && !generatingMessageId && <TypingIndicator />}
        </AnimatePresence>
        <div ref={bottomRef} className="h-2" aria-hidden />
      </div>

      {suggestions.length > 0 && (
        <div className="shrink-0 px-4 py-2 flex flex-wrap gap-2 bg-white/80 border-t border-[var(--color-border-subtle)]">
          {suggestions.map((chip) =>
            chip.href ? (
              <Link key={`${chip.label}-${chip.href}`} to={chip.href} state={{ from: '/chat' }}>
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block px-3 py-1.5 rounded-full text-sm bg-amber-100 text-amber-800 border border-amber-300/50 hover:bg-amber-200 transition-colors"
                >
                  {locale === 'zh' ? chip.labelZh : chip.label}
                </motion.span>
              </Link>
            ) : (
              <motion.button
                key={chip.label}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestion(chip)}
                className="px-3 py-1.5 rounded-full text-sm bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary-muted)]/50 transition-colors"
              >
                {locale === 'zh' ? chip.labelZh : chip.label}
              </motion.button>
            )
          )}
        </div>
      )}

      <div className="shrink-0 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-[var(--color-border)] flex gap-3 items-end">
        <input
          type="text"
          enterKeyHint="send"
          placeholder={chatT.placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={onKeyDownInput}
          disabled={isGenerating}
          className="flex-1 bg-[var(--color-bg)] rounded-xl px-4 py-3 text-base text-[var(--color-text)] placeholder:text-gray-400 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={!inputText.trim() || isGenerating}
          className={`py-3 px-5 rounded-xl font-semibold shrink-0 transition-transform active:scale-[0.98] ${
            inputText.trim() && !isGenerating
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {String(t.send)}
        </button>
      </div>

      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="past-chats-title"
            onClick={() => setHistoryOpen(false)}
          >
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[min(72vh,520px)] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--color-border-subtle)] shrink-0">
                <h2 id="past-chats-title" className="text-lg font-semibold text-[var(--color-text)]">
                  {chatT.pastChatsTitle}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">{chatT.localOnlyHint}</p>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 p-2">
                {sortedSessions.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-secondary)] text-center py-10 px-4">{chatT.noPastChats}</p>
                ) : (
                  sortedSessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => pickSession(s.id)}
                      className={`w-full text-left rounded-2xl px-4 py-4 mb-1.5 min-h-[3.25rem] transition-colors ${
                        s.id === sessionId
                          ? 'bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/30'
                          : 'bg-[var(--color-bg)] hover:bg-[var(--color-primary-muted)]/25 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-[var(--color-text)] text-[15px] leading-snug">
                        {sessionListLabel(s, locale)}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {sessionSubLabel(s.updatedAt, locale)}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[var(--color-border-subtle)] shrink-0">
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="w-full py-3.5 rounded-xl text-base font-medium border border-[var(--color-border)] text-[var(--color-text)] active:scale-[0.99] transition-transform"
                >
                  {locale === 'zh' ? '关闭' : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {consentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/45"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-consent-title"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl p-5 space-y-4"
            >
              <h2 id="ai-consent-title" className="text-lg font-semibold text-[var(--color-text)]">
                {chatT.consentTitle}
              </h2>
              <div className="text-sm text-[var(--color-text-secondary)] space-y-3 leading-relaxed">
                <p>{chatT.consentLead}</p>
                <p>{chatT.consentWhat}</p>
                <p>{chatT.consentWhoOpenAI}</p>
                <p>{chatT.consentWhoChina}</p>
                <p className="font-medium text-[var(--color-text)]">{chatT.consentMustAgree}</p>
                <p>
                  {chatT.consentPrivacyNote}{' '}
                  <a
                    href={privacyPolicyHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] underline underline-offset-2"
                  >
                    {chatT.privacyPolicyLabel}
                  </a>
                </p>
                <p className="text-xs text-gray-500">{chatT.consentFooter}</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConsentAccept}
                  className="w-full py-3 rounded-xl font-semibold bg-[var(--color-primary)] text-white"
                >
                  {chatT.consentAccept}
                </button>
                <button
                  type="button"
                  onClick={handleConsentDecline}
                  className="w-full py-3 rounded-xl font-medium border border-[var(--color-border)] text-[var(--color-text)]"
                >
                  {chatT.consentDecline}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
