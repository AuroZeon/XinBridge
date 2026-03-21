/**
 * Night Sanctuary Breathing Orb - framer-motion
 * Inhale 4s → Hold 2s → Exhale 6s. Slow by 5% every 3 cycles.
 */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const INHALE_MS = 4000
const HOLD_MS = 2000
const EXHALE_MS = 6000
const SLOW_FACTOR = 0.95
const CYCLES_BEFORE_SLOW = 3

type Phase = 'inhale' | 'hold' | 'exhale'

async function hapticSelection() {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) await Haptics.selectionChanged()
  } catch { /* ignore */ }
}

async function hapticImpactLight() {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) await Haptics.impact({ style: ImpactStyle.Light })
  } catch { /* ignore */ }
}

export function BreathingOrb() {
  const [, setPhase] = useState<Phase>('inhale')
  const [scale, setScale] = useState(1)
  const [opacity, setOpacity] = useState(0.3)
  const [shadowBlur, setShadowBlur] = useState(20)
  const cycleCountRef = useRef(0)
  const inhaleMs = useRef(INHALE_MS)
  const holdMs = useRef(HOLD_MS)
  const exhaleMs = useRef(EXHALE_MS)

  useEffect(() => {
    let cancelled = false

    const runCycle = async () => {
      const inhale = inhaleMs.current
      const hold = holdMs.current
      const exhale = exhaleMs.current

      // Inhale
      setPhase('inhale')
      await new Promise<void>((resolve) => {
        const start = Date.now()
        const tick = () => {
          if (cancelled) return
          const t = (Date.now() - start) / inhale
          if (t >= 1) {
            setScale(1.5)
            setOpacity(0.8)
            setShadowBlur(50)
            hapticSelection()
            resolve()
            return
          }
          setScale(1 + t * 0.5)
          setOpacity(0.3 + t * 0.5)
          setShadowBlur(20 + t * 30)
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      if (cancelled) return

      // Hold
      setPhase('hold')
      await new Promise((r) => setTimeout(r, hold))
      if (cancelled) return

      // Exhale
      setPhase('exhale')
      await new Promise<void>((resolve) => {
        const start = Date.now()
        const tick = () => {
          if (cancelled) return
          const t = (Date.now() - start) / exhale
          if (t >= 1) {
            setScale(1)
            setOpacity(0.2)
            setShadowBlur(20)
            hapticImpactLight()
            resolve()
            return
          }
          setScale(1.5 - t * 0.5)
          setOpacity(0.8 - t * 0.6)
          setShadowBlur(50 - t * 30)
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      if (cancelled) return

      cycleCountRef.current += 1
      if (cycleCountRef.current % CYCLES_BEFORE_SLOW === 0) {
        inhaleMs.current = Math.round(inhaleMs.current * SLOW_FACTOR)
        holdMs.current = Math.round(holdMs.current * SLOW_FACTOR)
        exhaleMs.current = Math.round(exhaleMs.current * SLOW_FACTOR)
      }

      if (!cancelled) runCycle()
    }
    runCycle()
    return () => { cancelled = true }
  }, [])

  return (
    <motion.div
      className="rounded-full bg-gradient-to-br from-teal-500/60 to-teal-400/50"
      style={{
        width: 160,
        height: 160,
        scale,
        opacity,
        boxShadow: `0 0 ${shadowBlur}px rgba(20, 184, 166, 0.4)`,
      }}
      transition={{ type: 'tween', duration: 0.1 }}
    />
  )
}
