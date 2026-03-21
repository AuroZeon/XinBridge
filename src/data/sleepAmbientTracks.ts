/**
 * Ambient & music tracks for Night Sanctuary Cover Flow
 * CC0 / royalty-free sources. URLs may require CORS for web.
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
    url: 'https://opengameart.org/sites/default/files/celestial_harmony_0.mp3',
    attribution: 'Vitalezzz - CC0',
    attributionUrl: 'https://opengameart.org/content/celestial-harmony',
  },
  {
    id: 'first-light',
    title: 'First Light Particles',
    titleZh: '晨光粒子',
    type: 'ambientPiano',
    url: 'https://opengameart.org/sites/default/files/first_light_particles_0.wav',
    attribution: 'CC0 - OpenGameArt',
    attributionUrl: 'https://opengameart.org/content/first-light-particles-–-cc0-atmospheric-pianoambient-track',
  },
]
