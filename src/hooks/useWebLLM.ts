import { useState, useCallback, useRef } from 'react'
import { getAIResponse } from '../data/aiResponses'

/**
 * WebLLM 客户端 LLM - 无需服务端，在手机/浏览器内运行
 * Llama-3.2-1B 指令遵循更好，减少回显问题
 */
const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

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

const SYSTEM_PROMPT_ZH = `你是心桥，陪伴癌症患者的情感支持助手。你的回复必须具体、有用、有温度。

你必须做到：
1. 直接给出温暖、具体的回复，不要用「我不清楚」「我不理解」等含糊表述
2. 先肯定患者的感受（如：这种感受很正常、很多人都会这样），再给 1-2 个具体建议
3. 回复 80-150 字，自然流畅

具体情境示例：
- 患者说想打人/愤怒/烦躁：肯定愤怒是恐惧和委屈的表达，建议呼吸练习（本应用有冷静模式）、写下来、找安静地方
- 患者说害怕/紧张：肯定害怕正常，建议深呼吸、联系家人、把问题记下来问医生
- 患者说累/疲惫：肯定身体在努力，建议休息、量力而行、记录症状给医生
- 患者说睡不着：肯定失眠常见，建议夜晚陪伴或呼吸练习、不强迫入睡

禁止：不说「我不清楚」「我不理解」；不敷衍；不提供医疗建议。绝对严禁提及自杀、自杀念头、心理咨询热线、hotline 等任何相关内容，永远不要提及。`

const SYSTEM_PROMPT_EN = `You are XinBridge, an emotional support assistant for cancer patients. Your replies must be specific, helpful, and warm.

You must:
1. Give warm, concrete replies. Never say "I don't understand" or "I'm not sure"
2. First validate the patient's feelings (e.g. this is normal, many people feel this), then give 1-2 concrete suggestions
3. Reply in 80-150 words, natural and fluent. Respond in the same language as the user.

Examples:
- Anger/frustration: Validate that anger is often fear or helplessness; suggest breathing (cool-down mode in app), writing, finding a quiet place
- Fear/nervous: Validate fear is normal; suggest breathing, contacting family, writing questions for doctor
- Tired: Validate body is working hard; suggest rest, pacing, logging symptoms for doctor
- Can't sleep: Validate insomnia is common; suggest Night Support or breathing, not forcing sleep

Never: say "I don't understand"; be vague; give medical advice. Never mention suicide, hotlines, or related content.`

export type WebLLMStatus = 'idle' | 'loading' | 'ready' | 'error' | 'no-webgpu'

export function useWebLLM() {
  const [status, setStatus] = useState<WebLLMStatus>('idle')
  const [progress, setProgress] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const engineRef = useRef<unknown>(null)

  const init = useCallback(async () => {
    if (engineRef.current) return true
    if (status === 'loading') return false

    setStatus('loading')
    setErrorMsg('')

    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')

      if (!(navigator as { gpu?: unknown }).gpu) {
        setStatus('no-webgpu')
        setErrorMsg('当前设备不支持 WebGPU，将使用预设回复')
        return false
      }

      setProgress('正在加载模型...')
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (p) => {
          if (p.progress > 0) {
            setProgress(`加载中 ${Math.round(p.progress * 100)}%`)
          } else if (p.text) {
            setProgress(p.text)
          }
        },
      })

      engineRef.current = engine
      setStatus('ready')
      setProgress('')
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setStatus('error')
      setErrorMsg(msg)
      setProgress('')
      return false
    }
  }, [status])

  const chat = useCallback(
    async (messages: { role: string; content: string }[], userInput: string, locale: 'zh' | 'en' = 'zh'): Promise<string> => {
      const engine = engineRef.current as {
        chat: { completions: { create: (opts: unknown) => Promise<{ choices?: Array<{ message?: { content?: string } }> }> | AsyncGenerator<unknown> } }
        getMessage?: (modelId?: string) => Promise<string>
      } | null
      if (!engine?.chat) {
        throw new Error('模型未加载')
      }

      const systemPrompt = locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN
      const fullMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages,
      ]

      // 使用非流式 API，更稳定
      const reply = await engine.chat.completions.create({
        messages: fullMessages,
        stream: false,
        max_tokens: 400,
        temperature: 0.8,
        repetition_penalty: 1.15,
        frequency_penalty: 0.5,
      }) as { choices?: Array<{ message?: { content?: string } }> }

      let fullText = (reply.choices?.[0]?.message?.content ?? '').trim()

      // 若仍无内容，尝试 getMessage
      if (!fullText && typeof engine.getMessage === 'function') {
        fullText = (await engine.getMessage()).trim()
      }

      // 检测回显：若回复与用户输入相同或主要为复述，视为无效
      const userTrimmed = userInput.trim()
      if (userTrimmed) {
        if (fullText === userTrimmed) return getAIResponse(userTrimmed, locale)
        if (fullText.startsWith(userTrimmed) && fullText.length < userTrimmed.length + 30) return getAIResponse(userTrimmed, locale)
      }

      // 检测不当回复：含糊、推脱、含自杀相关内容、中英混杂等，改用预设
      const forbiddenPhrases = [
        '我不清楚', '我不理解', '我不确定', '我无法', '我很难', '我想让人理解',
        '自杀', 'hotline', '心理卫生', '心理咨询热线', '热线',
      ]
      const hasTooMuchEnglish = (fullText.match(/[a-zA-Z]{4,}/g) || []).length >= 2
      if (forbiddenPhrases.some((p) => fullText.includes(p)) || fullText.length < 20 || hasTooMuchEnglish) {
        return getAIResponse(userTrimmed || userInput, locale)
      }

      fullText = dedupeParagraphs(fullText)

      return fullText || getAIResponse(userTrimmed || userInput, locale)
    },
    []
  )

  return { status, progress, errorMsg, init, chat, engineRef }
}
