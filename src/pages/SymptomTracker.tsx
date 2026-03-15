import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getItem, setItem } from '../utils/storage'
import { useTranslation } from '../i18n/context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { images } from '../data/mediaAssets'

export interface SymptomLog {
  date: string
  fatigue: number
  nausea: number
  pain: number
  sleep: number
  appetite: number
  notes?: string
}

export default function SymptomTracker() {
  const t = useTranslation()
  const sym = t.symptoms as Record<string, string | string[]>
  const scaleLabels = (sym.scaleLabels as string[]) ?? []
  const painLabels = (sym.painLabels as string[]) ?? []
  const sleepLabels = (sym.sleepLabels as string[]) ?? []
  const appetiteLabels = (sym.appetiteLabels as string[]) ?? []
  const [logs, setLogs] = useState<SymptomLog[]>(() => getItem<SymptomLog[]>('symptoms', []))
  const todayKey = new Date().toISOString().slice(0, 10)
  const [today, setToday] = useState<SymptomLog>(() => {
    const existing = getItem<SymptomLog[]>('symptoms', []).find((l) => l.date === todayKey)
    return existing
      ? { ...existing, date: todayKey }
      : { date: todayKey, fatigue: 0, nausea: 0, pain: 0, sleep: 3, appetite: 3 }
  })
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!showHistory) {
      const existing = logs.find((l) => l.date === todayKey)
      if (existing) setToday({ ...existing, date: todayKey })
    }
  }, [showHistory, logs])

  useEffect(() => {
    setItem('symptoms', logs)
  }, [logs])

  const existingToday = logs.find((l) => l.date === todayKey)

  const handleSave = () => {
    const updated = logs.filter((l) => l.date !== today.date)
    setLogs([...updated, { ...today }].sort((a, b) => b.date.localeCompare(a.date)))
  }

  const SliderRow = ({
    label,
    value,
    onChange,
    labels,
    max = 6,
  }: {
    label: string
    value: number
    onChange: (v: number) => void
    labels: string[]
    max?: number
  }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--color-text)]">{label}</span>
        <span className="text-[var(--color-primary)] font-medium">{labels[value] ?? value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-[var(--color-primary)]"
      />
    </div>
  )

  return (
    <div className="min-h-dvh pt-safe pb-safe px-4 pb-12 relative bg-[var(--color-bg)]">
      <div className="fixed inset-0 -z-10">
        <img src={images.natureGreen} alt="" className="w-full h-full object-cover opacity-[0.1]" />
        <div className="absolute inset-0 bg-[var(--color-bg)]" />
      </div>
      <header className="flex items-center justify-between py-4">
        <Link to="/" className="text-[var(--color-primary)] text-sm">← {String(t.back)}</Link>
        <h1 className="text-xl font-semibold">{String(sym.title)}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-[var(--color-primary)]"
          >
            {showHistory ? String(sym.today) : String(sym.history)}
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        {String(sym.subtitle)}
      </p>

      {showHistory ? (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)] py-8">{String(sym.noRecords)}</p>
          ) : (
            logs.slice(0, 14).map((log) => (
              <div
                key={log.date}
                className="bg-[var(--color-card)] p-4 rounded-xl border border-gray-100"
              >
                <p className="font-medium text-[var(--color-text)] mb-2">
                  {log.date.replace(/-/g, '/')}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span>{String(sym.fatigue)} {log.fatigue}/6</span>
                  <span>{String(sym.nausea)} {log.nausea}/6</span>
                  <span>{String(sym.pain)} {log.pain}/10</span>
                  <span>{String(sym.sleep)} {log.sleep}/6</span>
                  <span>{String(sym.appetite)} {log.appetite}/6</span>
                </div>
                {log.notes && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">{log.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-[var(--color-card)] p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {String(sym.scaleHint)}
          </p>
          <SliderRow
            label={String(sym.fatigue)}
            value={today.fatigue}
            onChange={(v) => setToday({ ...today, fatigue: v })}
            labels={scaleLabels}
          />
          <SliderRow
            label={String(sym.nausea)}
            value={today.nausea}
            onChange={(v) => setToday({ ...today, nausea: v })}
            labels={scaleLabels}
          />
          <SliderRow
            label={`${String(sym.pain)} (0-10)`}
            value={Math.min(today.pain, 10)}
            onChange={(v) => setToday({ ...today, pain: v })}
            labels={painLabels}
            max={10}
          />
          <SliderRow
            label={String(sym.sleep)}
            value={today.sleep}
            onChange={(v) => setToday({ ...today, sleep: v })}
            labels={sleepLabels}
          />
          <SliderRow
            label={String(sym.appetite)}
            value={today.appetite}
            onChange={(v) => setToday({ ...today, appetite: v })}
            labels={appetiteLabels}
          />
          <div className="mt-4">
            <label className="text-sm text-[var(--color-text)] block mb-2">{String(sym.notes)}</label>
            <textarea
              placeholder={String(sym.notesPlaceholder)}
              value={today.notes ?? ''}
              onChange={(e) => setToday({ ...today, notes: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 text-[var(--color-text)] placeholder:text-gray-400 resize-none"
              rows={2}
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full mt-6 bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold"
          >
            {existingToday ? String(sym.updateRecord) : String(sym.saveRecord)}
          </button>
        </div>
      )}
    </div>
  )
}
