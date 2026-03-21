/**
 * Minimal context for XinBridge AI - raw symptom/mood data only.
 * Kept very short so the model focuses on answering the user's question.
 */
import { getItem } from '../utils/storage'

interface SymptomLog {
  date: string
  fatigue?: number
  nausea?: number
  pain?: number
  sleep?: number
  appetite?: number
  bodySymptoms?: Record<string, number>
}

export function buildChatContext(locale: 'zh' | 'en'): string {
  const logs = getItem<SymptomLog[]>('symptoms', [])
  const today = new Date().toISOString().slice(0, 10)
  const todayLog = logs.find((l) => l.date === today)

  const lastMood = getItem<string>('lastMood', '')
  const lastMoodDate = getItem<string>('lastMoodDate', '')

  const parts: string[] = []

  if (todayLog) {
    const symptoms: string[] = []
    if ((todayLog.pain ?? 0) > 0)
      symptoms.push(locale === 'zh' ? `疼痛${todayLog.pain}` : `pain${todayLog.pain}`)
    if ((todayLog.fatigue ?? 0) > 0)
      symptoms.push(locale === 'zh' ? `疲劳${todayLog.fatigue}` : `fatigue${todayLog.fatigue}`)
    if ((todayLog.nausea ?? 0) > 0)
      symptoms.push(locale === 'zh' ? `恶心${todayLog.nausea}` : `nausea${todayLog.nausea}`)
    if (symptoms.length > 0) parts.push(symptoms.join(','))
  }

  if (lastMood && lastMoodDate === today) {
    const labels: Record<string, string> = {
      calm: 'calm',
      worried: 'worried',
      sad: 'sad',
      angry: 'angry',
      exhausted: 'exhausted',
    }
    parts.push(labels[lastMood] ?? lastMood)
  }

  if (parts.length === 0) return ''
  // One short line only—don't outweigh the user's question
  const prefix = locale === 'zh' ? '今日' : 'Today'
  return `\n[${prefix}: ${parts.join('; ')}]`
}
