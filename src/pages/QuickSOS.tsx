import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation, useLocale } from '../i18n/context'
import { HeartHandshake } from '../components/icons'
import { images } from '../data/mediaAssets'

export default function QuickSOS() {
  const t = useTranslation()
  const locale = useLocale()
  const sos = t.sos as Record<string, string>
  const [step, setStep] = useState(0)
  const [notified, setNotified] = useState(false)
  const navigate = useNavigate()

  const handleNotifyFamily = () => {
    const msg = locale === 'zh'
      ? '已通知家人：我正在经历困难时刻，可能需要陪伴。\n\n（MVP 演示 - 实际将发送推送）'
      : 'Family notified: I\'m having a hard moment and may need support.\n\n(MVP demo - will send push)'
    alert(msg)
    setNotified(true)
  }

  if (step === 0) {
    return (
      <div className="min-h-dvh pt-safe pb-safe px-6 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 z-0">
          <img src={images.warmSunset} alt="" className="w-full h-full object-cover opacity-40" />
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
            onClick={() => setStep(1)}
            className="w-full bg-[var(--color-primary)] text-white py-3.5 rounded-xl font-medium text-[15px] mb-3 hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            {String(sos.startBreathing)}
          </button>
          <button
            onClick={handleNotifyFamily}
            className="w-full py-3.5 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-medium bg-white/90 hover:bg-white transition-colors"
          >
            {notified ? `✓ ${String(sos.notified)}` : String(sos.notifyFamily)}
          </button>
          <Link to="/" className="mt-8 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition">
            ← {String(t.back)}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pt-safe pb-safe relative">
      <div className="absolute inset-0 z-0">
        <img src={images.oceanSunrise} alt="" className="w-full h-full object-cover opacity-30" />
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
