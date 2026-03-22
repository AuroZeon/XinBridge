/**
 * Visual Wellness Journey - Gamified Symptom Tracker
 * Body Map • Energy Battery • Emoji Slider • Daily Win • Trend Bloom
 */
import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getItem, setItem } from '../utils/storage'
import { useTranslation, useLocale } from '../i18n/context'
import { images } from '../data/mediaAssets'
import { ImgWithFallback } from '../components/ImgWithFallback'
import { BodyMap, type BodyPart, type BodyRegionId } from '../components/BodyMap'

export interface BodySymptoms {
  headache?: number
  dizziness?: number
  foggy?: number
  chestTight?: number
  stomachAche?: number
  bloating?: number
  abdominalNausea?: number
  limbPain?: number
}

export interface SymptomLog {
  date: string
  fatigue: number
  nausea: number
  pain: number
  sleep: number
  appetite: number
  notes?: string
  bodySymptoms?: BodySymptoms
}

const STORAGE_KEY = 'symptoms'

function loadLogs(): SymptomLog[] {
  return getItem<SymptomLog[]>(STORAGE_KEY, [])
}

function saveLogs(logs: SymptomLog[]): void {
  setItem(STORAGE_KEY, logs)
}

function getWellnessScore(log: SymptomLog): number {
  const painNorm = log.pain / 10
  const fatigueNorm = log.fatigue / 6
  const nauseaNorm = log.nausea / 6
  const sleepNorm = 1 - log.sleep / 6
  const appetiteNorm = 1 - log.appetite / 6
  return (painNorm + fatigueNorm + nauseaNorm + (1 - sleepNorm) + (1 - appetiteNorm)) / 5
}

const NAUSEA_EMOJIS = ['😊', '🙂', '😐', '😬', '😕', '😵‍💫', '🤢', '🤕', '😩', '🥴', '🤮']

async function hapticTick() {
  try {
    const { Haptics } = await import('@capacitor/haptics')
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) await Haptics.selectionChanged()
  } catch { /* ignore */ }
}

const defaultLog = (date: string): SymptomLog => ({
  date,
  fatigue: 0,
  nausea: 0,
  pain: 0,
  sleep: 3,
  appetite: 3,
  bodySymptoms: {},
})

const BODY_PART_SYMPTOMS: Record<BodyPart, { key: keyof BodySymptoms; labelKey: string }[]> = {
  head: [
    { key: 'headache', labelKey: 'headache' },
    { key: 'dizziness', labelKey: 'dizziness' },
    { key: 'foggy', labelKey: 'foggy' },
  ],
  chest: [{ key: 'chestTight', labelKey: 'chestTight' }],
  stomach: [
    { key: 'abdominalNausea', labelKey: 'nausea' },
    { key: 'bloating', labelKey: 'bloating' },
    { key: 'stomachAche', labelKey: 'abdominalPain' },
  ],
  limbs: [{ key: 'limbPain', labelKey: 'limbPain' }],
}

