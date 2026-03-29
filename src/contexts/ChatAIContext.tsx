import { createContext, useContext, useMemo, useCallback } from 'react'
import { sendChatCompletion } from '../lib/chatApi'
import { getEmpathySystemPrompt } from '../lib/empathyPrompt'

const EMPTY_AI = 'EMPTY_AI_RESPONSE'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
const NIGHT_COMPANION_ZH = `你是一位安静的深夜陪伴者，陪伴的是正在接受治疗的癌症患者。用短句、小写风格。侧重身体 grounding（例如：「感受毯子的重量」）。如果对方提到疼痛或失眠，给予共情，并建议一个 2 分钟 peaceful place 的可视化练习。语气轻柔、克制。`

const NIGHT_COMPANION_EN = `you are a quiet, late-night companion for a cancer patient in treatment. use lower-case, short sentences. focus on physical grounding (e.g., "feel the weight of your blanket"). if they mention pain or insomnia, offer empathy and suggest a 2-minute visualization of a peaceful place.`

export { NIGHT_COMPANION_ZH, NIGHT_COMPANION_EN }

export type ChatAIStatus = 'ready' | 'error'

export interface ChatOptions {
  systemPromptOverride?: string
  contextAppendix?: string
  onToken?: (partialText: string) => void
  signal?: AbortSignal
}

type ChatAIState = {
  status: ChatAIStatus
  init: () => Promise<boolean>
  chat: (
    messages: { role: string; content: string }[],
    userInput: string,
    locale: 'zh' | 'en',
    options?: ChatOptions
  ) => Promise<string>
}

const ChatAIStateContext = createContext<ChatAIState | null>(null)

export function useChatAIState() {
  const ctx = useContext(ChatAIStateContext)
  if (!ctx) throw new Error('useChatAIState must be used within ChatAIProvider')
  return ctx
}

export function ChatAIProvider({ children }: { children: React.ReactNode }) {
  const init = useCallback(async () => {
    return true
  }, [])

  const chat = useCallback(
    async (
      messages: { role: string; content: string }[],
      _userInput: string,
      locale: 'zh' | 'en' = 'zh',
      options?: ChatOptions
    ): Promise<string> => {
      const systemPrompt = options?.systemPromptOverride
        ? options.systemPromptOverride + (options?.contextAppendix ?? '')
        : getEmpathySystemPrompt(locale, options?.contextAppendix ?? '')
      const checkAborted = () => {
        if (options?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      }

      checkAborted()

      const apiMessages = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      try {
        const runOnce = () =>
          sendChatCompletion({
            messages: apiMessages,
            systemPrompt,
            locale,
            signal: options?.signal,
          })

        let { text } = await runOnce()
        checkAborted()
        let raw = (text ?? '').trim()
        if (!raw) {
          await sleep(400)
          checkAborted()
          const second = await runOnce()
          checkAborted()
          raw = (second.text ?? '').trim()
        }
        if (!raw) {
          const err = new Error(EMPTY_AI)
          ;(err as Error & { code?: string }).code = 'EMPTY_AI_RESPONSE'
          throw err
        }
        return dedupeParagraphs(raw)
      } catch (err) {
        checkAborted()
        throw err
      }
    },
    []
  )

  const stateValue = useMemo(
    () => ({ status: 'ready' as const, init, chat }),
    [init, chat]
  )

  return <ChatAIStateContext.Provider value={stateValue}>{children}</ChatAIStateContext.Provider>
}
