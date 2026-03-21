export type Locale = 'zh' | 'en'

const ZH_PREFIXES = ['zh', 'zh-CN', 'zh-TW', 'zh-HK', 'zh-SG']

/** Uses platform/browser language; no manual switch (some platforms don't support Chinese display). */
export function getInitialLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language || (navigator.languages?.[0] ?? '')
  const primary = lang.split('-')[0].toLowerCase()
  if (primary === 'zh' || ZH_PREFIXES.some((p) => lang.toLowerCase().startsWith(p))) {
    return 'zh'
  }
  return 'en'
}
