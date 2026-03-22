import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getItem, setItem } from '../utils/storage'
import { useTranslation, useLocale } from '../i18n/context'
import { HeartHandshake, ChevronRight } from '../components/icons'
import { images, logo, menuImages } from '../data/mediaAssets'
import { ImgWithFallback } from '../components/ImgWithFallback'
import { getWisdomPills } from '../data/wisdomPills'
import { getContextualGreeting } from '../data/contextualGreeting'
import { useWellnessProgress } from '../hooks/useWellnessProgress'

const menuIds = ['mood', 'chat', 'symptoms', 'doctor', 'breathing', 'sleep', 'caregiver', 'hope', 'games'] as const
const menuPaths: Record<string, string> = {
  mood: '/mood', chat: '/chat', symptoms: '/symptoms', doctor: '/doctor',
  breathing: '/breathing', sleep: '/sleep', caregiver: '/caregiver', hope: '/hope', games: '/games',
}

function getHour(): number {
  return new Date().getHours()
}

export default function Home() {
  const t = useTranslation()
  const locale = useLocale()
  const [nextTreatment, setNextTreatment] = useState('')
  const [showDateInput, setShowDateInput] = useState(false)
  const [hour, setHour] = useState(getHour)
  const [expanded, setExpanded] = useState(false)

  const { moodDone, symptomDone, breathingDone, completed, progress } = useWellnessProgress()
  const wisdomPills = getWisdomPills(locale)

  const symptomLogs = getItem<{ date: string; pain?: number; fatigue?: number }[]>('symptoms', [])
  const { greeting, subtitle } = getContextualGreeting(hour, locale, symptomLogs)

  useEffect(() => {
    setNextTreatment(getItem<string>('nextTreatment', ''))
  }, [])

  useEffect(() => {
    const id = setInterval(() => setHour(getHour()), 60000)
    return () => clearInterval(id)
  }, [])

  const isNight = hour >= 23 || hour < 5
  const isMorning = hour >= 6 && hour < 11
  const isNightWatchman = hour >= 1 && hour < 4
  const nightCollapsed = isNight && !expanded
  const visibleMenuIds = isNightWatchman && !expanded
    ? (['sleep', 'chat'] as const)
    : nightCollapsed
      ? (['sleep'] as const)
      : menuIds

  const saveNextTreatment = () => {
    setItem('nextTreatment', nextTreatment)
    setShowDateInput(false)
  }

  const daysUntil = (): number | null => {
    if (!nextTreatment) return null
    const target = new Date(nextTreatment)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const days = daysUntil()
  const home = t.home as Record<string, string | ((n: number) => string)>
  const menu = t.menu as Record<string, { title: string; subtitle: string }>
  const daysText = days !== null
    ? (days > 0 ? (home.daysLeftMore as (n: number) => string)(days) : days === 0 ? (home.daysLeftToday as string) : (home.daysLeftPast as string))
    : ''

  return (
    <div
      className={`min-h-dvh pt-safe pb-safe pb-16 overflow-x-hidden transition-colors duration-500 relative ${
        isNight ? 'night-filter bg-[#1a1f2e]' : 'bg-[var(--color-bg)]'
      }`}
    >
      {/* Night Watchman dim overlay (1–4 AM) */}
      {isNightWatchman && (
        <div
          className="absolute inset-0 z-[100] pointer-events-none bg-black/40 transition-opacity duration-500"
          aria-hidden="true"
        />
      )}
      {/* Hope Ticker - micro-pills of wisdom */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[var(--color-primary)]/10 py-2.5">
        <div className="flex w-max animate-ticker whitespace-nowrap gap-8 px-4">
          {(wisdomPills.concat(wisdomPills)).map((pill, i) => (
            <span key={i} className="text-sm text-[var(--color-text-secondary)] font-medium">
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <header className="relative -mx-4 mb-0 overflow-hidden">
        <ImgWithFallback src={images.heroSunrise} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0 min-h-[200px]"
          style={{
            background: 'linear-gradient(155deg, rgba(12,74,62,0.92) 0%, rgba(15,118,110,0.88) 40%, rgba(13,148,136,0.85) 70%, rgba(15,118,110,0.9) 100%)',
          }}
        />
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-[15%] w-2 h-2 rounded-full bg-white/30 animate-soft-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-16 right-[20%] w-1.5 h-1.5 rounded-full bg-white/25 animate-gentle-float" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="relative z-20 flex flex-col justify-end px-6 pt-12 pb-10 min-h-[180px]">
          <img src={logo} alt="XinBridge" className="w-14 h-14 rounded-full object-contain bg-white/10 backdrop-blur-sm mb-3 animate-gentle-scale-in shadow-lg" />
          <h1 className="font-bold text-white tracking-tight animate-fade-in-up" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', lineHeight: 1.2 }}>
            {greeting}. {String(home.title)}
          </h1>
          <p className="text-white/95 text-sm font-medium mt-2 max-w-md leading-relaxed animate-fade-in-up stagger-1" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            {subtitle}
          </p>
        </div>
        <div className="absolute -bottom-px left-0 right-0 w-full leading-[0]" style={{ color: isNight ? '#1a1f2e' : 'var(--color-bg)' }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="block w-full h-12">
            <path fill="currentColor" d="M0,50 C240,10 480,90 720,50 C960,10 1200,90 1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </header>

      <div className="px-4 pt-2 space-y-4">
        {/* Wellness Circle - or Empty State */}
        {completed === 0 ? (
          <div className="flex flex-col items-center py-10 px-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-[var(--color-border-subtle)] animate-fade-in">
            <BridgeQuietSVG />
            <p className="mt-6 text-center text-[var(--color-text)] font-medium leading-relaxed max-w-xs">
              {String(home.emptyState)}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 card-interactive animate-fade-in-up">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">{String(home.wellnessCircle)}</p>
            <WellnessCircle
              moodDone={moodDone}
              symptomDone={symptomDone}
              breathingDone={breathingDone}
              progress={progress}
              moodLabel={String(home.wellnessMood)}
              symptomLabel={String(home.wellnessSymptoms)}
              breathingLabel={String(home.wellnessBreathing)}
            />
          </div>
        )}

        {/* SOS - always visible */}
        <Link
          to="/sos"
          className="block relative overflow-hidden rounded-xl border border-white/80 bg-white p-4 card-interactive animate-fade-in-up"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <ImgWithFallback src={images.warmSunset} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm">
              <HeartHandshake className="h-5 w-5 text-[var(--color-mood-angry)]" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--color-text)] text-[15px]">{String(home.sosTitle)}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{String(home.sosSubtitle)}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-text-muted)]" strokeWidth={2} />
          </div>
        </Link>

        {/* Treatment - hidden in night collapsed */}
        {!nightCollapsed && (
          <div className="relative overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-white p-4 card-interactive animate-fade-in-up" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <ImgWithFallback src={images.morningLight} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-white/95" />
            <div className="relative z-10">
              {showDateInput ? (
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-2">{String(home.setNextTreatment)}</label>
                  <div className="flex gap-2">
                    <input type="date" value={nextTreatment} onChange={(e) => setNextTreatment(e.target.value)} className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
                    <button onClick={saveNextTreatment} className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">{String(t.save)}</button>
                  </div>
                </div>
              ) : days !== null ? (
                <button onClick={() => setShowDateInput(true)} className="w-full text-left">
                  <p className="text-sm text-[var(--color-text-secondary)]">{String(home.nextTreatment)}</p>
                  <p className="text-lg font-semibold text-[var(--color-primary)] mt-0.5">{daysText}</p>
                </button>
              ) : (
                <button onClick={() => setShowDateInput(true)} className="w-full text-left">
                  <p className="text-sm text-[var(--color-text-secondary)]">{String(home.setNextTreatment)}</p>
                  <p className="text-[var(--color-primary)] font-medium mt-0.5 text-sm">{String(home.clickToSet)}</p>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Menu cards */}
        <nav className="space-y-3">
          {visibleMenuIds.map((id, i) => {
            const isHighlight = isMorning && (id === 'mood' || id === 'symptoms')
            return (
              <Link
                key={id}
                to={menuPaths[id]}
                className={`group block overflow-hidden rounded-xl border bg-white card-interactive animate-fade-in-up ${
                  isHighlight ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30' : 'border-[var(--color-border-subtle)]'
                }`}
                style={{
                  animationDelay: `${0.1 + i * 0.03}s`,
                  animationFillMode: 'forwards',
                  opacity: 0,
                  boxShadow: isHighlight ? '0 4px 14px rgba(13,148,136,0.2)' : 'var(--shadow-sm)',
                }}
              >
                <div className="relative flex items-center gap-4 p-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <ImgWithFallback src={menuImages[id] ?? images.natureGreen} alt="" className="h-full w-full object-cover" fallbackClassName="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-[var(--color-text)] text-[15px]">{menu[id]?.title ?? ''}</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 truncate">{menu[id]?.subtitle ?? ''}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-text-muted)]" strokeWidth={2} />
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Show more / less - night mode */}
        {isNight && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-3 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            {expanded ? String(home.showLess) : String(home.showMore)}
          </button>
        )}

        <p className="pt-6 text-center text-xs text-[var(--color-text-muted)]">{String(home.footer)}</p>
      </div>
    </div>
  )
}

function WellnessCircle({ moodDone, symptomDone, breathingDone, progress, moodLabel, symptomLabel, breathingLabel }: { moodDone: boolean; symptomDone: boolean; breathingDone: boolean; progress: number; moodLabel: string; symptomLabel: string; breathingLabel: string }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const seg = circ / 3
  const moodLen = moodDone ? seg : 0
  const symptomLen = symptomDone ? seg : 0
  const breathingLen = breathingDone ? seg : 0

  return (
    <div className="flex items-center justify-center gap-6">
      <svg width={120} height={120} className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border-subtle)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray={`${moodLen} ${circ - moodLen}`} strokeDashoffset={0} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray={`${symptomLen} ${circ - symptomLen}`} strokeDashoffset={-moodLen} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray={`${breathingLen} ${circ - breathingLen}`} strokeDashoffset={-(moodLen + symptomLen)} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div className="text-sm text-[var(--color-text-secondary)]">
        <p className="font-medium text-[var(--color-text)]">{Math.round(progress * 100)}%</p>
        <p>{moodDone ? '✓' : '○'} {moodLabel}</p>
        <p>{symptomDone ? '✓' : '○'} {symptomLabel}</p>
        <p>{breathingDone ? '✓' : '○'} {breathingLabel}</p>
      </div>
    </div>
  )
}

function BridgeQuietSVG() {
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" fill="none" className="text-[var(--color-primary)]/40">
      <path
        d="M20 80 Q80 50 140 80"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <circle cx="40" cy="70" r="6" fill="currentColor" opacity="0.5" className="animate-soft-pulse" />
      <circle cx="80" cy="60" r="5" fill="currentColor" opacity="0.4" className="animate-soft-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="120" cy="70" r="6" fill="currentColor" opacity="0.5" className="animate-soft-pulse" style={{ animationDelay: '1s' }} />
    </svg>
  )
}
