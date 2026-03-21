import { createContext, useContext, useMemo, useState, useCallback, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { getAIResponse } from '../data/aiResponses'
import { useLocale } from '../i18n/context'
import { getTranslations } from '../i18n/translations'
import { getEmpathySystemPrompt } from '../lib/empathyPrompt'

/** Native Capacitor app - Workers often fail in WebView; use main-thread Transformers.js */
function isNativeCapacitor(): boolean {
  try {
    return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform?.() === true
  } catch {
    return false
  }
}

/** Mobile browser - can try Worker; fallback to main thread */
function isMobileBrowser(): boolean {
  try {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent ?? ''
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  } catch {
    return false
  }
}

const WEBLLM_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

function dedupeParagraphs(text: string): string {
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean)
  const seen = new Set<string>()
  const result: string[] = []
  for (const line of lines) {
    if (seen.has(line)) continue
    seen.add(line)
    result.push(line)
  }
  return result.join('\n\n').trim() || text
}


/** Night Companion - late-night, quiet mode (from Sleep Support) */
const NIGHT_COMPANION_ZH = `你是一位安静的深夜陪伴者。用短句、小写风格。侧重身体 grounding（例如：「感受毯子的重量」）。如果对方提到疼痛，给予共情，并建议一个 2 分钟 peaceful place 的可视化练习。语气轻柔、克制。`

const NIGHT_COMPANION_EN = `you are a quiet, late-night companion for a patient. use lower-case, short sentences. focus on physical grounding (e.g., "feel the weight of your blanket"). if they mention pain, offer empathy and suggest a 2-minute visualization of a peaceful place.`

export { NIGHT_COMPANION_ZH, NIGHT_COMPANION_EN }

export type WebLLMStatus = 'idle' | 'loading' | 'ready' | 'error' | 'no-webgpu'

interface MlcEngine {
  chat: {
    completions: {
      create: (opts: unknown) => Promise<{ choices?: Array<{ message?: { content?: string } }> }>
    }
  }
  getMessage?: (modelId?: string) => Promise<string>
}

export interface ChatOptions {
  systemPromptOverride?: string
  contextAppendix?: string
  onToken?: (partialText: string) => void
  signal?: AbortSignal
}

type WebLLMState = {
  status: WebLLMStatus
  errorMsg: string
  init: () => Promise<boolean>
  chat: (
    messages: { role: string; content: string }[],
    userInput: string,
    locale: 'zh' | 'en',
    options?: ChatOptions
  ) => Promise<string>
}

const WebLLMStateContext = createContext<WebLLMState | null>(null)
const WebLLMProgressContext = createContext<string>('')
const WebLLMProgressPercentContext = createContext<number | null>(null)

export function useWebLLMState() {
  const ctx = useContext(WebLLMStateContext)
  if (!ctx) throw new Error('useWebLLMState must be used within WebLLMProvider')
  return ctx
}

export function useWebLLMProgress() {
  return useContext(WebLLMProgressContext) ?? ''
}

export function useWebLLMProgressPercent() {
  return useContext(WebLLMProgressPercentContext) ?? null
}

