/**
 * Real-world sounds - no programmed audio. Run npm run download-sounds before build.
 */
import rainUrl from './rain.mp3?url'
import oceanUrl from './ocean.mp3?url'
import forestUrl from './forest.mp3?url'
import streamUrl from './stream.mp3?url'
import thunderRainUrl from './thunder-rain.mp3?url'
import forestBirdsUrl from './forest-birds.mp3?url'
import zenBowlsUrl from './zen-bowls.mp3?url'
import celestialUrl from './celestial-pads.mp3?url'
import ambientRelaxUrl from './ambient-relax.mp3?url'
import calmingBackgroundUrl from './calming-background.mp3?url'
import meditativeMusicUrl from './meditative-music.mp3?url'
import deepAmbientUrl from './deep-ambient.mp3?url'
import relaxingPianoUrl from './relaxing-piano.mp3?url'
import contemplationUrl from './contemplation.mp3?url'
import vaporwarePianoUrl from './vaporware-piano.mp3?url'

export const AUDIO_URLS = {
  rain: rainUrl,
  ocean: oceanUrl,
  forest: forestUrl,
  stream: streamUrl,
  'thunder-rain': thunderRainUrl,
  'forest-birds': forestBirdsUrl,
  'zen-bowls': zenBowlsUrl,
  'celestial-pads': celestialUrl,
  'ambient-piano': celestialUrl,
  'ambient-relax': ambientRelaxUrl,
  'calming-background': calmingBackgroundUrl,
  'meditative-music': meditativeMusicUrl,
  'deep-ambient': deepAmbientUrl,
  'relaxing-piano': relaxingPianoUrl,
  'contemplation': contemplationUrl,
  'vaporware-piano': vaporwarePianoUrl,
} as const
