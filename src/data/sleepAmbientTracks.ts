/**
 * Ambient & music tracks - real recordings from OpenGameArt (CC0).
 * Bundled via download-sounds script.
 */

export interface SleepAmbientTrack {
  id: string
  title: string
  titleZh: string
  type: 'ambientPiano' | 'celestialPads'
  url: string
  attribution?: string
  attributionUrl?: string
}

export const SLEEP_AMBIENT_TRACKS: SleepAmbientTrack[] = [
  {
    id: 'celestial-harmony',
    title: 'Celestial Harmony',
    titleZh: '天籁和声',
    type: 'celestialPads',
    url: 'celestial-pads',
    attribution: 'Vitalezzz - CC0',
    attributionUrl: 'https://opengameart.org/content/celestial-harmony',
  },
  {
    id: 'first-light',
    title: 'First Light Particles',
    titleZh: '晨光粒子',
    type: 'ambientPiano',
    url: 'ambient-piano',
    attribution: 'CC0 - OpenGameArt',
    attributionUrl: 'https://opengameart.org/content/first-light-particles-–-cc0-atmospheric-pianoambient-track',
  },
]
