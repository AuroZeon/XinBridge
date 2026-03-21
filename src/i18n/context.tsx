import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { getInitialLocale, type Locale } from './locale'
import { getTranslations } from './translations'

type I18nContextValue = {
  locale: Locale
  t: ReturnType<typeof getTranslations>
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale] = useState<Locale>(getInitialLocale)
  const t = useMemo(() => getTranslations(locale), [locale])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    document.title = t.appName + ' – ' + t.tagline
  }, [locale, t])

  const value = useMemo(() => ({ locale, t }), [locale, t])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx.t
}

export function useLocale() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLocale must be used within I18nProvider')
  return ctx.locale
}

