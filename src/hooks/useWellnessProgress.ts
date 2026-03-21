/**
 * Wellness progress for today: Mood Check-in, Symptom Log, Breathing.
 */
import { useState, useEffect, useCallback } from 'react'
import { getItem } from '../utils/storage'

const KEY_MOOD = 'moodCheckInDate'
const KEY_BREATHING = 'breathingDoneDate'

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function compute() {
  const today = getToday()
  const moodDate = getItem<string>(KEY_MOOD, '')
  const symptomLogs = getItem<{ date: string }[]>('symptoms', [])
  const breathingDate = getItem<string>(KEY_BREATHING, '')

  const moodDone = moodDate === today
  const symptomDone = symptomLogs.some((l) => l.date === today)
  const breathingDone = breathingDate === today

  const completed = [moodDone, symptomDone, breathingDone].filter(Boolean).length
  const total = 3
  const progress = total > 0 ? completed / total : 0

  return { moodDone, symptomDone, breathingDone, completed, total, progress }
}

export function useWellnessProgress() {
  const [state, setState] = useState(compute)

  const refresh = useCallback(() => setState(compute), [])

  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  return state
}
