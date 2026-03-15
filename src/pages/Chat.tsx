import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWebLLM } from '../hooks/useWebLLM'
import { useTranslation, useLocale } from '../i18n/context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { images } from '../data/mediaAssets'
import { getAIResponse } from '../data/aiResponses'
import type { ChatMessage } from '../types'


// 愤怒/发泄类输入直接使用预设，避免 LLM 产生不当内容
const USE_PRESET_KEYWORDS = ['打人', '想打', '愤怒', '生气', '烦躁', '憋屈', '想发泄', '受不了']

export default function Chat() {
  const { status, progress, errorMsg, init, chat } = useWebLLM()
  const t = useTranslation()
  const locale = useLocale()
  const chatT = t.chat as Record<string, string>
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: '0', text: chatT.initialMessage, isUser: false, timestamp: Date.now() },
  ])
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    init()
  }, [init])

  const sendMessage = async () => {
    const trimmed = inputText.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: trimmed,
      isUser: true,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsGenerating(true)

    try {
      let aiText: string

      if (status === 'ready' && !USE_PRESET_KEYWORDS.some((k) => trimmed.includes(k))) {
        const history = messages
          .filter((m) => m.id !== '0')
          .map((m) => ({
            role: m.isUser ? ('user' as const) : ('assistant' as const),
            content: m.text,
          }))
        history.push({ role: 'user' as const, content: trimmed })

        aiText = await chat(history, trimmed, locale)
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        await new Promise((r) => setTimeout(r, 300))
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
      const fallback = getAIResponse(trimmed, locale)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: fallback,
          isUser: false,
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLoadModel = () => init()

  return (
    <div className="min-h-dvh flex flex-col relative">
      <div className="absolute inset-0 -z-10">
        <img src={images.handsCare} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/95" />
      </div>
      <header className="flex items-center justify-between gap-4 p-4 bg-white border-b border-[var(--color-border)]">
        <Link to="/" className="text-[var(--color-primary)] text-sm shrink-0">← 返回</Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold">{chatT.title}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] truncate">
            {status === 'ready' ? chatT.aiReady : status === 'loading' ? progress : chatT.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === 'error' && (
            <button
              onClick={handleLoadModel}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white"
            >
              {String(t.retry)}
            </button>
          )}
          <LanguageSwitcher />
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

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${
              msg.isUser
                ? 'ml-auto bg-[var(--color-primary)] text-white'
                : 'bg-white border border-[var(--color-border-subtle)] text-[var(--color-text)]'
            }`}
          >
            <p className="text-base leading-6 whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
        {isGenerating && status !== 'ready' && (
          <div className="max-w-[85%] p-3.5 rounded-2xl bg-[var(--color-card)] border border-gray-200">
            <span className="animate-pulse">...</span>
          </div>
        )}
      </div>

      <div className="p-3 pb-8 bg-white border-t border-[var(--color-border)] flex gap-3 items-end">
        <input
          type="text"
          placeholder={chatT.placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={isGenerating}
          className="flex-1 bg-[var(--color-bg)] rounded-xl px-4 py-3 text-base text-[var(--color-text)] placeholder:text-gray-400 disabled:opacity-60"
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || isGenerating}
          className={`py-3 px-5 rounded-xl font-semibold shrink-0 ${
            inputText.trim() && !isGenerating
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {String(t.send)}
        </button>
      </div>
    </div>
  )
}
