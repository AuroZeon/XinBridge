/** Zen bell - low-frequency pure tone via Web Audio API. CC0-style, no external assets. */
let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  return ctx
}

export function playZenBell(freq = 432, duration = 0.15): void {
  const c = getContext()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.12, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch {
    // ignore
  }
}

/** Musical notes for constellation completion (C4 pentatonic) */
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0]

export function playConstellationNote(index: number): void {
  playZenBell(PENTATONIC[index % PENTATONIC.length], 0.25)
}

/** Mission completion - ascending pentatonic arpeggio */
export function playSuccessChime(): void {
  const c = getContext()
  if (!c) return
  const notes = [261.63, 329.63, 392.0, 523.25]
  let t = c.currentTime
  for (let i = 0; i < notes.length; i++) {
    try {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.frequency.value = notes[i]
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      osc.start(t)
      osc.stop(t + 0.25)
    } catch {
      // ignore
    }
    t += 0.12
  }
}