export default function SymptomTracker() {
  const backTo = ((useLocation().state as { from?: string })?.from) ?? '/'
  const t = useTranslation()
  const locale = useLocale()
  const sym = t.symptoms as Record<string, string>
  const todayKey = new Date().toISOString().slice(0, 10)
  const [logs, setLogs] = useState<SymptomLog[]>(() => loadLogs())
  const [currentLog, setCurrentLog] = useState<SymptomLog>(() => {
    const existing = loadLogs().find((l) => l.date === todayKey)
    return existing ? { ...existing, date: todayKey } : defaultLog(todayKey)
  })
  const [view, setView] = useState<'form' | 'garden'>('form')
  const [activeBodyPart, setActiveBodyPart] = useState<BodyPart | null>(null)
  const [activeBodyRegion, setActiveBodyRegion] = useState<BodyRegionId | null>(null)
  const [showDailyWin, setShowDailyWin] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [lastHapticVal, setLastHapticVal] = useState<number>(-1)

  useEffect(() => {
    const existing = loadLogs().find((l) => l.date === todayKey)
    if (existing) setCurrentLog({ ...existing, date: todayKey })
  }, [todayKey])

  const persistLog = useCallback((log: SymptomLog) => {
    setCurrentLog(log)
    const updated = logs.filter((l) => l.date !== log.date)
    const newLogs = [...updated, log].sort((a, b) => b.date.localeCompare(a.date))
    setLogs(newLogs)
    saveLogs(newLogs)
  }, [logs])

  const updateLog = useCallback(
    (updates: Partial<SymptomLog>) => {
      const next = { ...currentLog, ...updates }
      persistLog(next)
    },
    [currentLog, persistLog]
  )

  const updateBodySymptom = useCallback(
    (key: keyof BodySymptoms, value: number) => {
      const body = { ...(currentLog.bodySymptoms ?? {}), [key]: value }
      updateLog({ bodySymptoms: body })
    },
    [currentLog.bodySymptoms, updateLog]
  )

  const handleSave = () => {
    persistLog(currentLog)
    const petals = ['#fcd5c8', '#e6d9f5', '#b8e6d5', '#fef3c7', '#fde68a', '#fce7f3', '#ddd6fe']
    confetti({
      particleCount: 60,
      spread: 120,
      origin: { x: 0.5, y: 0.6 },
      colors: petals,
      shapes: ['circle', 'circle', 'square'],
      startVelocity: 35,
      decay: 0.92,
    })
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.3, y: 0.5 },
        colors: petals,
        shapes: ['circle'],
        startVelocity: 25,
      })
    }, 80)
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.7, y: 0.5 },
        colors: petals,
        shapes: ['circle'],
        startVelocity: 25,
      })
    }, 150)
    setShowDailyWin(true)
    setTimeout(() => {
      setShowDailyWin(false)
      setView('garden')
    }, 2500)
  }

  const existingToday = logs.some((l) => l.date === todayKey)
  const hasHighPainThreeDays = (() => {
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))
    const dates = [...new Set(sorted.map((l) => l.date))]
    const logMap = Object.fromEntries(logs.map((l) => [l.date, l]))
    for (let i = 0; i <= dates.length - 3; i++) {
      const [d1, d2, d3] = [dates[i], dates[i + 1], dates[i + 2]]
      const diff1 = (new Date(d1).getTime() - new Date(d2).getTime()) / 86400000
      const diff2 = (new Date(d2).getTime() - new Date(d3).getTime()) / 86400000
      if (diff1 === 1 && diff2 === 1) {
        if ((logMap[d1]?.pain ?? 0) >= 7 && (logMap[d2]?.pain ?? 0) >= 7 && (logMap[d3]?.pain ?? 0) >= 7) return true
      }
    }
    return false
  })()

  const onReactionChange = (val: number, isPain: boolean) => {
    if (val !== lastHapticVal) {
      hapticTick()
      setLastHapticVal(val)
    }
    if (isPain) updateLog({ pain: val })
    else updateLog({ nausea: val })
  }

  return (
    <div className="min-h-dvh pb-safe px-4 pb-12 relative bg-[var(--color-bg)]">
      <div className="fixed inset-0 -z-10">
        <ImgWithFallback src={images.natureGreen} alt="" className="w-full h-full object-cover opacity-[0.08]" fallbackClassName="w-full h-full object-cover opacity-[0.08]" />
        <div className="absolute inset-0 bg-[var(--color-bg)]" />
      </div>

      <header className="header-safe flex items-center justify-between pb-4 px-1">
        <Link to={backTo} className="text-[var(--color-primary)] text-sm">
          ← {String(t.back ?? 'Back')}
        </Link>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">{String(sym.title)}</h1>
        <button
          type="button"
          onClick={() => setView(view === 'form' ? 'garden' : 'form')}
          className="text-sm text-[var(--color-primary)]"
        >
          {view === 'form' ? String(sym.history) : String(sym.today)}
        </button>
      </header>

      {view === 'form' && hasHighPainThreeDays && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50"
        >
          <p className="text-sm text-[var(--color-text)] mb-3">{String(sym.painCorrelationBanner)}</p>
          <Link to="/doctor" className="inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">
            {String(sym.painCorrelationAction)} →
          </Link>
        </motion.div>
      )}

      {view === 'garden' ? (
        <WellnessGarden
          logs={logs}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          sym={sym}
          locale={locale}
          getWellnessScore={getWellnessScore}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-sm text-[var(--color-text-secondary)]">{String(sym.tapBodyHint)}</p>

          {/* Interactive Body Map */}
          <div className="relative flex justify-center py-2 -my-2" onClick={() => { setActiveBodyPart(null); setActiveBodyRegion(null) }}>
            <BodyMap
              onSelectBodyPart={(regionId: BodyRegionId, logicalPart: BodyPart) => {
                const isClosing = activeBodyRegion === regionId
                setActiveBodyRegion(isClosing ? null : regionId)
                setActiveBodyPart(isClosing ? null : logicalPart)
              }}
              activePart={activeBodyPart}
              activeRegion={activeBodyRegion}
            />
            <AnimatePresence>
              {activeBodyPart && (
                <BodyPartMenu
                  part={activeBodyPart}
                  bodySymptoms={currentLog.bodySymptoms ?? {}}
                  onUpdate={updateBodySymptom}
                  onClose={() => { setActiveBodyPart(null); setActiveBodyRegion(null) }}
                  sym={sym}
                  locale={locale}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Energy Sun (Fatigue) */}
          <EnergySun
            value={currentLog.fatigue}
            onChange={(v) => updateLog({ fatigue: v })}
            label={String(sym.fatigue)}
            max={6}
          />

          {/* Pain Pal - cartoon heart */}
          <PainPal
            value={currentLog.pain}
            onChange={(v) => onReactionChange(v, true)}
            label={String(sym.pain)}
            max={10}
          />

          {/* Emoji Reaction Slider - Nausea */}
          <ReactionSlider
            value={currentLog.nausea}
            onChange={(v) => onReactionChange(v, false)}
            emojis={NAUSEA_EMOJIS}
            label={String(sym.nausea)}
            max={6}
          />

          {/* Sleep & Appetite - minimal */}
          <div className="grid grid-cols-2 gap-4">
            <CompactSlider
              label={String(sym.sleep)}
              value={currentLog.sleep}
              onChange={(v) => updateLog({ sleep: v })}
              max={6}
              sym={sym}
              labelsKey="sleepLabels"
            />
            <CompactSlider
              label={String(sym.appetite)}
              value={currentLog.appetite}
              onChange={(v) => updateLog({ appetite: v })}
              max={6}
              sym={sym}
              labelsKey="appetiteLabels"
            />
          </div>

          <div>
            <label className="text-sm text-[var(--color-text)] block mb-2">{String(sym.notes)}</label>
            <textarea
              placeholder={String(sym.notesPlaceholder)}
              value={currentLog.notes ?? ''}
              onChange={(e) => updateLog({ notes: e.target.value })}
              className="w-full p-3 rounded-2xl border border-[var(--color-border-subtle)] text-[var(--color-text)] placeholder:text-gray-400 resize-none bg-[var(--color-card)]"
              rows={2}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl font-semibold bg-[var(--color-primary)] text-white hover:opacity-95 transition-opacity"
          >
            {existingToday ? String(sym.updateRecord) : String(sym.saveRecord)}
          </button>
        </motion.div>
      )}

      {/* Daily Win overlay */}
      <AnimatePresence>
        {showDailyWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
          >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-3xl p-8 bg-white shadow-2xl max-w-sm text-center border border-slate-200"
            >
              <span className="text-5xl mb-4 block">✨</span>
              <p className="text-lg font-semibold text-slate-800 mb-2">{String(sym.saved)}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{String(sym.dailyWinMessage)}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BodyPartMenu({
  part,
  bodySymptoms,
  onUpdate,
  onClose,
  sym,
  locale,
}: {
  part: BodyPart
  bodySymptoms: BodySymptoms
  onUpdate: (k: keyof BodySymptoms, v: number) => void
  onClose: () => void
  sym: Record<string, string>
  locale: 'zh' | 'en'
}) {
  const items = BODY_PART_SYMPTOMS[part]
  const yPos = part === 'head' ? -120 : part === 'chest' ? -55 : part === 'stomach' ? 15 : 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{ top: `calc(50% + ${yPos}px)` }}
    >
      <div className="rounded-2xl bg-white/70 backdrop-blur-2xl border border-white/40 shadow-xl p-4 min-w-[200px]">
        {items.map(({ key, labelKey }) => (
          <div key={key} className="flex items-center justify-between gap-3 py-2 first:pt-0">
            <span className="text-sm text-[var(--color-text)]">{String(sym[labelKey] ?? labelKey)}</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onUpdate(key, v)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    (bodySymptoms[key] ?? 0) === v
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={onClose} className="text-xs text-[var(--color-primary)] mt-2">
          {locale === 'zh' ? '收起' : 'Close'}
        </button>
      </div>
    </motion.div>
  )
}

function EnergySun({ value, onChange, label, max }: { value: number; onChange: (v: number) => void; label: string; max: number }) {
  const pct = value / max
  const glowColor = pct < 0.5 ? '#f59e0b' : '#fde047'
  const face = pct < 0.33 ? 'sleepy' : pct < 0.66 ? 'neutral' : 'bright'

  return (
    <motion.div
      className="rounded-2xl p-5 bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="text-sm text-[var(--color-text)] mb-3">{label}</p>
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 35%, #fef9c3, ${glowColor})`,
              boxShadow: `0 0 40px ${glowColor}80`,
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {face === 'sleepy' && (
              <span className="text-2xl">😴</span>
            )}
            {face === 'neutral' && (
              <span className="text-2xl">🙂</span>
            )}
            {face === 'bright' && (
              <span className="text-2xl">☀️</span>
            )}
          </motion.div>
        </div>
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none accent-amber-400 bg-[var(--color-border-subtle)]"
          />
          <p className="text-xs text-[var(--color-text-secondary)] text-right">{value}/{max}</p>
        </div>
      </div>
    </motion.div>
  )
}

function PainPal({ value, onChange, label, max }: { value: number; onChange: (v: number) => void; label: string; max: number }) {
  const pct = value / max
  const heartColor = pct < 0.5 ? '#93c5fd' : pct < 0.8 ? '#fca5a5' : '#ef4444'
  const pulseDur = Math.max(0.6, 1.5 - pct * 1.2)

  return (
    <motion.div
      className="rounded-2xl p-5 bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="text-sm text-[var(--color-text)] mb-3">{label}</p>
      <div className="flex items-center gap-6">
        <motion.div
          className="w-16 h-16 shrink-0 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: pulseDur, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="48" height="44" viewBox="0 0 48 44" fill="none" className="drop-shadow-sm">
            <path
              d="M24 41S4 28 4 16C4 8 10 4 16 4c3 0 6 2 8 6 2-4 5-6 8-6 6 0 12 4 12 12 0 12-20 25-20 25z"
              fill={heartColor}
              stroke={heartColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none accent-red-400 bg-[var(--color-border-subtle)]"
          />
          <p className="text-xs text-[var(--color-text-secondary)] text-right">{value}/{max}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ReactionSlider({
  value,
  onChange,
  emojis,
  label,
  max,
}: {
  value: number
  onChange: (v: number) => void
  emojis: string[]
  label: string
  max: number
}) {
  const idx = Math.round((value / max) * (emojis.length - 1))
  const emoji = emojis[idx] ?? emojis[0]

  return (
    <div className="rounded-2xl p-5 bg-[var(--color-card)]/80 border border-[var(--color-border-subtle)]">
      <p className="text-sm text-[var(--color-text)] mb-3">{label}</p>
      <div className="flex items-center gap-4">
        <motion.span
          key={emoji}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl w-14 text-center shrink-0"
        >
          {emoji}
        </motion.span>
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-3 rounded-full appearance-none bg-[var(--color-border-subtle)] accent-[var(--color-primary)]"
        />
        <span className="text-sm font-medium text-[var(--color-primary)] w-8">{value}</span>
      </div>
    </div>
  )
}

function CompactSlider({
  label,
  value,
  onChange,
  max,
  sym,
  labelsKey,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  max: number
  sym: Record<string, string | string[]>
  labelsKey: string
}) {
  const labels = (sym[labelsKey] as string[]) ?? []
  return (
    <div className="rounded-2xl p-4 bg-[var(--color-card)]/80 border border-[var(--color-border-subtle)]">
      <p className="text-sm text-[var(--color-text)] mb-2">{label}</p>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full accent-[var(--color-primary)]"
      />
      <p className="text-xs text-[var(--color-primary)] mt-1">{labels[value] ?? value}</p>
    </div>
  )
}

function WellnessGarden({
  logs,
  selectedDate,
  setSelectedDate,
  sym,
  locale,
  getWellnessScore,
}: {
  logs: SymptomLog[]
  selectedDate: string | null
  setSelectedDate: (d: string | null) => void
  sym: Record<string, string>
  locale: 'zh' | 'en'
  getWellnessScore: (l: SymptomLog) => number
}) {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))
  const logByDate = Object.fromEntries(logs.map((l) => [l.date, l]))

  const flowerColor = (score: number) => {
    if (score < 0.33) return { fill: '#4ade80', stroke: '#22c55e' }
    if (score < 0.66) return { fill: '#fbbf24', stroke: '#f59e0b' }
    return { fill: '#f87171', stroke: '#ef4444' }
  }

  const flowerSize = (score: number) => 32 + (1 - score) * 24

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-secondary)]">{locale === 'zh' ? '轻触花朵查看当日摘要' : 'Tap a flower for that day\'s summary'}</p>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {sorted.map((log) => {
          const score = getWellnessScore(log)
          const { fill, stroke } = flowerColor(score)
          const size = flowerSize(score)
          const isSelected = selectedDate === log.date
          return (
            <motion.button
              key={log.date}
              type="button"
              onClick={() => setSelectedDate(isSelected ? null : log.date)}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                isSelected ? 'bg-[var(--color-card)] ring-2 ring-[var(--color-primary)]' : 'bg-[var(--color-card)]/60'
              }`}
            >
              <svg width={size} height={size * 1.2} viewBox="0 0 48 64" className="overflow-visible">
                <ellipse cx="24" cy="56" rx="8" ry="6" fill={stroke} />
                <ellipse cx="24" cy={32} rx="12" ry="14" fill={fill} opacity="0.9" />
                <circle cx="20" cy="28" r="3" fill="white" opacity="0.6" />
                <circle cx="28" cy="30" r="2" fill="white" opacity="0.5" />
              </svg>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {log.date.slice(5).replace('-', '/')}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedDate && logByDate[selectedDate] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl p-6 bg-[var(--color-card)]/95 backdrop-blur-xl border border-[var(--color-border-subtle)] shadow-lg"
          >
            <p className="font-medium text-[var(--color-text)] mb-4">{selectedDate.replace(/-/g, '/')}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span>{String(sym.fatigue)} {logByDate[selectedDate].fatigue}/6</span>
              <span>{String(sym.nausea)} {logByDate[selectedDate].nausea}/6</span>
              <span>{String(sym.pain)} {logByDate[selectedDate].pain}/10</span>
              <span>{String(sym.sleep)} {logByDate[selectedDate].sleep}/6</span>
              <span>{String(sym.appetite)} {logByDate[selectedDate].appetite}/6</span>
            </div>
            {logByDate[selectedDate].notes && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
                {logByDate[selectedDate].notes}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {logs.length === 0 && (
        <p className="text-center text-[var(--color-text-secondary)] py-12">{String(sym.noRecords)}</p>
      )}
    </div>
  )
}
