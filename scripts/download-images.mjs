#!/usr/bin/env node
/**
 * Download app images from Unsplash to local assets. No external dependency at runtime.
 * Skips files that already exist (>5KB). Run with --force to re-download all.
 * Run: node scripts/download-images.mjs
 */
import { mkdir, writeFile, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'src', 'assets', 'images')
const MIN_SIZE = 5000
const FORCE = process.argv.includes('--force')

const U = (slug, w = 800) =>
  `https://images.unsplash.com/${slug}?w=${w}&q=80&fit=crop`

const SOURCES = [
  { name: 'hero-sunrise.jpg', url: U('photo-1507525428034-b723cf961d3e', 1200) },
  { name: 'morning-light.jpg', url: U('photo-1470071459604-3b5ec3a7fe05', 800) },
  { name: 'ocean-sunrise.jpg', url: U('photo-1505142468610-359e7d316be0', 800) },
  { name: 'warm-sunset.jpg', url: U('photo-1519681393784-d120267933ba', 800) },
  { name: 'nature-green.jpg', url: U('photo-1441974231531-c6227db76b6e', 800) },
  { name: 'soft-clouds.jpg', url: U('photo-1472214103451-9374bd1c798e', 800) },
  { name: 'night-calm.jpg', url: U('photo-1477959858617-67f85cf4f1df', 800) },
  { name: 'flowers.jpg', url: U('photo-1465495976277-4387d4b0b4c6', 800) },
  { name: 'hands-care.jpg', url: U('photo-1579684385127-1ef15d508118', 600) },
  { name: 'sunshine.jpg', url: U('photo-1544367567-0f2fcb009e0b', 600) },
  { name: 'family.jpg', url: U('photo-1529156069898-49953e39b3ac', 600) },
  { name: 'book-hope.jpg', url: U('photo-1507842217343-583bb7270b66', 600) },
  { name: 'breath.jpg', url: U('photo-1507003211169-0a1dd7228f2d', 600) },
]

async function download(url) {
  const buf = execSync(`curl -sL -A "Mozilla/5.0" "${url}"`, {
    encoding: null,
    maxBuffer: 10 * 1024 * 1024,
  })
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
