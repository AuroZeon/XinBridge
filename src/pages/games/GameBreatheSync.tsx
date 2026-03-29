/**
 * Breathe-Sync Pulse - Glowing orb expands/contracts. Tap in sync to create ripple effect.
 * Mission: 10 Perfect Rhythm taps (within 100ms of pulse)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { selectionPulse } from '../../utils/zenHaptics'
import { playZenBell } from '../../utils/zenTone'
import type { MissionId } from '../../hooks/useMissions'

const CYCLE_MS = 4000
const PERFECT_WINDOW_MS = 100

interface GameBreatheSyncProps {
  locale: 'zh' | 'en'
  freeMode?: boolean
  reportProgress?: (id: MissionId, value: number) => void
  onMissionComplete?: (id: MissionId, label: string) => void
  onExit?: () => void
}

export default function GameBreatheSync({ locale, freeMode, reportProgress, onMissionComplete, onExit }: GameBreatheSyncProps) {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'exhale'>('idle')
  const [ripples, setRipples] = useState<{ id: number; scale: number }[]>([])
  const [breaths, setBreaths] = useState(0)
  const [syncTap, setSyncTap] = useState(false)
  const [perfectStreak, setPerfectStreak] = useState(0)
  const phaseRef = useRef(true)
  const rippleId = useRef(0)
  const pulseTimeRef = useRef(0)

  const start = useCallback(() => {
    setPhase('inhale')
    phaseRef.current = true
    setBreaths(0)
    setPerfectStreak(0)
    pulseTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (phase === 'idle') return
    const id = setInterval(() => {
      pulseTimeRef.current = Date.now()
      phaseRef.current = !phaseRef.current
      setPhase(phaseRef.current ? 'inhale' : 'exhale')
      if (phaseRef.current) setBreaths((b) => b + 1)
    }, CYCLE_MS)
    return () => clearInterval(id)
  }, [phase])

  const handleTap = useCallback(() => {
    selectionPulse()
    if (phase === 'idle') return
    const now = Date.now()
    const elapsed = Math.abs(now - pulseTimeRef.current)
    const isPerfect = elapsed < PERFECT_WINDOW_MS || (elapsed > CYCLE_MS - PERFECT_WINDOW_MS)
    const scale = phaseRef.current ? 1.15 : 0.75
    setSyncTap(true)
    setTimeout(() => setSyncTap(false), 200)
    setRipples((r) => [...r.slice(-4), { id: ++rippleId.current, scale }])
    playZenBell(isPerfect ? 523.25 : 440, 0.12)
    if (isPerfect) {
      const next = perfectStreak + 1
      setPerfectStreak(next)
      if (!freeMode && reportProgress) reportProgress('breathe-perfect-10', next)
      if (!freeMode && onMissionComplete && next === 10) {
        onMissionComplete('breathe-perfect-10', locale === 'zh' ? '10 次完美节奏点击' : '10 Perfect Rhythm Taps')
      }
    } else {
      setPerfectStreak(0)
    }
    setTimeout(() => {
      setRipples((r) => r.filter((x) => x.id !== rippleId.current))
    }, 1200)
  }, [phase, perfectStreak, freeMode, reportProgress, onMissionComplete, locale])

  const [size, setSize] = useState(() => ({ w: 400, h: 600 }))
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const orbSize = Math.min(160, Math.min(size.w, size.h) * 0.35)
  const rippleSize = orbSize * 0.5

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a0c] pt-safe">
      <button
        type="button"
        onClick={onExit}
        className="absolute top-safe right-4 z-10 px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm"
      >
        ← {locale === 'zh' ? '退出' : 'Exit'}
      </button>

      <p className="absolute top-safe left-4 right-16 text-sm text-white/60 text-center">
        {locale === 'zh' ? '跟随节奏轻触，与呼吸同步' : 'Tap in sync with the breath'}
      </p>

      <div
        className="relative flex items-center justify-center cursor-pointer select-none flex-1 w-full"
        onClick={handleTap}
        onKeyDown={(e) => e.key === 'Enter' && handleTap()}
        role="button"
        tabIndex={0}
        aria-label={locale === 'zh' ? '点击同步' : 'Tap to sync'}
      >
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="absolute rounded-full border-2 border-amber-400/50"
            style={{ width: rippleSize, height: rippleSize }}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        ))}
        {phase === 'idle' ? (
          <button
            onClick={(e) => { e.stopPropagation(); start() }}
            className="rounded-full bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300/90 text-sm font-medium"
            style={{ width: orbSize * 0.6, height: orbSize * 0.6 }}
          >
            {locale === 'zh' ? '开始' : 'Start'}
          </button>
        ) : (
          <motion.div
            className={`rounded-full border-2 ${
              syncTap ? 'bg-amber-400/60 border-amber-300' : 'bg-amber-500/40 border-amber-400/50'
            }`}
            style={{ width: orbSize, height: orbSize, boxShadow: '0 0 40px rgba(251,191,36,0.3)' }}
            animate={{ scale: phase === 'inhale' ? 1.2 : 0.75 }}
            transition={{ duration: CYCLE_MS / 1000, ease: 'easeInOut' }}
          />
        )}
      </div>
      {breaths > 0 && (
        <p className="pb-8 text-sm text-amber-400/80">
          {locale === 'zh' ? `${breaths} 次呼吸` : `${breaths} breath${breaths === 1 ? '' : 's'}`}
        </p>
      )}
    </div>
  )
}
