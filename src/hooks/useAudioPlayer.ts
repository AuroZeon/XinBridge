/**
 * Night Sanctuary Audio - Real-world sounds only. No programmed audio.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Howl, Howler } from 'howler'
import type { Locale } from '../i18n/locale'
import type { SoundTrack } from '../data/soundLibrary'
import { SOUND_LIBRARY, resolveTrackUrls } from '../data/soundLibrary'
import { getMeditationScript } from '../data/sleepContent'

export type HarmonyPreset = 'deepSleep' | 'calmMind' | 'pureNature' | 'forestWalk' | 'riverFlow'

const PRESETS: Record<HarmonyPreset, { foundationId: string; environmentId: string; voiceId: string }> = {
  deepSleep: { foundationId: '', environmentId: 'rain-windowsill', voiceId: '' },
  calmMind: { foundationId: '', environmentId: 'ocean-tide', voiceId: '' },
  pureNature: { foundationId: '', environmentId: 'ocean-tide', voiceId: '' },
  forestWalk: { foundationId: '', environmentId: 'forest-night', voiceId: '' },
  riverFlow: { foundationId: '', environmentId: 'stream', voiceId: '' },
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

function getTrackSrc(track: SoundTrack): string[] {
  const urls = resolveTrackUrls(track)
  if (urls.length) return urls
  if (track.url?.trim()) return [track.url]
  return []
}

export function useAudioPlayer(locale: Locale) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTrack, setActiveTrack] = useState<{ id: string; title: string } | null>(null)
  const [activePreset, setActivePreset] = useState<HarmonyPreset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [addFeedback, setAddFeedback] = useState<string | null>(null)
  const [mixerTracks, setMixerTracks] = useState<SoundTrack[]>([])

  const soundsRef = useRef<Howl[]>([])
  const mixerTracksRef = useRef<SoundTrack[]>([])
  const ttsCancelRef = useRef(false)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  mixerTracksRef.current = mixerTracks

  const ensureClean = useCallback(() => {
    for (const h of soundsRef.current) {
      try {
        h.stop()
        h.unload()
      } catch {
        /* ignore */
      }
    }
    soundsRef.current = []
    ttsCancelRef.current = true
    window.speechSynthesis?.cancel()
  }, [])

  const playUrlTrack = useCallback(
    (track: SoundTrack, volume = 0.7, skipClean = false): boolean => {
      const urls = getTrackSrc(track)
      if (urls.length === 0) {
        console.warn('[Sanctuary] Track missing URL:', track.id)
        return false
      }

      if (!skipClean) ensureClean()
      setIsLoading(true)
      const howl = new Howl({
        src: urls,
        html5: true,
        loop: true,
        volume: volume,
        preload: true,
        onloaderror: () => {
          setIsLoading(false)
          const idx = soundsRef.current.indexOf(howl)
          if (idx >= 0) soundsRef.current.splice(idx, 1)
          console.warn('[Sanctuary] Load failed:', urls[0])
        },
        onload: () => {
          setIsLoading(false)
          if (!soundsRef.current.includes(howl)) return
          howl.play()
          setActiveTrack({ id: track.id, title: locale === 'zh' ? track.titleZh : track.titleEn })
          setIsPlaying(true)
        },
      })
      soundsRef.current.push(howl)
      return true
    },
    [locale, ensureClean]
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

    ttsCancelRef.current = true
    window.speechSynthesis?.cancel()

    try {
      Howler.stop()
      Howler.unload()
    } catch {
      /* ignore */
    }

    for (const h of soundsRef.current) {
      try {
        h.stop()
        h.unload()
      } catch {
        /* ignore */
      }
    }
    soundsRef.current = []

  }, [])

  const handleAdd = useCallback(
    (track: SoundTrack) => {
      setMixerTracks((prev) => [...prev, track])
      setAddFeedback(locale === 'zh' ? track.titleZh : track.titleEn)
      setTimeout(() => setAddFeedback(null), 1500)
    },
    [locale]
  )

  const handleRemove = useCallback((index: number) => {
    setMixerTracks((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handlePlayMix = useCallback(() => {
    const tracks = mixerTracksRef.current
    if (tracks.length === 0) return

    ensureClean()
    setIsLoading(true)
    setActivePreset(null)
    const primaryTitle = locale === 'zh' ? tracks[0].titleZh : tracks[0].titleEn
    setActiveTrack({ id: tracks[0].id, title: primaryTitle })

    let loadedCount = 0
    let erroredCount = 0
    const total = tracks.length
    const maybeStart = () => {
      if (loadedCount + erroredCount >= total) {
        setIsLoading(false)
        if (soundsRef.current.length > 0) setIsPlaying(true)
        else setActiveTrack(null)
      }
    }

    const volumePerTrack = Math.min(0.7, 0.6 / Math.max(1, Math.sqrt(tracks.filter((t) => getTrackSrc(t).length > 0).length)))

    for (const track of tracks) {
      const urls = getTrackSrc(track)
      if (urls.length === 0) {
        console.warn('[Sanctuary] Track missing URL, skipping:', track.id)
        erroredCount++
        maybeStart()
        continue
      }

      const howl = new Howl({
        src: urls,
        html5: true,
        loop: true,
        volume: volumePerTrack,
        preload: true,
        onloaderror: () => {
          console.error('[Sanctuary] Load failed:', track.id, urls[0])
          erroredCount++
          const idx = soundsRef.current.indexOf(howl)
          if (idx >= 0) soundsRef.current.splice(idx, 1)
          maybeStart()
        },
        onload: () => {
          if (!soundsRef.current.includes(howl)) return
          howl.play()
          loadedCount++
          maybeStart()
        },
      })
      soundsRef.current.push(howl)
    }
  }, [locale, ensureClean])

  const applyPreset = useCallback(
    async (preset: HarmonyPreset) => {
      const cfg = PRESETS[preset]
      ensureClean()
      setActivePreset(preset)
      setIsLoading(false)

      const envTrack = findTrack(cfg.environmentId)
      const voiceTrack = cfg.voiceId ? findTrack(cfg.voiceId) : null

      if (envTrack) {
        playUrlTrack(envTrack, 0.6, true)
      } else if (!cfg.foundationId && !voiceTrack) {
        /* noop */
      }
      if (voiceTrack?.scriptId) {
        await playVoice(voiceTrack)
      }
    },
    [locale, ensureClean, playUrlTrack, playVoice]
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
    for (const h of soundsRef.current) {
      try {
        h.stop()
        h.unload()
      } catch {
        /* ignore */
      }
    }
    soundsRef.current = []
    window.speechSynthesis?.cancel()
  }, [])

  return {
    isPlaying,
    activeTrack,
    activePreset,
    isLoading,
    addFeedback,
    mixerTracks,
    handleStop,
    handleAdd,
    handleRemove,
    handlePlayMix,
    applyPreset,
    presets: PRESETS,
    tracks: SOUND_LIBRARY,
  }
}
