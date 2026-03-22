import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useWebLLMState,
  useWebLLMProgress,
  useWebLLMProgressPercent,
  NIGHT_COMPANION_ZH,
  NIGHT_COMPANION_EN,
} from '../contexts/WebLLMContext'
import { useTranslation, useLocale } from '../i18n/context'
import { images } from '../data/mediaAssets'
import { ImgWithFallback } from '../components/ImgWithFallback'
import { getAIResponse } from '../data/aiResponses'
import { getSuggestions } from '../data/chatSuggestions'
import { buildChatHistory } from '../lib/chatContext'
import type { ChatMessage } from '../types'

const SOS_KEYWORDS = ['sos', 'i give up', '救命', '放弃', '受不了了', '撑不住了']

type ScopeResult = 'allow' | 'crisis' | 'policy'

/**
 * Intelligent scope detection. Distinguishes:
 * - crisis: direct distress (suicide/self-harm)—use therapeutic response, not cold policy
 * - policy: clearly out-of-scope (explicit sexual)—formal boundary
 * - allow: let LLM handle (nuanced questions, "is it normal to feel X?", third-person, etc.)
 */
function getScopeResult(input: string): ScopeResult {
  const lower = input.toLowerCase().trim()

  // Policy: only clearly inappropriate (explicit sexual solicitations—not "sexual function" or assault disclosure)
  if (lower.includes('色情') || /\bporn\b/.test(lower)) return 'policy'
  if (lower.includes('sex with me') || lower.includes('have sex with')) return 'policy'

  // Crisis: direct first-person distress—short, clear phrases (avoid over-matching)
  const crisisPhrases = [
    'kill myself', 'hurt myself', 'end my life', 'want to die', 'want to end it',
    '不想活了', '不想活', '想死', '想自杀', '自残', '寻死',
  ]
  if (crisisPhrases.some((p) => lower.includes(p))) return 'crisis'

  // "suicide" / "自杀" only when clearly first-person distress (not "my friend" or "prevention")
  if ((lower.includes('自杀') || lower.includes('suicide')) &&
      !lower.includes('朋友') && !lower.includes('friend') && !lower.includes('预防') && !lower.includes('prevention')) {
    return 'crisis'
  }

  return 'allow'
}
const SCROLL_DEBOUNCE_MS = 50

/** Skeleton for loading/thinking - shimmer effect */
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

/** Typing indicator - animated dots (mimics model processing) */
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

/** Message bubble - soft lavender for AI, teal for user. Pop-in via framer-motion. */
const MessageBubble = memo(function MessageBubble({
  msg,
  index,
}: {
  msg: ChatMessage
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.15) }}
      className={`max-w-[85%] ${msg.isUser ? 'ml-auto' : ''}`}
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

