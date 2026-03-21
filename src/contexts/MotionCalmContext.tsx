/**
 * Motion-Sensing Calm: detects phone shake/agitation, shows gentle toast.
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { Motion } from '@capacitor/motion'
import { useLocale } from '../i18n/context'

type MotionCalmContextValue = {
  showTensionToast: () => void
  tensionToast: boolean
  dismissTensionToast: () => void
}

const MotionCalmContext = createContext<MotionCalmContextValue | null>(null)

export function useMotionCalm() {
  const ctx = useContext(MotionCalmContext)
  return ctx
}

const SHAKE_THRESHOLD = 180
const COOLDOWN_MS = 15000

export function MotionCalmProvider({ children }: { children: React.ReactNode }) {
  const [tensionToast, setTensionToast] = useState(false)
  const lastToastRef = useRef(0)
  const handlerRef = useRef<{ remove: () => Promise<void> } | null>(null)
  const navigate = useNavigate()

  const showTensionToast = useCallback(() => {
    if (Date.now() - lastToastRef.current < COOLDOWN_MS) return
    lastToastRef.current = Date.now()
    setTensionToast(true)
  }, [])

  const dismissTensionToast = useCallback(() => setTensionToast(false), [])

  const goToBreathing = useCallback(() => {
    setTensionToast(false)
    navigate('/breathing')
  }, [navigate])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let mounted = true

    const startListening = async () => {
      try {
        if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
          const perm = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
          if (perm !== 'granted') return
        }
      } catch {
        return
      }

      handlerRef.current = await Motion.addListener('accel', (event) => {
        if (!mounted) return
        const r = event.rotationRate
        if (!r) return
        const magnitude = Math.abs(r.alpha) + Math.abs(r.beta) + Math.abs(r.gamma)
        if (magnitude > SHAKE_THRESHOLD) {
          showTensionToast()
        }
      })
    }

    startListening()
    return () => {
      mounted = false
      handlerRef.current?.remove()
      handlerRef.current = null
    }
  }, [showTensionToast])

  const value: MotionCalmContextValue = {
    showTensionToast,
    tensionToast,
    dismissTensionToast,
  }

  return (
    <MotionCalmContext.Provider value={value}>
      {children}
      {tensionToast && (
        <TensionToast
          onDismiss={dismissTensionToast}
          onBreath={goToBreathing}
        />
      )}
    </MotionCalmContext.Provider>
  )
}

function TensionToast({ onDismiss, onBreath }: { onDismiss: () => void; onBreath: () => void }) {
  const locale = useLocale()
  const msg = locale === 'zh'
    ? '我注意到一些紧张。要和我一起做个深呼吸吗？'
    : 'I noticed some tension. Would you like to take a deep breath with me?'
  const yesLabel = locale === 'zh' ? '开始呼吸' : 'Take a breath'
  const dismissLabel = locale === 'zh' ? '不用了' : 'Not now'

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in-up">
      <div className="rounded-2xl bg-white/95 dark:bg-gray-900/95 shadow-xl border border-[var(--color-border)] p-4 backdrop-blur-sm">
        <p className="text-[var(--color-text)] text-sm leading-relaxed mb-4">{msg}</p>
        <div className="flex gap-2">
          <button
            onClick={onBreath}
            className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium text-sm"
          >
            {yesLabel}
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 rounded-xl text-[var(--color-text-secondary)] hover:bg-gray-100 text-sm"
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
