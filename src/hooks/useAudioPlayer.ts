/**
 * Night Sanctuary Audio - Singleton controller
 * soundRef: single Howl instance. proceduralRef: Web Audio fallback.
 * Clean lifecycle: stop+unload before play, cleanup on unmount.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import type { Locale } from '../i18n/locale'
import type { SoundTrack } from '../data/soundLibrary'
import { SOUND_LIBRARY } from '../data/soundLibrary'
import { getMeditationScript } from '../data/sleepContent'

export type HarmonyPreset = 'deepSleep' | 'calmMind' | 'pureNature'

const PRESETS: Record<HarmonyPreset, { foundationId: string; environmentId: string; voiceId: string }> = {
  deepSleep: { foundationId: 'binaural-delta', environmentId: 'rain-windowsill', voiceId: '' },
  calmMind: { foundationId: 'binaural-delta', environmentId: 'ocean-tide', voiceId: '' },
  pureNature: { foundationId: '', environmentId: 'ocean-tide', voiceId: '' },
}

function createWhiteNoise(): { gain: GainNode; stop: () => void } | null {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
    const dataL = buffer.getChannelData(0)
    const dataR = buffer.getChannelData(1)
    for (let i = 0; i < bufferSize; i++) {
      dataL[i] = (Math.random() * 2 - 1) * 0.3
      dataR[i] = (Math.random() * 2 - 1) * 0.3
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 4000
    const gain = ctx.createGain()
    gain.gain.value = 0.4
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(0)
    return { gain, stop: () => { source.stop(); ctx.close() } }
  } catch {
    return null
  }
}

function createBinauralDelta(): { gain: GainNode; stop: () => void } | null {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const gain = ctx.createGain()
    gain.gain.value = 0.3
    gain.connect(ctx.destination)
    const left = ctx.createOscillator()
    const right = ctx.createOscillator()
    left.type = right.type = 'sine'
    left.frequency.value = 200
    right.frequency.value = 201.5
    const merger = ctx.createChannelMerger(2)
    left.connect(merger, 0, 0)
    right.connect(merger, 0, 1)
    merger.connect(gain)
    left.start(0)
    right.start(0)
    return { gain, stop: () => { left.stop(); right.stop(); ctx.close() } }
  } catch {
    return null
  }
}

function speakPhrase(text: string, lang: string, voice: SpeechSynthesisVoice | null): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve()
      return
    }
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.7
    u.pitch = 0.8
    u.volume = 0.9
    u.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    if (voice) u.voice = voice
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

function findTrack(id: string): SoundTrack | null {
  for (const cat of ['nature', 'meditation', 'ambiance'] as const) {
    const t = SOUND_LIBRARY[cat].find((x) => x.id === id)
    if (t) return t
  }
  return null
}

export function useAudioPlayer(locale: Locale) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTrack, setActiveTrack] = useState<{ id: string; title: string } | null>(null)
  const [activePreset, setActivePreset] = useState<HarmonyPreset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [addFeedback, setAddFeedback] = useState<string | null>(null)

  const soundRef = useRef<Howl | null>(null)
  const proceduralRef = useRef<{ gain: GainNode; stop: () => void } | null>(null)
  const ttsCancelRef = useRef(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  const ensureClean = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop()
      soundRef.current.unload()
      soundRef.current = null
    }
    proceduralRef.current?.stop()
    proceduralRef.current = null
    ttsCancelRef.current = true
    window.speechSynthesis?.cancel()
  }, [])

  const playUrlTrack = useCallback(
    (track: SoundTrack, volume = 0.7, skipClean = false): boolean => {
      const url = track.url?.trim()
      if (!url) {
        console.warn('[Sanctuary] Track missing URL:', track.id, '→ fallback to white noise')
        const proc = createWhiteNoise()
        if (!proc) return false
        if (!skipClean) ensureClean()
        proceduralRef.current = proc
        setActiveTrack({ id: track.id, title: locale === 'zh' ? track.titleZh : track.titleEn })
        setIsPlaying(true)
        return true
      }

      if (!skipClean) ensureClean()
      setIsLoading(true)
      const howl = new Howl({
        src: [url],
        loop: true,
        volume: volume,
        onloaderror: () => {
          setIsLoading(false)
          console.warn('[Sanctuary] Load failed:', url, '→ fallback to white noise')
          const proc = createWhiteNoise()
          if (proc) {
            soundRef.current?.stop()
            soundRef.current?.unload()
            soundRef.current = null
            proceduralRef.current = proc
            setActiveTrack({ id: track.id, title: locale === 'zh' ? track.titleZh : track.titleEn })
            setIsPlaying(true)
          }
        },
        onload: () => {
          setIsLoading(false)
          howl.play()
          soundRef.current = howl
          setActiveTrack({ id: track.id, title: locale === 'zh' ? track.titleZh : track.titleEn })
          setIsPlaying(true)
        },
      })
      return true
    },
    [locale, ensureClean]
  )

  const playProcedural = useCallback(
    (id: string, title: string, skipClean = false): boolean => {
      if (id === 'binaural-delta') {
        const proc = createBinauralDelta()
        if (!proc) return false
        if (!skipClean) ensureClean()
        proceduralRef.current = proc
        setActiveTrack({ id, title })
        setIsPlaying(true)
        return true
      }
      return false
    },
    [ensureClean]
  )

  const playVoice = useCallback(
    async (track: SoundTrack): Promise<boolean> => {
      const script = getMeditationScript(locale, track.scriptId!)
      if (!script.length) return false
      const voice = voicesRef.current.find((v) => (locale === 'zh' ? v.lang.startsWith('zh') : v.lang.startsWith('en'))) ?? voicesRef.current[0] ?? null
      ensureClean()
      ttsCancelRef.current = false
      setActiveTrack({ id: track.id, title: locale === 'zh' ? track.titleZh : track.titleEn })
      setIsPlaying(true)
      for (const phrase of script) {
        if (ttsCancelRef.current) break
        await speakPhrase(phrase, locale === 'zh' ? 'zh' : 'en', voice)
        if (ttsCancelRef.current) break
        await new Promise((r) => setTimeout(r, 2600))
      }
      setActiveTrack(null)
      setIsPlaying(false)
      return true
    },
    [locale, ensureClean]
  )

  const handleStop = useCallback(() => {
    setIsPlaying(false)
    setActivePreset(null)
    setActiveTrack(null)

    const h = soundRef.current
    if (h && typeof h.fade === 'function') {
      const cur = h.volume()
      h.fade(typeof cur === 'number' ? cur : 0, 0, 500)
      setTimeout(() => {
        h.stop()
        h.unload()
        soundRef.current = null
      }, 520)
    } else {
      soundRef.current?.stop()
      soundRef.current?.unload()
      soundRef.current = null
    }

    const proc = proceduralRef.current
    if (proc?.gain?.gain) {
      proc.gain.gain.cancelScheduledValues(proc.gain.context.currentTime)
      proc.gain.gain.setTargetAtTime(0, proc.gain.context.currentTime, 0.15)
      setTimeout(() => {
        proc.stop()
        proceduralRef.current = null
      }, 520)
    } else {
      proceduralRef.current?.stop()
      proceduralRef.current = null
    }

    ttsCancelRef.current = true
    window.speechSynthesis?.cancel()
  }, [])

  const handleAdd = useCallback(
    (track: SoundTrack) => {
      const title = locale === 'zh' ? track.titleZh : track.titleEn
      if (!track.url?.trim()) {
        console.warn('[Sanctuary] Add: track missing URL:', track.id, '→ white noise fallback')
        const proc = createWhiteNoise()
        if (!proc) return
        ensureClean()
        proceduralRef.current = proc
        setActiveTrack({ id: track.id, title })
        setIsPlaying(true)
      } else {
        ensureClean()
        setIsLoading(true)
        const howl = new Howl({
          src: [track.url],
          loop: true,
          volume: 0.7,
          onloaderror: () => {
            setIsLoading(false)
            console.warn('[Sanctuary] Add failed:', track.url, '→ white noise')
            const proc = createWhiteNoise()
            if (proc) {
              proceduralRef.current = proc
              setActiveTrack({ id: track.id, title })
              setIsPlaying(true)
            }
          },
          onload: () => {
            setIsLoading(false)
            howl.play()
            soundRef.current = howl
            setActiveTrack({ id: track.id, title })
            setIsPlaying(true)
          },
        })
      }
      setAddFeedback(title)
      setTimeout(() => setAddFeedback(null), 1500)
    },
    [locale, ensureClean]
  )

  const applyPreset = useCallback(
    async (preset: HarmonyPreset) => {
      const cfg = PRESETS[preset]
      ensureClean()
      setActivePreset(preset)
      setIsLoading(true)

      const envTrack = findTrack(cfg.environmentId)
      const voiceTrack = cfg.voiceId ? findTrack(cfg.voiceId) : null

      if (cfg.foundationId === 'binaural-delta') {
        playProcedural('binaural-delta', locale === 'zh' ? '双耳波' : 'Binaural', true)
      }
      if (envTrack) {
        playUrlTrack(envTrack, 0.6, true)
      } else if (!cfg.foundationId && !voiceTrack) {
        setIsLoading(false)
      }
      if (voiceTrack?.scriptId) {
        await playVoice(voiceTrack)
        setIsLoading(false)
      } else if (envTrack || cfg.foundationId) {
        setIsLoading(false)
      }
    },
    [locale, ensureClean, playUrlTrack, playProcedural, playVoice]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices() }
    if (voicesRef.current.length) load()
    else window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load)
  }, [])

  useEffect(() => {
    const nav = navigator as {
      mediaSession?: {
        metadata?: unknown
        playbackState?: string
        setActionHandler: (a: string, fn: (() => void) | null) => void
      }
    }
    if (!nav.mediaSession) return
    try {
      const MM = (window as unknown as { MediaMetadata?: new (o: { title: string; artist: string }) => unknown }).MediaMetadata
      if (MM) nav.mediaSession.metadata = new MM({ title: activeTrack?.title ?? 'Night Sanctuary', artist: 'XinBridge' })
      nav.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
      nav.mediaSession.setActionHandler('pause', handleStop)
      nav.mediaSession.setActionHandler('stop', handleStop)
    } catch { /* ok */ }
    return () => {
      nav.mediaSession!.setActionHandler('pause', null)
      nav.mediaSession!.setActionHandler('stop', null)
    }
  }, [isPlaying, activeTrack, handleStop])

  useEffect(() => () => {
    soundRef.current?.stop()
    soundRef.current?.unload()
    soundRef.current = null
    proceduralRef.current?.stop()
    proceduralRef.current = null
    window.speechSynthesis?.cancel()
  }, [])

  return {
    isPlaying,
    activeTrack,
    activePreset,
    isLoading,
    addFeedback,
    handleStop,
    handleAdd,
    applyPreset,
    presets: PRESETS,
    tracks: SOUND_LIBRARY,
  }
}
