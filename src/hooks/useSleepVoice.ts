/**
 * Hands-free sleep voice - TTS or pre-recorded guided meditation.
 * Modes: 1) Pre-recorded stream (free meditation URLs), 2) TTS (Puter/unturf/Web Speech).
 * Background: soft ambient pad. Music stops when voice stops.
 */
import { useCallback, useRef, useState, useEffect } from 'react'
import { getItem, setItem } from '../utils/storage'
import { getVoiceScript } from '../data/sleepContent'
import { SLEEP_VOICE_TRACKS } from '../data/sleepVoiceTracks'
import { AMBIENT_VOLUME } from '../data/ambientMusic'
import type { Locale } from '../i18n/locale'

const PAUSE_BETWEEN_PHRASES_MS = 2600
const PLAYBACK_RATE = 0.88

/** Soft, remote, classical-style pad - calming, suitable for cancer patients. */
function createSoftAmbientPad(): { stop: () => void } | null {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const gain = ctx.createGain()
    gain.gain.value = AMBIENT_VOLUME
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800
    filter.Q.value = 0.2
    gain.connect(filter)
    filter.connect(ctx.destination)

    const play = (freq: number): OscillatorNode => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(0)
      return osc
    }
    const oscs = [play(164), play(196), play(246), play(130)]

    return {
      stop: () => {
        oscs.forEach((o) => o.stop())
        ctx.close()
      },
    }
  } catch {
    return null
  }
}

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2speech: (text: string, options?: string | { language?: string; engine?: string }) => Promise<HTMLAudioElement>
      }
    }
  }
}

type TTSProvider = 'puter' | 'unturf' | 'webspeech' | null

async function speakWithPuter(text: string, lang: string): Promise<boolean> {
  const puter = typeof window !== 'undefined' ? window.puter : undefined
  if (!puter?.ai?.txt2speech) return false
  try {
    const opts = { language: lang === 'zh' ? 'zh-CN' : 'en-US', engine: 'neural' as const }
    const audio = await puter.ai.txt2speech(text, opts)
    audio.playbackRate = PLAYBACK_RATE
    return new Promise((resolve) => {
      audio.onended = () => resolve(true)
      audio.onerror = () => resolve(true)
      audio.play().catch(() => resolve(true))
    })
  } catch {
    return false
  }
}

async function speakWithUnturf(text: string, _lang: string): Promise<boolean> {
  try {
    const voice = 'aria'
    const res = await fetch('https://speech.ai.unturf.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text, voice }),
    })
    if (!res.ok) return false
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.playbackRate = PLAYBACK_RATE
    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url)
        resolve(true)
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(true)
      }
      audio.play().catch(() => resolve(true))
    })
  } catch {
    return false
  }
}

function getRemoteVoices(synth: SpeechSynthesis, lang: string): SpeechSynthesisVoice[] {
  const voices = synth.getVoices()
  const langMatch = lang.startsWith('zh')
    ? (v: SpeechSynthesisVoice) => v.lang.startsWith('zh')
    : (v: SpeechSynthesisVoice) => v.lang.startsWith('en')
  return voices.filter((v) => langMatch(v) && !v.localService)
}

async function speakWithWebSpeech(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null
): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.85
  utterance.pitch = 1.0
  utterance.volume = 0.85
  utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
  if (voice) utterance.voice = voice
  return new Promise((resolve) => {
    utterance.onend = () => resolve(true)
    utterance.onerror = () => resolve(true)
    synth.speak(utterance)
  })
}

function startAmbientMusic(): { stop: () => void } | null {
  return createSoftAmbientPad()
}

const STORAGE_TRACK_KEY = 'sleepVoiceTrackId'