export function WebLLMProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const t = useMemo(() => getTranslations(locale), [locale])
  const chatT = t.chat as { modelLoading: string; modelLoadingPercent: (n: number) => string; noWebGPU: string }
  const [status, setStatus] = useState<WebLLMStatus>('idle')
  const [progress, setProgress] = useState('')
  const [progressPercent, setProgressPercent] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const engineRef = useRef<unknown>(null)
  const workerRef = useRef<Worker | null>(null)
  const lastProgressRef = useRef(0)
  const PROGRESS_THROTTLE_MS = 400

  const init = useCallback(async () => {
    if (engineRef.current) return true
    if (status === 'loading') return false

    setStatus('loading')
    setErrorMsg('')
    setProgress(String(chatT.modelLoading))
    setProgressPercent(null)

    if (isNativeCapacitor()) {
      try {
        const { initTransformersModel } = await import('../lib/transformersInference')
        await initTransformersModel()
        engineRef.current = { type: 'transformers' }
        setStatus('ready')
        setProgress('')
        setProgressPercent(null)
        return true
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setStatus('error')
        setErrorMsg(msg)
        setProgress('')
        setProgressPercent(null)
        return false
      }
    }

    if (isMobileBrowser()) {
      try {
        const worker = new Worker(
          new URL('../workers/chatWorker.ts', import.meta.url),
          { type: 'module' }
        )
        workerRef.current = worker
        await new Promise<void>((resolve, reject) => {
          const onMsg = (e: MessageEvent) => {
            if (e.data?.type === 'init-done') {
              worker.removeEventListener('message', onMsg)
              resolve()
            } else if (e.data?.type === 'error') {
              worker.removeEventListener('message', onMsg)
              reject(new Error(e.data.message))
            }
          }
          worker.addEventListener('message', onMsg)
          worker.postMessage({ type: 'init' })
        })
        engineRef.current = { type: 'worker', worker }
        setStatus('ready')
        setProgress('')
        setProgressPercent(null)
        return true
      } catch {
        workerRef.current?.terminate()
        workerRef.current = null
        try {
          const { initTransformersModel } = await import('../lib/transformersInference')
          await initTransformersModel()
          engineRef.current = { type: 'transformers' }
          setStatus('ready')
          setProgress('')
          setProgressPercent(null)
          return true
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          setStatus('error')
          setErrorMsg(msg)
          setProgress('')
          setProgressPercent(null)
          return false
        }
      }
    }

    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')

      if (!(navigator as { gpu?: unknown }).gpu) {
        setStatus('no-webgpu')
        setErrorMsg(String(chatT.noWebGPU))
        return false
      }

      lastProgressRef.current = Date.now()
      const engine = await CreateMLCEngine(WEBLLM_MODEL, {
        initProgressCallback: (p: { progress?: number; text?: string }) => {
          const now = Date.now()
          if (now - lastProgressRef.current < PROGRESS_THROTTLE_MS) return
          lastProgressRef.current = now
          const pct = p.progress ?? 0
          if (pct > 0) {
            const percent = Math.round(pct * 100)
            setProgressPercent(percent)
            setProgress(chatT.modelLoadingPercent(percent))
          } else if (p.text) {
            setProgress(p.text)
          }
        },
      })

      engineRef.current = { type: 'webllm', engine }
      setStatus('ready')
      setProgress('')
      setProgressPercent(null)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStatus('error')
      setErrorMsg(msg)
      setProgress('')
      setProgressPercent(null)
      return false
    }
  }, [status, chatT])

  const chat = useCallback(
    async (
      messages: { role: string; content: string }[],
      userInput: string,
      locale: 'zh' | 'en' = 'zh',
      options?: ChatOptions
    ): Promise<string> => {
      const stored = engineRef.current as { type: string; engine?: MlcEngine; worker?: Worker } | null
      if (!stored) throw new Error('模型未加载')

      const systemPrompt = options?.systemPromptOverride
        ? options.systemPromptOverride + (options?.contextAppendix ?? '')
        : getEmpathySystemPrompt(locale, options?.contextAppendix ?? '')
      const userTrimmed = userInput.trim()

      const checkAborted = () => {
        if (options?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      }

      if (stored.type === 'transformers') {
        checkAborted()
        const { runTransformersChat } = await import('../lib/transformersInference')
        const fullText = await runTransformersChat(userInput, locale, systemPrompt)
        const result = (fullText ?? '').trim() ? dedupeParagraphs(fullText) : ''
        return result || getAIResponse(userInput, locale)
      }

      if (stored.type === 'worker' && stored.worker) {
        checkAborted()
        const worker = stored.worker
        let settled = false
        const fullText = await new Promise<string>((resolve, reject) => {
          const done = (err: Error | null, text?: string) => {
            if (settled) return
            settled = true
            worker.removeEventListener('message', onMsg)
            if (err) reject(err)
            else resolve(text ?? '')
          }
          const onMsg = (e: MessageEvent) => {
            if (options?.signal?.aborted) return done(new DOMException('Aborted', 'AbortError'))
            if (e.data?.type === 'chat-result') return done(null, e.data.text ?? '')
            if (e.data?.type === 'error') return done(new Error(e.data.message))
          }
          worker.addEventListener('message', onMsg)
          worker.postMessage({ type: 'chat', payload: { userInput, locale, systemPrompt } })
          options?.signal?.addEventListener?.('abort', () => done(new DOMException('Aborted', 'AbortError')))
        })
        const result = (fullText ?? '').trim() ? dedupeParagraphs(fullText) : ''
        return result || getAIResponse(userInput, locale)
      }

      const engine = stored.engine
      const chatApi = engine?.chat
      if (!chatApi) throw new Error('模型未加载')

      const fullMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages,
      ]

      const useStream = Boolean(options?.onToken)
      if (useStream) {
        checkAborted()
        const stream = (await chatApi.completions.create({
          messages: fullMessages,
          stream: true,
          max_tokens: 600,
          temperature: 0.85,
          repetition_penalty: 1.12,
          frequency_penalty: 0.3,
        })) as AsyncIterable<{ choices?: Array<{ delta?: { content?: string } }> }>
        let fullText = ''
        for await (const chunk of stream) {
          checkAborted()
          const delta = chunk.choices?.[0]?.delta?.content ?? ''
          if (delta) {
            fullText += delta
            options?.onToken?.(fullText)
          }
        }
        if (!fullText.trim() && engine && typeof engine.getMessage === 'function') {
          const msg = await engine.getMessage()
          if (msg && typeof msg === 'string') fullText = msg.trim()
        }
        const result = fullText.trim() ? dedupeParagraphs(fullText) : ''
        return result || getAIResponse(userTrimmed || userInput, locale)
      }

      const reply = (await chatApi.completions.create({
        messages: fullMessages,
        stream: false,
        max_tokens: 600,
        temperature: 0.85,
        repetition_penalty: 1.12,
        frequency_penalty: 0.3,
      })) as { choices?: Array<{ message?: { content?: string } }> }

      let fullText = (reply.choices?.[0]?.message?.content ?? '').trim()
      if (!fullText && engine && typeof engine.getMessage === 'function') {
        fullText = (await engine.getMessage()).trim()
      }

      const result = fullText.trim() ? dedupeParagraphs(fullText) : ''
      return result || getAIResponse(userTrimmed || userInput, locale)
    },
    []
  )

  const stateValue = useMemo(
    () => ({ status, errorMsg, init, chat }),
    [status, errorMsg, init, chat]
  )

  return (
    <WebLLMStateContext.Provider value={stateValue}>
      <WebLLMProgressContext.Provider value={progress}>
        <WebLLMProgressPercentContext.Provider value={progressPercent}>
          {children}
        </WebLLMProgressPercentContext.Provider>
      </WebLLMProgressContext.Provider>
    </WebLLMStateContext.Provider>
  )
}
