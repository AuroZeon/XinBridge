#!/usr/bin/env node
/**
 * Download real-world nature & ambient sounds (Orange Free Sounds, OpenGameArt).
 * No programmed sounds - all from free online sources.
 * Skips files that already exist (>1KB). Run with --force to re-download all.
 * Run: node scripts/download-sounds.mjs
 */
import { mkdir, writeFile, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'src', 'assets', 'audio')
const MIN_SIZE = 1000
const FORCE = process.argv.includes('--force')

const SOURCES = [
  { name: 'rain.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2025/02/Heavy-rainfall-sound-effect.mp3' },
  { name: 'ocean.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2024/07/Gentle-waves-sound.mp3' },
  { name: 'forest.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2025/02/Relaxing-spring-forest-sounds.mp3' },
  { name: 'stream.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2024/08/Creek-sound-effect.mp3' },
  { name: 'thunder-rain.mp3', url: 'https://www.orangefreesounds.com/wp-content/uploads/2017/05/Rain-thunder.mp3' },
  { name: 'forest-birds.mp3', url: 'https://www.orangefreesounds.com/wp-content/uploads/2016/01/Rain-and-birds.mp3' },
  { name: 'zen-bowls.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2024/01/Meditation-singing-bowl-sound.mp3' },
  { name: 'celestial-pads.mp3', url: 'https://opengameart.org/sites/default/files/celestial_harmony_0.mp3' },
  { name: 'ambient-relax.mp3', url: 'https://opengameart.org/sites/default/files/celestial_harmony_0.mp3' },
  // Calming music - Orange Free Sounds, OpenGameArt (CC0 / CC BY)
  { name: 'calming-background.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2024/10/Calming-background-music.mp3' },
  { name: 'meditative-music.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2024/01/Free-meditative-music.mp3' },
  { name: 'deep-ambient.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2024/06/Deep-ambient-music-gentle-synth-texture.mp3' },
  { name: 'relaxing-piano.mp3', url: 'https://orangefreesounds.com/wp-content/uploads/2024/06/Relaxing-instrumental-piano-music.mp3' },
  { name: 'contemplation.mp3', url: 'https://opengameart.org/sites/default/files/Contemplation.mp3' },
  { name: 'vaporware-piano.mp3', url: 'https://opengameart.org/sites/default/files/003_Vaporware_2.mp3' },
]

async function download(url) {
  const buf = execSync(`curl -sL -A "Mozilla/5.0" "${url}"`, { encoding: null, maxBuffer: 15 * 1024 * 1024 })
  return Buffer.from(buf)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  let saved = 0
  for (const { name, url } of SOURCES) {
    const dest = path.join(OUT, name)
    try {
      if (!FORCE) {
        const st = await stat(dest).catch(() => null)
        if (st && st.size >= MIN_SIZE) {
          continue
        }
      }
      const buf = await download(url)
      if (buf.length < MIN_SIZE) throw new Error('File too small')
      await writeFile(dest, buf)
      console.log(`Saved: ${name}`)
      saved++
    } catch (e) {
      console.warn(`Failed ${name}:`, e.message)
    }
  }
  console.log(saved > 0 ? `Done. (${saved} downloaded)` : 'Done. (all cached)')
}

main().catch(console.error)
