/**
 * Night Sanctuary Soundscape - layered audio with Howler/Web Audio
 * Base: brown noise. Overlays: nature (rain, wind, waves, zen). Voice: TTS from scripts.
 * Sleep timer: logarithmic fade over 2 min.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { getVoiceTracks } from '../data/sleepSoundscape'
import type { Locale } from '../i18n/locale'

const BASE_VOLUME = 0.4
const OVERLAY_VOLUME = 0.25
const FADE_MS = 120_000

function createBrownNoise(): { node: AudioNode; disconnect: () => void } | null {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
    const dataL = buffer.getChannelData(0)
    const dataR = buffer.getChannelData(1)
    let lastOutL = 0
    let lastOutR = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = (Math.random() * 2 - 1) * 0.5
      lastOutL = (lastOutL + (0.02 * white)) / 1.02
      lastOutR = (lastOutR + (0.02 * white)) / 1.02
      dataL[i] = lastOutL
      dataR[i] = lastOutR
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800
    filter.Q.value = 0.5
    const gain = ctx.createGain()
    gain.gain.value = BASE_VOLUME
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(0)
    return {
      node: gain,
      disconnect: () => {
        source.stop()
        source.disconnect()
        ctx.close()
      },
    }
  } catch {
    return null
  }
}

function createNatureOverlay(id: string): { gain: GainNode; disconnect: () => void } | null {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const gain = ctx.createGain()
    gain.gain.value = OVERLAY_VOLUME
    gain.connect(ctx.destination)

    if (id === 'rain') {
      const bufferSize = ctx.sampleRate * 0.5
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 4000
      filter.Q.value = 0.5
      source.connect(filter)
      filter.connect(gain)
      source.start(0)
      return {
        gain,
        disconnect: () => {
          source.stop()
          ctx.close()
        },
      }
    }
    if (id === 'wind') {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(80, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 3)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 6)
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.1
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 20
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      osc.connect(gain)
      osc.start(0)
      lfo.start(0)
      return {
        gain,
        disconnect: () => {
          osc.stop()
          lfo.stop()
          ctx.close()
        },
      }
    }
    if (id === 'waves') {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15 * Math.sin((i / bufferSize) * Math.PI * 4)
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 600
      source.connect(filter)
      filter.connect(gain)
      source.start(0)
      return {
        gain,
        disconnect: () => {
          source.stop()
          ctx.close()
        },
      }
    }
    if (id === 'zenBowls') {
      const playBell = () => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 2)
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.15, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4)
        osc.connect(g)
        g.connect(gain)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 4)
      }
      playBell()
      const iv = setInterval(playBell, 8000)
      return {
        gain,
        disconnect: () => {
          clearInterval(iv)
          ctx.close()
        },
      }
    }
    return null
  } catch {
    return null
  }
}

/** Logarithmic volume curve: starts fast, ends very gradual */
function logarithmicFade(progress: number): number {
  if (progress >= 1) return 0
  return 1 - Math.pow(progress, 0.4)
}

export function useSoundscape(locale: Locale) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set())
  const [sleepTimerMin, setSleepTimerMin] = useState<number | null>(null)
  const [voiceTrackId, setVoiceTrackId] = useState<string | null>(null)
  const baseRef = useRef<ReturnType<typeof createBrownNoise> | null>(null)
  const overlayRefs = useRef<Map<string, { gain?: GainNode; disconnect: () => void }>>(new Map())
  const fadeStartRef = useRef<number | null>(null)
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeOverlaysRef = useRef<Set<string>>(new Set())

  const voiceTracks = getVoiceTracks(locale)

  useEffect(() => {
    activeOverlaysRef.current = activeOverlays
  }, [activeOverlays])

  const startBase = useCallback(() => {
    if (baseRef.current) return
    baseRef.current = createBrownNoise()
  }, [])

  const stopAll = useCallback(() => {
    baseRef.current?.disconnect()
    baseRef.current = null
    overlayRefs.current.forEach((o) => o.disconnect())
    overlayRefs.current.clear()
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }
    fadeStartRef.current = null
  }, [])

  const startFade = useCallback(() => {
    fadeStartRef.current = Date.now()
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    fadeIntervalRef.current = setInterval(() => {
      const start = fadeStartRef.current
      if (!start) return
      const elapsed = Date.now() - start
      const progress = elapsed / FADE_MS
      if (progress >= 1) {
        stopAll()
        setIsPlaying(false)
        return
      }
      const vol = logarithmicFade(progress)
      const g = baseRef.current?.node as GainNode | undefined
      if (g?.gain) g.gain.setTargetAtTime(vol * BASE_VOLUME, 0, 0.1)
      overlayRefs.current.forEach((o) => {
        const entry = o as { gain?: GainNode }
        if (entry.gain?.gain) entry.gain.gain.setTargetAtTime(vol * OVERLAY_VOLUME, 0, 0.1)
      })
    }, 100)
  }, [stopAll])

  const toggleOverlay = useCallback((id: string) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        overlayRefs.current.get(id)?.disconnect()
        overlayRefs.current.delete(id)
        next.delete(id)
      } else {
        next.add(id)
        if (isPlaying) {
          const overlay = createNatureOverlay(id)
          if (overlay) overlayRefs.current.set(id, overlay)
        }
      }
      return next
    })
  }, [isPlaying])

  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMin(minutes)
    if (minutes !== null && isPlaying) startFade()
  }, [isPlaying, startFade])

  const start = useCallback(() => {
    stopAll()
    startBase()
    activeOverlaysRef.current.forEach((id) => {
      const o = createNatureOverlay(id)
      if (o) overlayRefs.current.set(id, o)
    })
    setIsPlaying(true)
    if (sleepTimerMin !== null) startFade()
  }, [startBase, stopAll, sleepTimerMin])

  const stop = useCallback(() => {
    stopAll()
    setIsPlaying(false)
  }, [stopAll])

  useEffect(() => {
    return () => stopAll()
  }, [stopAll])

  return {
    isPlaying,
    start,
    stop,
    activeOverlays,
    toggleOverlay,
    sleepTimerMin,
    setSleepTimer,
    voiceTrackId,
    setVoiceTrackId,
    voiceTracks,
    startFade,
  }
}
