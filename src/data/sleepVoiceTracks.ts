/**
 * Pre-recorded sleep voice tracks - calming guided meditation.
 * Free sources with direct MP3 URLs. Attribution required.
 */

export interface SleepVoiceTrack {
  id: string
  title: string
  titleZh: string
  url: string
  lang: 'en'
  durationMin: number
  attribution: string
  attributionUrl: string
}

/** Free sleep meditation tracks - soft, calming, suitable for cancer patients. */
export const SLEEP_VOICE_TRACKS: SleepVoiceTrack[] = [
  {
    id: 'tarabrach-relaxing',
    title: 'Relaxing into Presence or Sleep',
    titleZh: '放松入眠冥想',
    url: 'https://traffic.libsyn.com/secure/tarabrach/2023-01-25-Meditation-Relaxing-into-Presence-or-Sleep-TaraBrach.mp3',
    lang: 'en',
    durationMin: 16,
    attribution: 'Tara Brach',
    attributionUrl: 'https://www.tarabrach.com',
  },
  {
    id: 'tarabrach-sleep-nobell',
    title: 'Relaxing into Sleep (no bell)',
    titleZh: '放松入眠（无结束铃）',
    url: 'https://traffic.libsyn.com/tarabrach/2017-07-19-Meditation-Relaxing-into-Sleep-no-bell-TaraBrach.mp3',
    lang: 'en',
    durationMin: 14,
    attribution: 'Tara Brach',
    attributionUrl: 'https://www.tarabrach.com',
  },
]

/** YouTube sleep/meditation - opens in new tab (no audio extraction per ToS). */
export const SLEEP_YOUTUBE_LINK = 'https://www.youtube.com/watch?v=69o0P7s8GHE'
