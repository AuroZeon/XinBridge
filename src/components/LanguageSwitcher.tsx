import { useLocale, useSetLocale } from '../i18n/context'

export function LanguageSwitcher({ className = '', variant = 'default' }: { className?: string; variant?: 'default' | 'light' }) {
  const locale = useLocale()
  const setLocale = useSetLocale()
  const inactiveClass = variant === 'light' ? 'text-white/80 hover:text-white' : 'text-[var(--color-text-secondary)]'
  const activeClass = variant === 'light' ? 'bg-white/20 text-white' : 'bg-[var(--color-primary)] text-white'
  return (
    <div className={`flex gap-1 shrink-0 ${className}`}>
      <button
        onClick={() => setLocale('zh')}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${locale === 'zh' ? activeClass : inactiveClass}`}
      >
        中文
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${locale === 'en' ? activeClass : inactiveClass}`}
      >
        EN
      </button>
    </div>
  )
}