/** Animated loading bar for model download */
const ModelLoadingBar = memo(function ModelLoadingBar({
  progress,
  progressPercent,
  chatT,
}: {
  progress: string
  progressPercent: number | null
  chatT: Record<string, string>
}) {
  return (
    <div className="mt-1.5 space-y-1">
      <p className="text-xs text-[var(--color-text-secondary)] truncate">
        {progress || chatT.modelLoading}
      </p>
      <div className="h-2 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${progressPercent == null ? 'skeleton-shimmer' : ''}`}
          style={{ backgroundColor: progressPercent != null ? 'var(--color-primary)' : undefined }}
          initial={{ width: 0 }}
          animate={{
            width: progressPercent != null ? `${Math.max(progressPercent, 5)}%` : '60%',
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
})

const ChatHeaderStatus = memo(function ChatHeaderStatus({
  chatT,
  status,
  progress,
  progressPercent,
}: {
  chatT: Record<string, string>
  status: string
  progress: string
  progressPercent: number | null
}) {
  if (status === 'loading')
    return <ModelLoadingBar progress={progress} progressPercent={progressPercent} chatT={chatT} />
  return (
    <p className="text-sm text-[var(--color-text-secondary)] truncate">
      {status === 'ready' ? chatT.aiReady : progress || chatT.subtitle}
    </p>
  )
})

export default function Chat() {
  const { status, errorMsg, init, chat } = useWebLLMState()
  const progress = useWebLLMProgress()
  const progressPercent = useWebLLMProgressPercent()
  const abortRef = useRef<AbortController | null>(null)
  const location = useLocation()
  const t = useTranslation()
  const locale = useLocale()
  const chatT = t.chat as Record<string, string>
  const fromSleep = (location.state as { fromSleep?: boolean })?.fromSleep === true
  const systemPromptOverride = fromSleep
    ? (locale === 'zh' ? NIGHT_COMPANION_ZH : NIGHT_COMPANION_EN)
    : undefined

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: '0', text: chatT.initialMessage, isUser: false, timestamp: Date.now() },
  ])
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingMessageId, setGeneratingMessageId] = useState<string | null>(null)
  const [lastResponseWasSOS, setLastResponseWasSOS] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lastAiMessage = messages.filter((m) => !m.isUser).pop()
  const suggestions =
    lastAiMessage && !isGenerating
      ? getSuggestions(lastAiMessage.text, locale, 3, lastResponseWasSOS)
      : []

  const scrollToBottom = useCallback((instant = false) => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    const scroll = () => {
      bottomRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'end' })
      scrollTimeoutRef.current = null
    }
    if (instant) scroll()
    else scrollTimeoutRef.current = setTimeout(scroll, SCROLL_DEBOUNCE_MS)
  }, [])

  useEffect(() => {
    scrollToBottom(isGenerating)
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    }
  }, [messages, isGenerating, scrollToBottom])

  useEffect(() => {
    init()
  }, [init])

  const sendMessage = async () => {
    const trimmed = inputText.trim()
    if (!trimmed) return

    const isSOS = SOS_KEYWORDS.some((k) => trimmed.toLowerCase().includes(k))
    const scope = getScopeResult(trimmed)

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

      // Crisis (distress): professional therapeutic response—validating, warm
      if (scope === 'crisis') {
        aiText = getAIResponse(trimmed, locale, 'crisisSupport')
        setLastResponseWasSOS(true)
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else if (scope === 'policy') {
        aiText = getAIResponse(trimmed, locale, 'unsafe')
        setLastResponseWasSOS(true)
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else if (isSOS) {
        aiText = getAIResponse(trimmed, locale, 'sos')
        setLastResponseWasSOS(true)
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else if (status === 'ready') {
        const { messages: history, contextAppendix: historyAppendix } = buildChatHistory(messages, trimmed, locale)
        const aiMsgId = (Date.now() + 1).toString()
        aiMsgIdForAbort = aiMsgId

        // Optimistic bubble: show skeleton immediately while LLM reasons
        setMessages((prev) => [...prev, { id: aiMsgId, text: '', isUser: false, timestamp: Date.now() }])
        setGeneratingMessageId(aiMsgId)
        const opts = {
          systemPromptOverride: systemPromptOverride ?? undefined,
          contextAppendix: historyAppendix,
          signal,
          onToken: (partial: string) => {
            setMessages((prev) => {
              const rest = prev.filter((m) => m.id !== aiMsgId)
              return [...rest, { id: aiMsgId, text: partial, isUser: false, timestamp: Date.now() }]
            })
          },
        }

        aiText = await chat(history, trimmed, locale, opts)

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
        // Model not loaded: graceful template fallback
        aiText = getAIResponse(trimmed, locale)
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        if (aiMsgIdForAbort) {
          setMessages((prev) => prev.filter((m) => m.id !== aiMsgIdForAbort))
        }
        return
      }
      const fallback = getAIResponse(trimmed, locale)
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: fallback,
        isUser: false,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsGenerating(false)
      setGeneratingMessageId(null)
      abortRef.current = null
    }
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

  const handleLoadModel = () => init()

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
          <ChatHeaderStatus
            chatT={chatT}
            status={status}
            progress={progress}
            progressPercent={progressPercent}
          />
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
          {status === 'error' && !isGenerating && (
            <button
              onClick={handleLoadModel}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white"
            >
              {String(t.retry)}
            </button>
          )}
        </div>
      </header>

      {errorMsg && status === 'error' && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-sm">
          {errorMsg}
        </div>
      )}
      {status === 'no-webgpu' && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">
          {chatT.noWebGPU}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => {
            const isPendingEmpty = msg.id === generatingMessageId && !msg.text && isGenerating
            if (isPendingEmpty) {
              return <SkeletonBubble key={msg.id} />
            }
            return <MessageBubble key={msg.id} msg={msg} index={i} />
          })}
          {isGenerating && status === 'ready' && !generatingMessageId && <TypingIndicator />}
          {isGenerating && status !== 'ready' && <SkeletonBubble />}
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
          placeholder={chatT.placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={isGenerating}
          className="flex-1 bg-[var(--color-bg)] rounded-xl px-4 py-3 text-base text-[var(--color-text)] placeholder:text-gray-400 disabled:opacity-60"
        />
        <motion.button
          onClick={sendMessage}
          disabled={!inputText.trim() || isGenerating}
          whileTap={{ scale: 0.98 }}
          className={`py-3 px-5 rounded-xl font-semibold shrink-0 ${
            inputText.trim() && !isGenerating
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {String(t.send)}
        </motion.button>
      </div>
    </div>
  )
}
