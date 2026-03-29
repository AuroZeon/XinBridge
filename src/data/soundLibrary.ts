/**
 * Night Sanctuary Sound Library - Real-world sounds only.
 * Orange Free Sounds (CC BY-NC 4.0), OpenGameArt (CC0).
 * Run `npm run download-sounds` before build.
 */

import { AUDIO_URLS } from '../assets/audio/urls'

export type SoundCategory = 'nature' | 'meditation' | 'ambiance'

export interface SoundTrack {
  id: string
  category: SoundCategory
  titleEn: string
  titleZh: string
  url: string
  durationSec: number
  scriptId?: string
}

/** All tracks use bundled real audio - no programmed sounds. */
const BUNDLED: Record<string, string> = {
  'rain-windowsill': AUDIO_URLS.rain,
  'rain-steady': AUDIO_URLS.rain,
  'rain-light': AUDIO_URLS.rain,
  'ocean-tide': AUDIO_URLS.ocean,
  'ocean-waves': AUDIO_URLS.ocean,
  'forest-night': AUDIO_URLS.forest,
  'forest-birds': AUDIO_URLS['forest-birds'],
  'stream': AUDIO_URLS.stream,
  'thunder-rain': AUDIO_URLS['thunder-rain'],
  'zen-bowls': AUDIO_URLS['zen-bowls'],
  'ambient-relax': AUDIO_URLS['ambient-relax'],
  'celestial-pads': AUDIO_URLS['celestial-pads'],
  'ambient-piano': AUDIO_URLS['ambient-piano'],
  'celestial-harmony': AUDIO_URLS['celestial-pads'],
  'first-light': AUDIO_URLS['ambient-piano'],
  'calming-background': AUDIO_URLS['calming-background'],
  'meditative-music': AUDIO_URLS['meditative-music'],
  'deep-ambient': AUDIO_URLS['deep-ambient'],
  'relaxing-piano': AUDIO_URLS['relaxing-piano'],
  'contemplation': AUDIO_URLS['contemplation'],
  'vaporware-piano': AUDIO_URLS['vaporware-piano'],
}

export function resolveTrackUrls(track: { id: string; url: string }): string[] {
  const url = BUNDLED[track.id]
  if (url) return [url]
  return track.url ? [track.url] : []
}

const NATURE: SoundTrack[] = [
  { id: 'rain-windowsill', category: 'nature', titleEn: 'Heavy Rain on Windowsill', titleZh: '窗边大雨', url: 'rain', durationSec: 0 },
  { id: 'rain-steady', category: 'nature', titleEn: 'Steady Rain', titleZh: '持续细雨', url: 'rain', durationSec: 0 },
  { id: 'rain-light', category: 'nature', titleEn: 'Light Rain Drops', titleZh: '轻柔雨滴', url: 'rain', durationSec: 0 },
  { id: 'ocean-tide', category: 'nature', titleEn: 'Rhythmic Ocean Tide', titleZh: '海浪拍打', url: 'ocean', durationSec: 0 },
  { id: 'ocean-waves', category: 'nature', titleEn: 'Distant Ocean Waves', titleZh: '远处海浪', url: 'ocean', durationSec: 0 },
  { id: 'forest-night', category: 'nature', titleEn: 'Deep Forest Night (Crickets/Wind)', titleZh: '深夜森林（虫鸣与风）', url: 'forest', durationSec: 0 },
  { id: 'forest-birds', category: 'nature', titleEn: 'Forest Morning Birds', titleZh: '森林晨鸟', url: 'forest-birds', durationSec: 0 },
  { id: 'stream', category: 'nature', titleEn: 'Gentle Stream', titleZh: '潺潺溪流', url: 'stream', durationSec: 0 },
  { id: 'thunder-rain', category: 'nature', titleEn: 'Distant Thunder & Rain', titleZh: '远处雷雨', url: 'thunder-rain', durationSec: 0 },
]

const MEDITATION: SoundTrack[] = [
  { id: 'body-scan-5', category: 'meditation', titleEn: '5-Minute Body Scan (Soft Whisper)', titleZh: '5分钟身体扫描（轻柔低语）', url: '', durationSec: 300, scriptId: 'bodyScan' },
  { id: 'letting-go-7', category: 'meditation', titleEn: '7-Minute Letting Go (Deep Calm)', titleZh: '7分钟放下（深沉平静）', url: '', durationSec: 420, scriptId: 'relinquish-5' },
  { id: 'safe-space-5', category: 'meditation', titleEn: '5-Minute Safe Space', titleZh: '5分钟安全空间', url: '', durationSec: 300, scriptId: 'safe-5' },
  { id: 'relinquish-3', category: 'meditation', titleEn: '3-Minute Letting Go', titleZh: '3分钟放下', url: '', durationSec: 180, scriptId: 'relinquish-3' },
  { id: 'relinquish-10', category: 'meditation', titleEn: '10-Minute Deep Relinquishing', titleZh: '10分钟深深放下', url: '', durationSec: 600, scriptId: 'relinquish-10' },
]

const AMBIANCE: SoundTrack[] = [
  { id: 'zen-bowls', category: 'ambiance', titleEn: 'Soft Zen Singing Bowls', titleZh: '柔和钵音', url: 'zen-bowls', durationSec: 0 },
  { id: 'ambient-relax', category: 'ambiance', titleEn: 'Ambient Relaxation', titleZh: '舒缓氛围', url: 'ambient-relax', durationSec: 0 },
  { id: 'celestial-pads', category: 'ambiance', titleEn: 'Celestial Pads', titleZh: '天籁和声', url: 'celestial-pads', durationSec: 0 },
  { id: 'ambient-piano', category: 'ambiance', titleEn: 'Ambient Piano', titleZh: '环境钢琴', url: 'ambient-piano', durationSec: 0 },
  { id: 'calming-background', category: 'ambiance', titleEn: 'Calming Background', titleZh: '舒缓背景', url: 'calming-background', durationSec: 0 },
  { id: 'meditative-music', category: 'ambiance', titleEn: 'Meditative Music', titleZh: '冥想音乐', url: 'meditative-music', durationSec: 0 },
  { id: 'deep-ambient', category: 'ambiance', titleEn: 'Deep Ambient', titleZh: '深层氛围', url: 'deep-ambient', durationSec: 0 },
  { id: 'relaxing-piano', category: 'ambiance', titleEn: 'Relaxing Piano', titleZh: '舒缓钢琴', url: 'relaxing-piano', durationSec: 0 },
  { id: 'contemplation', category: 'ambiance', titleEn: 'Contemplation', titleZh: '沉思', url: 'contemplation', durationSec: 0 },
  { id: 'vaporware-piano', category: 'ambiance', titleEn: 'Vaporware Piano', titleZh: '蒸汽波钢琴', url: 'vaporware-piano', durationSec: 0 },
]

export const SOUND_LIBRARY = { nature: NATURE, meditation: MEDITATION, ambiance: AMBIANCE } as const
export type SoundLibrary = typeof SOUND_LIBRARY

export function getAllTracks(): SoundTrack[] {
  return [...NATURE, ...MEDITATION, ...AMBIANCE]
}

export function getTracksByCategory(cat: SoundCategory): SoundTrack[] {
  return SOUND_LIBRARY[cat] ?? []
}
