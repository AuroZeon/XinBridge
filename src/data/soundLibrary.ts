/**
 * Night Sanctuary Sound Library
 * CC0 / Public Domain / royalty-free audio assets.
 * Categories: Nature, Meditation (voice), Ambiance.
 * On URL failure: fallback to procedural Web Audio.
 */

export type SoundCategory = 'nature' | 'meditation' | 'ambiance'

export interface SoundTrack {
  id: string
  category: SoundCategory
  titleEn: string
  titleZh: string
  /** Direct URL. If empty, use TTS/procedural fallback */
  url: string
  /** Duration in seconds (approx). 0 = indefinite/loop. */
  durationSec: number
  /** For meditation: script id to use with TTS when url fails or "Read for Me" */
  scriptId?: string
}

/** Nature - rain, forest, ocean, etc. */
const NATURE: SoundTrack[] = [
  {
    id: 'rain-windowsill',
    category: 'nature',
    titleEn: 'Heavy Rain on Windowsill',
    titleZh: '窗边大雨',
    url: 'https://www.soundjay.com/nature/rain-01.mp3',
    durationSec: 0,
  },
  {
    id: 'rain-steady',
    category: 'nature',
    titleEn: 'Steady Rain',
    titleZh: '持续细雨',
    url: 'https://www.soundjay.com/nature/rain-02.mp3',
    durationSec: 0,
  },
  {
    id: 'rain-light',
    category: 'nature',
    titleEn: 'Light Rain Drops',
    titleZh: '轻柔雨滴',
    url: 'https://www.soundjay.com/nature/rain-03.mp3',
    durationSec: 0,
  },
  {
    id: 'ocean-tide',
    category: 'nature',
    titleEn: 'Rhythmic Ocean Tide',
    titleZh: '海浪拍打',
    url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3',
    durationSec: 0,
  },
  {
    id: 'ocean-waves',
    category: 'nature',
    titleEn: 'Distant Ocean Waves',
    titleZh: '远处海浪',
    url: 'https://www.soundjay.com/nature/ocean-wave-2.mp3',
    durationSec: 0,
  },
  {
    id: 'forest-night',
    category: 'nature',
    titleEn: 'Deep Forest Night (Crickets/Wind)',
    titleZh: '深夜森林（虫鸣与风）',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_88c0b3c9d1.mp3',
    durationSec: 0,
  },
  {
    id: 'forest-birds',
    category: 'nature',
    titleEn: 'Forest Morning Birds',
    titleZh: '森林晨鸟',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_d1718d2be4.mp3',
    durationSec: 0,
  },
  {
    id: 'stream',
    category: 'nature',
    titleEn: 'Gentle Stream',
    titleZh: '潺潺溪流',
    url: 'https://cdn.pixabay.com/download/audio/2021/10/11/audio_afd2f2d39d.mp3',
    durationSec: 0,
  },
  {
    id: 'thunder-rain',
    category: 'nature',
    titleEn: 'Distant Thunder & Rain',
    titleZh: '远处雷雨',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_52ab1b7b0d.mp3',
    durationSec: 0,
  },
]

/** Meditation - guided voice. url can be empty → TTS "Read for Me" */
const MEDITATION: SoundTrack[] = [
  {
    id: 'body-scan-5',
    category: 'meditation',
    titleEn: '5-Minute Body Scan (Soft Whisper)',
    titleZh: '5分钟身体扫描（轻柔低语）',
    url: '',
    durationSec: 300,
    scriptId: 'bodyScan',
  },
  {
    id: 'letting-go-7',
    category: 'meditation',
    titleEn: '7-Minute Letting Go (Deep Calm)',
    titleZh: '7分钟放下（深沉平静）',
    url: '',
    durationSec: 420,
    scriptId: 'relinquish-5',
  },
  {
    id: 'safe-space-5',
    category: 'meditation',
    titleEn: '5-Minute Safe Space',
    titleZh: '5分钟安全空间',
    url: '',
    durationSec: 300,
    scriptId: 'safe-5',
  },
  {
    id: 'relinquish-3',
    category: 'meditation',
    titleEn: '3-Minute Letting Go',
    titleZh: '3分钟放下',
    url: '',
    durationSec: 180,
    scriptId: 'relinquish-3',
  },
  {
    id: 'relinquish-10',
    category: 'meditation',
    titleEn: '10-Minute Deep Relinquishing',
    titleZh: '10分钟深深放下',
    url: '',
    durationSec: 600,
    scriptId: 'relinquish-10',
  },
]

/** Ambiance - binaural, zen bowls, ambient music */
const AMBIANCE: SoundTrack[] = [
  {
    id: 'binaural-delta',
    category: 'ambiance',
    titleEn: 'Binaural Delta Waves (1.5Hz)',
    titleZh: '双耳德尔塔波（1.5Hz）',
    url: '',
    durationSec: 0,
    /** Procedural - no URL, always Web Audio */
  },
  {
    id: 'zen-bowls',
    category: 'ambiance',
    titleEn: 'Soft Zen Singing Bowls',
    titleZh: '柔和钵音',
    url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_276a7516d7.mp3',
    durationSec: 0,
  },
  {
    id: 'ambient-relax',
    category: 'ambiance',
    titleEn: 'Ambient Relaxation',
    titleZh: '舒缓氛围',
    url: 'https://www.chosic.com/wp-content/uploads/2021/04/Ambient-Relaxation-Clean-Background-Music.mp3',
    durationSec: 0,
  },
  {
    id: 'brown-noise',
    category: 'ambiance',
    titleEn: 'Brown Noise',
    titleZh: '褐噪声',
    url: '',
    durationSec: 0,
  },
  {
    id: 'white-noise',
    category: 'ambiance',
    titleEn: 'White Noise (Fallback)',
    titleZh: '白噪声（备用）',
    url: '',
    durationSec: 0,
  },
  {
    id: 'celestial-pads',
    category: 'ambiance',
    titleEn: 'Celestial Pads',
    titleZh: '天籁和声',
    url: 'https://opengameart.org/sites/default/files/celestial_harmony_0.mp3',
    durationSec: 0,
  },
  {
    id: 'ambient-piano',
    category: 'ambiance',
    titleEn: 'Ambient Piano',
    titleZh: '环境钢琴',
    url: 'https://opengameart.org/sites/default/files/first_light_particles_0.wav',
    durationSec: 0,
  },
]

export const SOUND_LIBRARY = {
  nature: NATURE,
  meditation: MEDITATION,
  ambiance: AMBIANCE,
} as const

export type SoundLibrary = typeof SOUND_LIBRARY

export function getAllTracks(): SoundTrack[] {
  return [...NATURE, ...MEDITATION, ...AMBIANCE]
}

export function getTracksByCategory(cat: SoundCategory): SoundTrack[] {
  return SOUND_LIBRARY[cat] ?? []
}
