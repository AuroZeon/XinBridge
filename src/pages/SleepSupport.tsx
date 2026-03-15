import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSleepTips, getCalmingPrompts } from '../data/sleepContent'
import { useTranslation, useLocale } from '../i18n/context'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Wind } from '../components/icons'
import { images } from '../data/mediaAssets'

export default function SleepSupport() {
  const t = useTranslation()
  const locale = useLocale()
  const sleep = t.sleep as Record<string, string>
  const sleepTips = getSleepTips(locale)
  const calmingPrompts = getCalmingPrompts(locale)
  const [view, setView] = useState<'main' | 'breathing' | 'tip'>('main')
  const [tipIndex, setTipIndex] = useState(0)

  const showTip = (i: number) => {
    setTipIndex(i)
    setView('tip')
  }

  const breath478 = locale === 'zh'
    ? '吸气4秒，屏息7秒，呼气8秒。重复几次，让身体慢慢放松。'
    : 'Inhale 4 sec, hold 7 sec, exhale 8 sec. Repeat a few times to relax.'

  return (
    <div className="min-h-dvh pt-safe pb-safe pb-12 bg-[var(--color-bg)]">
      <div className="relative -mx-4 mb-6 h-36 overflow-hidden rounded-b-2xl">
        <img src={images.nightCalm} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)] drop-shadow-sm animate-fade-in-up">
            {String(sleep.title)}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 animate-fade-in-up stagger-1">
            {String(sleep.subtitle)}
          </p>
        </div>
      </div>
      <div className="px-4 -mt-2">
      <header className="flex items-center justify-between gap-4 py-2 mb-4">
        <Link to="/" className="text-[var(--color-primary)] text-sm hover:underline">← {String(t.back)}</Link>
        <LanguageSwitcher />
      </header>

      {view === 'main' && (
        <div className="space-y-4">
          <button
            onClick={() => setView('breathing')}
            className="w-full flex items-center gap-4 bg-white p-4 rounded-xl text-left border border-[var(--color-border-subtle)] card-interactive"
          >
            <Wind className="w-10 h-10 shrink-0 text-[var(--color-primary)]" strokeWidth={1.75} />
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">{String(sleep.breathing)}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{String(sleep.breathingSub)}</p>
            </div>
          </button>

          <div className="bg-white rounded-xl p-4 border border-[var(--color-border-subtle)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-3">{String(sleep.ifCantSleep)}</h3>
            <div className="space-y-2">
              {sleepTips.map((tip, i) => (
                <button
                  key={i}
                  onClick={() => showTip(i)}
                  className="w-full text-left p-3 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-border-subtle)] transition-colors"
                >
                  <p className="text-sm text-[var(--color-text)]">{tip.title}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[var(--color-border-subtle)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-3">{String(sleep.tryThinking)}</h3>
            <ul className="space-y-2">
              {calmingPrompts.map((p, i) => (
                <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                  <span className="text-[var(--color-primary)]">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/chat"
            className="block w-full text-center py-3.5 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-medium bg-white hover:bg-[var(--color-primary-subtle)] transition-colors"
          >
            {String(sleep.chatLink)}
          </Link>
        </div>
      )}

      {view === 'breathing' && (
        <div className="flex flex-col items-center py-8 animate-fade-in">
          <p className="text-[var(--color-primary)] font-bold mb-2">{String(sleep.breathing)}: 4-7-8</p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center">
            {breath478}
          </p>
          <div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-primary)]/70 to-[var(--color-primary-light)]/80 flex items-center justify-center mb-8 shadow-[0_0_35px_rgba(13,148,136,0.25)]"
            style={{ animation: 'breathe-in-out 19s ease-in-out infinite' }}
          />
          <p className="text-xs text-[var(--color-text-secondary)] mb-6">
            {locale === 'zh' ? '4秒吸 · 7秒屏 · 8秒呼' : '4s in · 7s hold · 8s out'}
          </p>
          <Link
            to="/breathing"
            className="bg-[var(--color-primary)] text-white py-3.5 px-8 rounded-xl font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            {String(sleep.startBreathing)}
          </Link>
          <button
            onClick={() => setView('main')}
            className="mt-6 text-sm text-[var(--color-text-secondary)]"
          >
            {String(sleep.back)}
          </button>
        </div>
      )}

      {view === 'tip' && (
        <div className="bg-white rounded-xl p-5 border border-[var(--color-border-subtle)] animate-fade-in">
          <h3 className="font-semibold text-[var(--color-text)] mb-3">
            {sleepTips[tipIndex].title}
          </h3>
          <p className="text-[var(--color-text)] leading-7 mb-6">
            {sleepTips[tipIndex].content}
          </p>
          <button
            onClick={() => setView('main')}
            className="text-[var(--color-primary)] font-medium"
          >
            ← {String(sleep.back)}
          </button>
        </div>
      )}
      <p className="mt-8 text-[10px] text-[var(--color-text-secondary)]/70 text-center">
        Photos by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
      </p>
      </div>
    </div>
  )
}
