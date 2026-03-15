export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'xinbridge_locale'
const ZH_PREFIXES = ['zh', 'zh-CN', 'zh-TW', 'zh-HK', 'zh-SG']

export function getSystemLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language || (navigator.languages?.[0] ?? '')
  const primary = lang.split('-')[0].toLowerCase()
  if (primary === 'zh' || ZH_PREFIXES.some((p) => lang.toLowerCase().startsWith(p))) {
    return 'zh'
  }
  return 'en'
}

export function getStoredLocale(): Locale | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s === 'zh' || s === 'en' ? s : null
  } catch {
    return null
  }
}

export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // ignore
  }
}

export function getInitialLocale(): Locale {
  return getStoredLocale() ?? getSystemLocale()
}
