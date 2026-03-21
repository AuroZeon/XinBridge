import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { setItem } from '../utils/storage'
import { useTranslation } from '../i18n/context'
import { images } from '../data/mediaAssets'

type Phase = 'inhale' | 'hold' | 'exhale'

const PHASE_DURATIONS = { inhale: 4000, hold: 2000, exhale: 4000 }

function triggerHaptic(style: ImpactStyle) {
  if (!Capacitor.isNativePlatform()) return
  Haptics.impact({ style }).catch(() => {})
}
const CYCLE_MS = 10000

interface BreathingProps {
  mode?: 'coolDown' | 'normal'
}

export default function Breathing({ mode = 'normal' }: BreathingProps) {
  const backTo = ((useLocation().state as { from?: string })?.from) ?? '/'
  const t = useTranslation()
  const br = t.breathing as Record<string, string | ((n: number) => string)>
  const isCoolDown = mode === 'coolDown'

  const [phase, setPhase] = useState<Phase>('inhale')
  const [count, setCount] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [cycleProgress, setCycleProgress] = useState(0)
  const cycleStartRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const prevPhaseRef = useRef<Phase | null>(null)

  const PREP_SECONDS = 5

  useEffect(() => {
    if (!preparing) return
    setCountdown(PREP_SECONDS)
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          setPreparing(false)
          setIsActive(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [preparing])

  useEffect(() => {
    if (!isActive) return

    const runCycle = () => {
      cycleStartRef.current = performance.now()

      const animate = (now: number) => {
        const elapsed = now - cycleStartRef.current
        const progress = Math.min(elapsed / CYCLE_MS, 1)
        setCycleProgress(progress * 100)

        if (elapsed >= CYCLE_MS) {
          setCount((c) => {
            const next = c + 1
            if (next >= 1) setItem('breathingDoneDate', new Date().toISOString().slice(0, 10))
            return next
          })
          cycleStartRef.current = now
          prevPhaseRef.current = null
        } else {
          let nextPhase: Phase
          if (elapsed < PHASE_DURATIONS.inhale) nextPhase = 'inhale'
          else if (elapsed < PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold) nextPhase = 'hold'
          else nextPhase = 'exhale'
          if (prevPhaseRef.current !== nextPhase) {
            if (nextPhase === 'inhale') triggerHaptic(ImpactStyle.Light)
            else if (nextPhase === 'exhale') triggerHaptic(ImpactStyle.Medium)
            prevPhaseRef.current = nextPhase
          }
          setPhase(nextPhase)
        }
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    runCycle()
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive])

  const phaseLabels: Record<Phase, string> = {
    inhale: isCoolDown ? String(br.inhaleSlow) : String(br.inhale),
    hold: String(br.hold),
    exhale: isCoolDown ? String(br.exhaleSlow) : String(br.exhale),
  }

  return (
    <div className="min-h-dvh pt-safe pb-safe relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={images.softClouds} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/95 via-[var(--color-bg)]/92 to-[var(--color-primary-subtle)]/20" />
      </div>

      {isCoolDown && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-[var(--color-mood-angry)]/20 border-l-4 border-[var(--color-mood-angry)] animate-fade-in">
          <p className="font-semibold text-[var(--color-mood-angry)]">{String(br.coolDownBanner)}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{String(br.coolDownSubtext)}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        {!isActive && !preparing ? (
          <div className="flex flex-col items-center max-w-md animate-fade-in">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[var(--color-primary-subtle)] to-[var(--color-primary-muted)]/30 flex items-center justify-center mb-8 animate-gentle-float shadow-[0_8px_32px_rgba(13,148,136,0.12)]">
              <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/25 animate-soft-pulse" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1.5 text-center tracking-tight">
              {String(br.title)}
            </h1>
            {br.subtitle && (
              <p className="text-center text-[var(--color-text-secondary)]/90 text-sm leading-relaxed mb-5 max-w-xs">
                {String(br.subtitle)}
              </p>
            )}
            <p className="text-center text-[var(--color-text-secondary)] text-[15px] leading-6 mb-4">
              {isCoolDown ? String(br.coolDownInstruction) : String(br.instruction)}
            </p>
            <p className="text-sm text-[var(--color-primary)]/90 font-medium mb-8 text-center">
              {String(br.followHint)}
            </p>
            <button
              onClick={() => setPreparing(true)}
              className="bg-[var(--color-primary)] text-white py-4 px-12 rounded-2xl font-medium text-[15px] shadow-[0_4px_14px_rgba(13,148,136,0.35)] hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.4)] active:scale-[0.98] transition-all duration-200"
            >
              {String(br.start)}
            </button>
          </div>
        ) : preparing ? (
          <div className="flex flex-col items-center animate-fade-in">
            <p className="text-xl font-medium text-[var(--color-text)] mb-6 text-center">
              {String(br.getReady)}
            </p>
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[var(--color-primary-subtle)] to-[var(--color-primary-muted)]/40 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(13,148,136,0.15)]">
              <span
                key={countdown}
                className="text-7xl font-bold text-[var(--color-primary)] tabular-nums"
                style={{ animation: 'countdown-pop 0.5s ease-out' }}
              >
                {countdown}
              </span>
            </div>
            <p className="text-[15px] text-[var(--color-text-secondary)] text-center max-w-xs">
              {typeof br.beginIn === 'function' ? br.beginIn(countdown) : `${countdown}...`}
            </p>
            <button
              onClick={() => { setPreparing(false); setCountdown(0); }}
              className="mt-10 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              {String(br.cancel)}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-sm animate-fade-in">
            {/* Progress ring */}
            <div className="relative mb-8">
              <svg className="w-56 h-56 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-[var(--color-primary)]/12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={283}
                  strokeDashoffset={283 - (283 * cycleProgress) / 100}
                  className="text-[var(--color-primary)] transition-all duration-100"
                />
              </svg>

              {/* Breathing circle - grows/shrinks with your breath */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-primary-light)]/95 flex items-center justify-center shadow-[0_0_60px_rgba(13,148,136,0.4)]"
                  style={{
                    transform: phase === 'inhale' ? 'scale(1.3)' : phase === 'hold' ? 'scale(1.3)' : 'scale(0.65)',
                    transition: phase === 'inhale'
                      ? 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)'
                      : phase === 'hold'
                        ? 'transform 0.15s ease'
                        : 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/50" />
                </div>
              </div>
            </div>

            {/* Phase label - large and clear */}
            <p className="text-2xl font-semibold text-[var(--color-primary)] mb-1 min-h-[2.5rem] flex items-center justify-center">
              {phaseLabels[phase]}
            </p>
            <p className="text-[15px] text-[var(--color-text-secondary)] mb-8">
              {typeof br.completedCount === 'function' ? br.completedCount(count) : `${count}`}
            </p>

            <button
              onClick={() => setIsActive(false)}
              className="px-10 py-3.5 rounded-2xl text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-subtle)]/50 hover:text-[var(--color-primary)] transition-colors"
            >
              {String(br.pause)}
            </button>
          </div>
        )}
      </div>

      <div className="absolute top-safe left-4 right-4 flex justify-between items-center">
        <Link to={backTo} className="text-[var(--color-primary)] text-sm font-medium">← {String(t.back)}</Link>
      </div>
    </div>
  )
}
