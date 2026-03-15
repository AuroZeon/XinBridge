import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMoodMessage } from '../data/moodMessages'
import { getItem, setItem } from '../utils/storage'
import { useTranslation, useLocale } from '../i18n/context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { MoodIcons } from '../components/icons'
import { images } from '../data/mediaAssets'
import type { MoodType } from '../types'

const moodIds: MoodType[] = ['calm', 'worried', 'sad', 'angry', 'exhausted']
const moodBorderColors: Record<MoodType, string> = {
  calm: 'border-l-[var(--color-mood-calm)]',
  worried: 'border-l-[var(--color-mood-worried)]',
  sad: 'border-l-[var(--color-mood-sad)]',
  angry: 'border-l-[var(--color-mood-angry)]',
  exhausted: 'border-l-[var(--color-mood-exhausted)]',
}

export default function MoodCheckIn() {
  const t = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [painLevel, setPainLevel] = useState<number | null>(null)

  const moodT = t.mood as Record<string, string>
  const moodOpts = t.moodOptions as Record<string, string>

  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood)
    setShowResult(true)
  }

  const handleTryActivity = () => {
    if (selectedMood === 'angry') navigate('/breathing/cool')
    else navigate('/breathing')
  }

  const handleReset = () => {
    setSelectedMood(null)
    setShowResult(false)
  }

  return (
    <div className="min-h-dvh pt-safe pb-safe px-4 pb-12 relative bg-[var(--color-bg)]">
      <div className="fixed inset-0 -z-10">
        <img src={images.flowers} alt="" className="w-full h-full object-cover opacity-[0.12]" />
        <div className="absolute inset-0 bg-[var(--color-bg)]" />
      </div>
      <header className="flex items-center justify-between gap-4 py-4">
        <Link to="/" className="text-[var(--color-primary)] text-sm font-medium">{String(t.back)}</Link>
        <h1 className="text-lg font-semibold text-[var(--color-text)]">{String(moodT.title)}</h1>
        <LanguageSwitcher />
      </header>

      {selectedMood && showResult ? (
        <div className="flex flex-col items-center py-6">
          {(() => {
            const Icon = MoodIcons[selectedMood]
            const colorVar = `var(--color-mood-${selectedMood})`
            return Icon ? <Icon className="w-16 h-16 mb-4" style={{ color: colorVar }} strokeWidth={1.5} /> : null
          })()}
          <p className="text-lg text-center leading-7 text-[var(--color-text)] mb-4">
            {getMoodMessage(selectedMood, locale).message}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {locale === 'zh' ? '建议活动：' : 'Suggested activity: '}{getMoodMessage(selectedMood, locale).activity}
          </p>

          <div className="w-full max-w-xs mb-6 p-4 rounded-xl bg-[var(--color-card)] border border-gray-100">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">{String(moodT.painLabel)}</p>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setPainLevel(n)
                    const logs = getItem<{ date: string; pain: number; fatigue: number; nausea: number; sleep: number; appetite: number }[]>('symptoms', [])
                    const today = new Date().toISOString().slice(0, 10)
                    const existing = logs.find((l) => l.date === today)
                    const updated = logs.filter((l) => l.date !== today)
                    setItem('symptoms', [...updated, { date: today, pain: n, fatigue: existing?.fatigue ?? 0, nausea: existing?.nausea ?? 0, sleep: existing?.sleep ?? 3, appetite: existing?.appetite ?? 3 }].sort((a, b) => b.date.localeCompare(a.date)))
                  }}
                  className={`w-8 h-8 rounded text-sm font-medium ${painLevel === n ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-[var(--color-text-secondary)]'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleTryActivity} className="bg-[var(--color-primary)] text-white py-3 px-8 rounded-xl font-semibold mb-4">
            {String(moodT.tryActivity)} {getMoodMessage(selectedMood, locale).activity}
          </button>
          <button onClick={handleReset} className="text-sm text-[var(--color-text-secondary)] py-3">
            {String(t.reset)}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-lg text-[var(--color-text)] mb-2">{moodT.prompt}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">{moodT.subPrompt}</p>
          <div className="flex flex-col gap-3">
            {moodIds.map((id) => (
              <button
                key={id}
                onClick={() => handleSelectMood(id)}
                className={`flex items-center gap-4 bg-white p-4 rounded-xl border border-[var(--color-border-subtle)] text-left card-interactive ${moodBorderColors[id]} border-l-4`}
              >
                {(() => {
                  const Icon = MoodIcons[id]
                  const colorVar = `var(--color-mood-${id})`
                  return Icon ? <Icon className="w-10 h-10 shrink-0" style={{ color: colorVar }} strokeWidth={1.5} /> : null
                })()}
                <span className="text-lg text-[var(--color-text)]">{moodOpts[id]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
