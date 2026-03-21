/**
 * Micro-pills of wisdom for the Hope Ticker.
 * Short 1-sentence quotes from hope story templates.
 */
import type { Locale } from '../i18n/locale'
import { STORY_TEMPLATES } from './hopeStoryTemplates'

function getPills(locale: Locale): string[] {
  const useZh = locale === 'zh'
  const pills = STORY_TEMPLATES.map((t) => (useZh ? t.excerptZh : t.excerptEn))
  return [...new Set(pills)]
}

export function getWisdomPills(locale: Locale): string[] {
  return getPills(locale)
}
