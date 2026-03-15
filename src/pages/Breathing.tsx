import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/context'
import { images } from '../data/mediaAssets'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

type Phase = 'inhale' | 'hold' | 'exhale'

const PHASE_DURATIONS = { inhale: 4000, hold: 2000, exhale: 4000 }
const CYCLE_MS = 10000

interface BreathingProps {
  mode?: 'coolDown' | 'normal'
}

export default function Breathing({ mode = 'normal' }: BreathingProps) {
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

        if (elapsed < PHASE_DURATIONS.inhale) {
          setPhase('inhale')
        } else if (elapsed < PHASE_DURATIONS.inhale + PHASE_DURATIONS.hold) {
          setPhase('hold')
        } else if (elapsed < CYCLE_MS) {
          setPhase('exhale')
        } else {
          setCount((c) => c + 1)
          cycleStartRef.current = now
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
        <img src={images.softClouds} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[var(--color-bg)]/90" />
      </div>

      {isCoolDown && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-[var(--color-mood-angry)]/20 border-l-4 border-[var(--color-mood-angry)] animate-fade-in">
          <p className="font-semibold text-[var(--color-mood-angry)]">{String(br.coolDownBanner)}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{String(br.coolDownSubtext)}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        {!isActive ? (
          <div className="flex flex-col items-center max-w-md animate-fade-in">
            <div className="w-32 h-32 rounded-full bg-[var(--color-primary-subtle)] flex items-center justify-center mb-6 animate-gentle-float">
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/30 animate-soft-pulse" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2 text-center">
              {String(br.title)}
            </h1>
            <p className="text-center text-[var(--color-text-secondary)] text-sm leading-6 mb-2">
              {isCoolDown ? String(br.coolDownInstruction) : String(br.instruction)}
            </p>
            <p className="text-sm text-[var(--color-primary)] font-medium mb-6 text-center">
              {String(br.followHint)}
            </p>
            <button
              onClick={() => setPreparing(true)}
              className="bg-[var(--color-primary)] text-white py-3.5 px-10 rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {String(br.start)}
            </button>
          </div>
        ) : preparing ? (
          <div className="flex flex-col items-center animate-fade-in">
            <p className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">
              {String(br.getReady)}
            </p>
            <div className="w-32 h-32 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mb-6">
              <span
                key={countdown}
                className="text-6xl font-bold text-[var(--color-primary)] tabular-nums"
                style={{ animation: 'countdown-pop 0.5s ease-out' }}
              >
                {countdown}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {typeof br.beginIn === 'function' ? br.beginIn(countdown) : `${countdown}...`}
            </p>
            <button
              onClick={() => { setPreparing(false); setCountdown(0); }}
              className="mt-8 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition"
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
                  className="text-[var(--color-primary)]/15"
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
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-primary-light)]/90 flex items-center justify-center shadow-[0_0_50px_rgba(13,148,136,0.35)]"
                  style={{
                    transform: phase === 'inhale' ? 'scale(1.3)' : phase === 'hold' ? 'scale(1.3)' : 'scale(0.65)',
                    transition: phase === 'inhale'
                      ? 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)'
                      : phase === 'hold'
                        ? 'transform 0.15s ease'
                        : 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            {/* Phase label - large and clear */}
            <p className="text-2xl font-bold text-[var(--color-primary)] mb-1 min-h-[2.5rem] flex items-center justify-center">
              {phaseLabels[phase]}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              {typeof br.completedCount === 'function' ? br.completedCount(count) : `${count}`}
            </p>

            <button
              onClick={() => setIsActive(false)}
              className="px-8 py-3 rounded-xl text-[var(--color-text-secondary)] hover:bg-black/5 transition"
            >
              {String(br.pause)}
            </button>
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <Link to="/" className="text-[var(--color-primary)] text-sm font-medium">← {String(t.back)}</Link>
        <LanguageSwitcher />
      </div>
    </div>
  )
}
