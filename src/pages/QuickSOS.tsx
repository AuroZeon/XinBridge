import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { Motion } from '@capacitor/motion'
import { useTranslation, useLocale } from '../i18n/context'
import { HeartHandshake } from '../components/icons'
import { images } from '../data/mediaAssets'
import { ImgWithFallback } from '../components/ImgWithFallback'
import ContactFamilyModal from '../components/ContactFamilyModal'

const FACE_DOWN_Z = -8
const FACE_DOWN_FLAT = 4
const HOLD_SECONDS = 5
const CANCEL_SECONDS = 10

function isFaceDown(acc: { x: number; y: number; z: number } | undefined): boolean {
  if (!acc) return false
  return acc.z < FACE_DOWN_Z && Math.abs(acc.x) < FACE_DOWN_FLAT && Math.abs(acc.y) < FACE_DOWN_FLAT
}

export default function QuickSOS() {
  const backTo = ((useLocation().state as { from?: string })?.from) ?? '/'
  const t = useTranslation()
  const locale = useLocale()
  const sos = t.sos as Record<string, string>
  const [step, setStep] = useState<'initial' | 'breathing' | 'grounding'>('initial')
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [proximityCountdown, setProximityCountdown] = useState<number | null>(null)
  const faceDownStartRef = useRef<number | null>(null)
  const cancelCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const triggeredRef = useRef(false)
  const navigate = useNavigate()

  const defaultMessage = locale === 'zh'
    ? '我正在经历困难时刻，可能需要陪伴。'
    : "I'm having a hard moment and may need support."

  useEffect(() => {
    if (step !== 'initial' || !Capacitor.isNativePlatform()) return

    let handler: { remove: () => Promise<void> } | null = null
    let checkInterval: ReturnType<typeof setInterval> | null = null

    const startListening = async () => {
      try {
        if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
          const perm = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
          if (perm !== 'granted') return
        }
      } catch {
        return
      }

      handler = await Motion.addListener('accel', (event) => {
        const acc = event.accelerationIncludingGravity
        if (isFaceDown(acc)) {
          if (faceDownStartRef.current === null) faceDownStartRef.current = Date.now()
        } else {
          faceDownStartRef.current = null
        }
      })

      checkInterval = setInterval(() => {
        if (faceDownStartRef.current === null) {
          triggeredRef.current = false
          return
        }
        if (triggeredRef.current) return
        const elapsed = (Date.now() - faceDownStartRef.current) / 1000
        if (elapsed >= HOLD_SECONDS) {
          triggeredRef.current = true
          setProximityCountdown(CANCEL_SECONDS)
          let c = CANCEL_SECONDS
          cancelCountdownRef.current = setInterval(() => {
            c -= 1
            setProximityCountdown(c)
            if (c <= 0) {
              if (cancelCountdownRef.current) {
                clearInterval(cancelCountdownRef.current)
                cancelCountdownRef.current = null
              }
              setContactModalOpen(true)
              setProximityCountdown(null)
            }
          }, 1000)
        }
      }, 300)
    }

    startListening()
    return () => {
      handler?.remove()
      if (checkInterval) clearInterval(checkInterval)
      if (cancelCountdownRef.current) clearInterval(cancelCountdownRef.current)
    }
  }, [step])

  const cancelProximity = () => {
    setProximityCountdown(null)
    if (cancelCountdownRef.current) {
      clearInterval(cancelCountdownRef.current)
      cancelCountdownRef.current = null
    }
  }

  const handleNotifyFamily = () => {
    setStep('grounding')
    setContactModalOpen(true)
  }

  if (step === 'initial') {
    return (
      <div className="min-h-dvh pt-safe pb-safe px-6 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 z-0">
          <ImgWithFallback src={images.warmSunset} alt="" className="w-full h-full object-cover opacity-40" fallbackClassName="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80" />
        </div>
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/90 shadow-lg mb-6 animate-gentle-float">
            <HeartHandshake className="h-8 w-8 text-[var(--color-primary)]" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-semibold text-center mb-2 text-[var(--color-text)]">{String(sos.title)}</h1>
          <p className="text-center text-[var(--color-text-secondary)] text-sm mb-8">
            {String(sos.subtitle)}
          </p>
          <button
            onClick={() => setStep('breathing')}
            className="w-full bg-[var(--color-primary)] text-white py-3.5 rounded-xl font-medium text-[15px] mb-3 hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            {String(sos.startBreathing)}
          </button>
          <button
            onClick={handleNotifyFamily}
            className="w-full py-3.5 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-medium bg-white/90 hover:bg-white transition-colors"
          >
            {String(sos.notifyFamily)}
          </button>
          <ContactFamilyModal
            open={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
            message={defaultMessage}
          />
          {proximityCountdown !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
              <div className="mx-6 p-6 rounded-2xl bg-white max-w-sm">
                <p className="text-[var(--color-text)] font-medium mb-2">
                  {locale === 'zh' ? '准备打开联系方式' : 'Preparing contact options'}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                  {locale === 'zh'
                    ? `${proximityCountdown} 秒后将打开（由您选择电话或短信等，不会自动发送）`
                    : `Opens in ${proximityCountdown} s — you choose call or text; nothing is sent automatically.`}
                </p>
                <button
                  onClick={cancelProximity}
                  className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium"
                >
                  {locale === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
          <Link to={backTo} className="mt-8 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition">
            ← {String(t.back)}
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'grounding') {
    const steps = [
      { n: 5, label: sos.grounding5 },
      { n: 4, label: sos.grounding4 },
      { n: 3, label: sos.grounding3 },
      { n: 2, label: sos.grounding2 },
      { n: 1, label: sos.grounding1 },
    ] as const
    return (
      <div className="min-h-dvh pt-safe pb-safe relative">
        <div className="absolute inset-0 z-0">
          <ImgWithFallback src={images.warmSunset} alt="" className="w-full h-full object-cover opacity-30" fallbackClassName="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-amber-900/10 to-black/30" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-dvh px-6 py-12">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1 animate-fade-in">
            {String(sos.groundingTitle)}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8 animate-fade-in">
            {String(sos.groundingSubtitle)}
          </p>
          <div className="space-y-4 w-full max-w-sm animate-fade-in">
            {steps.map(({ n, label }) => (
              <div
                key={n}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold text-lg">
                  {n}
                </span>
                <span className="text-[var(--color-text)] font-medium">{String(label)}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setContactModalOpen(true)}
            className="mt-10 px-6 py-3 rounded-xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary)]/10 transition-colors"
          >
            {String(sos.groundingContact)}
          </button>
          <Link to={backTo} className="mt-6 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
            ← {String(t.back)}
          </Link>
        </div>
        <ContactFamilyModal
          open={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          message={defaultMessage}
        />
      </div>
    )
  }

  return (
    <div className="min-h-dvh pt-safe pb-safe relative">
      <div className="absolute inset-0 z-0">
        <ImgWithFallback src={images.oceanSunrise} alt="" className="w-full h-full object-cover opacity-30" fallbackClassName="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/90" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <p className="text-lg text-[var(--color-primary)] font-bold mb-6 animate-fade-in">{String(sos.followBreath)}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center animate-fade-in">
          {locale === 'zh' ? '跟随圆圈呼吸，然后进入完整练习' : 'Follow the circle, then go to full exercise'}
        </p>
        <div className="relative mb-8">
          <div
            className="w-36 h-36 rounded-full bg-gradient-to-br from-[var(--color-primary)]/70 to-[var(--color-primary-light)]/80 flex items-center justify-center shadow-[0_0_40px_rgba(13,148,136,0.3)]"
            style={{
              animation: 'breathe-in-out 8s ease-in-out infinite',
            }}
          />
        </div>
        <p className="text-[var(--color-text-secondary)] mb-8 text-center">
          {locale === 'zh' ? '吸气... 呼气... 慢慢来' : 'Inhale... exhale... take your time'}
        </p>
        <button
          onClick={() => navigate('/breathing')}
          className="px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          {String(sos.fullBreathing)}
        </button>
      </div>
    </div>
  )
}
