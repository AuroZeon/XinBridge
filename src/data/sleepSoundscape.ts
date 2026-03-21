/**
 * Night Sanctuary Soundscape - layered audio catalog
 * Base: brown noise (Web Audio). Overlays: nature sounds. Voice: guided / whispered.
 */

import type { Locale } from '../i18n/locale'
import {
  GUIDED_MEDITATIONS,
  getWhisperedRecoveryStories,
  type GuidedMeditationTrack,
  type WhisperedRecoveryStory,
} from './sleepContent'

/** Base layer - always playing when soundscape is on */
export type BaseLayerId = 'brownNoise' | 'binauralDelta'

/** Atmospheric overlay - user can toggle */
export interface NatureOverlay {
  id: string
  titleEn: string
  titleZh: string
  icon: 'rain' | 'wind' | 'waves' | 'zenBowls'
  /** Optional: external URL. If null, use Web Audio synthesis */
  url: string | null
}

export const NATURE_OVERLAYS: NatureOverlay[] = [
  { id: 'rain', titleEn: 'Rain', titleZh: '雨声', icon: 'rain', url: null },
  { id: 'wind', titleEn: 'Soft wind', titleZh: '轻风', icon: 'wind', url: null },
  { id: 'waves', titleEn: 'Distant waves', titleZh: '远处海浪', icon: 'waves', url: null },
  { id: 'zenBowls', titleEn: 'Zen bowls', titleZh: '钵音', icon: 'zenBowls', url: null },
]

/** Voice track category */
export type VoiceCategory = 'guidedMeditation' | 'whisperedStory'

export interface VoiceTrackItem {
  id: string
  category: VoiceCategory
  durationMin: number
  titleEn: string
  titleZh: string
  theme?: 'relinquishing' | 'safeSpaces'
  /** For guided: script. For whispered: story. */
  scriptEn: string[]
  scriptZh: string[]
}

export function getVoiceTracks(locale: Locale): VoiceTrackItem[] {
  const guided: VoiceTrackItem[] = GUIDED_MEDITATIONS.map(
    (m: GuidedMeditationTrack) => ({
      id: m.id,
      category: 'guidedMeditation' as const,
      durationMin: m.durationMin,
      titleEn: m.titleEn,
      titleZh: m.titleZh,
      theme: m.theme,
      scriptEn: m.scriptEn,
      scriptZh: m.scriptZh,
    })
  )
  const whispered = getWhisperedRecoveryStories(locale).map((s: WhisperedRecoveryStory) => ({
    id: s.id,
    category: 'whisperedStory' as const,
    durationMin: Math.ceil((s.scriptEn.length * 4) / 60),
    titleEn: s.titleEn,
    titleZh: s.titleZh,
    scriptEn: s.scriptEn,
    scriptZh: s.scriptZh,
  }))
  return [...guided, ...whispered]
}

/** Sleep timer fade duration (ms) - logarithmic fade over 2 min */
export const SLEEP_TIMER_FADE_MS = 120_000
