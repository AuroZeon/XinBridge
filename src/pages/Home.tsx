import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getItem, setItem } from '../utils/storage'
import { useTranslation } from '../i18n/context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { HeartHandshake, ChevronRight } from '../components/icons'
import { images, menuImages } from '../data/mediaAssets'

const menuIds = ['mood', 'chat', 'symptoms', 'doctor', 'breathing', 'sleep', 'caregiver', 'hope'] as const
const menuPaths: Record<string, string> = {
  mood: '/mood', chat: '/chat', symptoms: '/symptoms', doctor: '/doctor',
  breathing: '/breathing', sleep: '/sleep', caregiver: '/caregiver', hope: '/hope',
}

export default function Home() {
  const t = useTranslation()
  const [nextTreatment, setNextTreatment] = useState('')
  const [showDateInput, setShowDateInput] = useState(false)

  useEffect(() => {
    setNextTreatment(getItem<string>('nextTreatment', ''))
  }, [])

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
    <div className="min-h-dvh pt-safe pb-safe pb-16 overflow-x-hidden bg-[var(--color-bg)]">
      {/* Hero - dark background, high-contrast white text */}
      <header className="relative -mx-4 mb-0 overflow-hidden">
        {/* Dark gradient - no image, consistent contrast */}
        <div
          className="absolute inset-0 h-52 min-h-[200px]"
          style={{
            background: 'linear-gradient(155deg, #0c4a3e 0%, #0f766e 35%, #0d9488 70%, #0f766e 100%)',
          }}
        />
        {/* Subtle accent - soft glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }}
        />
        {/* Content - white text, strong contrast */}
        <div className="relative z-20 flex flex-col justify-end px-5 pt-12 pb-6">
          <div className="absolute top-4 right-4 z-30">
            <LanguageSwitcher variant="light" />
          </div>
          <h1
            className="font-bold text-white tracking-tight animate-fade-in-up"
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
              lineHeight: 1.15,
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            {String(home.title)}
          </h1>
          <p
            className="text-white text-sm font-medium mt-2 max-w-md animate-fade-in-up stagger-1"
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              textShadow: '0 1px 3px rgba(0,0,0,0.25)',
            }}
          >
            {String(home.tagline)}
          </p>
        </div>
        {/* Wavy bottom - organic non-linear breakline */}
        <div className="absolute -bottom-px left-0 right-0 w-full leading-[0]" style={{ color: 'var(--color-bg)' }}>
          <svg
            viewBox="0 0 1440 72"
            preserveAspectRatio="none"
            className="block w-full h-10"
          >
            <path
              fill="currentColor"
              d="M0,36 Q360,0 720,36 T1440,36 L1440,72 L0,72 Z"
            />
          </svg>
        </div>
      </header>

      <div className="px-4 pt-2 space-y-4">
        {/* SOS - subtle urgency */}
        <Link
          to="/sos"
          className="block relative overflow-hidden rounded-xl border border-white/80 bg-white p-4 card-interactive animate-fade-in-up stagger-2"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <img src={images.warmSunset} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
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

        {/* Treatment countdown */}
        <div
          className="relative overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-white p-4 card-interactive animate-fade-in-up stagger-3"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <img src={images.morningLight} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-white/95" />
          <div className="relative z-10">
            {showDateInput ? (
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-2">
                  {String(home.setNextTreatment)}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={nextTreatment}
                    onChange={(e) => setNextTreatment(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                  <button
                    onClick={saveNextTreatment}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    {String(t.save)}
                  </button>
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

        {/* Menu - clean cards */}
        <nav className="space-y-3">
          {menuIds.map((id, i) => (
            <Link
              key={id}
              to={menuPaths[id]}
              className="group block overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-white card-interactive animate-fade-in-up"
              style={{
                animationDelay: `${0.15 + i * 0.04}s`,
                animationFillMode: 'forwards',
                opacity: 0,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="relative flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={menuImages[id] ?? images.natureGreen}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-[var(--color-text)] text-[15px]">{menu[id]?.title ?? ''}</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 truncate">{menu[id]?.subtitle ?? ''}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-text-muted)]" strokeWidth={2} />
              </div>
            </Link>
          ))}
        </nav>

        <p className="pt-6 text-center text-xs text-[var(--color-text-muted)]">
          {String(home.footer)}
        </p>
        <p className="text-center text-[10px] text-[var(--color-text-muted)]">
          Photos by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-primary)]">Pexels</a>
        </p>
      </div>
    </div>
  )
}