export function useSleepVoice(locale: Locale) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [provider, setProvider] = useState<TTSProvider | 'stream'>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceId, setSelectedVoiceIdState] = useState<string>(() => getItem<string>('sleepVoiceId', ''))
  const [selectedTrackId, setSelectedTrackIdState] = useState<string>(() => getItem<string>(STORAGE_TRACK_KEY, ''))
  const cancelRef = useRef(false)
  const ambientRef = useRef<{ stop: () => void } | null>(null)
  const streamAudioRef = useRef<HTMLAudioElement | null>(null)

  const setSelectedVoiceId = useCallback((id: string) => {
    setSelectedVoiceIdState(id)
    setItem('sleepVoiceId', id)
  }, [])

  const setSelectedTrackId = useCallback((id: string) => {
    setSelectedTrackIdState(id)
    setItem(STORAGE_TRACK_KEY, id)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const synth = window.speechSynthesis
    const load = () => setVoices(synth.getVoices())
    if (synth.getVoices().length > 0) load()
    else synth.addEventListener('voiceschanged', load, { once: true })
  }, [])

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (cancelRef.current) return
      const lang = locale === 'zh' ? 'zh' : 'en'
      const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
      const remoteVoices = synth ? getRemoteVoices(synth, lang) : []
      const selectedVoice =
        selectedVoiceId && remoteVoices.some((v) => v.voiceURI === selectedVoiceId)
          ? remoteVoices.find((v) => v.voiceURI === selectedVoiceId) ?? null
          : null

      if (selectedVoice) {
        await speakWithWebSpeech(text, lang, selectedVoice)
        return
      }

      if (await speakWithPuter(text, lang)) return
      if (await speakWithUnturf(text, lang)) return

      const voice = remoteVoices[0]
      if (voice) await speakWithWebSpeech(text, lang, voice)
    },
    [locale, selectedVoiceId]
  )

  const playStream = useCallback(async (trackId: string) => {
    const track = SLEEP_VOICE_TRACKS.find((t) => t.id === trackId)
    if (!track) return
    const audio = new Audio(track.url)
    audio.loop = true
    audio.volume = 0.9
    streamAudioRef.current = audio
    try {
      await audio.play()
    } catch {
      streamAudioRef.current = null
      ambientRef.current?.stop()
      ambientRef.current = null
      setProvider(null)
      setIsPlaying(false)
      return
    }
    const onEnd = () => {
      if (!cancelRef.current) return
      cleanup()
    }
    const cleanup = () => {
      audio.pause()
      audio.src = ''
      streamAudioRef.current = null
      ambientRef.current?.stop()
      ambientRef.current = null
      setProvider(null)
      setIsPlaying(false)
    }
    audio.onended = onEnd
    audio.onerror = () => cleanup()
    while (!cancelRef.current) {
      await new Promise((r) => setTimeout(r, 500))
    }
    cleanup()
  }, [])

  const playLoop = useCallback(async () => {
    if (typeof window === 'undefined') {
      setIsSupported(false)
      return
    }
    cancelRef.current = false
    setIsPlaying(true)

    ambientRef.current = startAmbientMusic()

    if (selectedTrackId) {
      setProvider('stream')
      await playStream(selectedTrackId)
      return
    }

    const lang = locale === 'zh' ? 'zh' : 'en'
    const remoteVoices = getRemoteVoices(window.speechSynthesis, lang)
    const hasSelectedVoice =
      selectedVoiceId && remoteVoices.some((v) => v.voiceURI === selectedVoiceId)
    setProvider(hasSelectedVoice ? 'webspeech' : window.puter?.ai?.txt2speech ? 'puter' : 'unturf')

    const script = getVoiceScript(locale)
    const pause = () => new Promise((r) => setTimeout(r, PAUSE_BETWEEN_PHRASES_MS))
    while (!cancelRef.current) {
      for (const phrase of script) {
        if (cancelRef.current) break
        await speak(phrase)
        if (cancelRef.current) break
        await pause()
      }
    }
    window.speechSynthesis?.cancel()
    ambientRef.current?.stop()
    ambientRef.current = null
    setProvider(null)
    setIsPlaying(false)
  }, [locale, speak, selectedTrackId, playStream])

  const stop = useCallback(() => {
    cancelRef.current = true
    window.speechSynthesis?.cancel()
    if (streamAudioRef.current) {
      streamAudioRef.current.pause()
      streamAudioRef.current.src = ''
      streamAudioRef.current = null
    }
    ambientRef.current?.stop()
    ambientRef.current = null
    setProvider(null)
    setIsPlaying(false)
  }, [])

  const start = useCallback(() => {
    playLoop()
  }, [playLoop])

  const langFilter = locale === 'zh'
    ? (v: SpeechSynthesisVoice) => v.lang.startsWith('zh')
    : (v: SpeechSynthesisVoice) => v.lang.startsWith('en')
  const remoteOnly = (v: SpeechSynthesisVoice) => !v.localService
  const filteredVoices = voices.filter((v) => langFilter(v) && remoteOnly(v))

  return {
    isPlaying,
    isSupported,
    start,
    stop,
    voices: filteredVoices,
    selectedVoiceId,
    setSelectedVoiceId,
    provider,
    tracks: SLEEP_VOICE_TRACKS,
    selectedTrackId,
    setSelectedTrackId,
  }
}
