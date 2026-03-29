import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import { getSleepTips, getCalmingPrompts, getBodyScan, getSleepStory } from '../data/sleepContent'
import { SLEEP_AMBIENT_TRACKS } from '../data/sleepAmbientTracks'
import { useTranslation, useLocale } from '../i18n/context'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { Wind, BookOpen, Volume2 } from '../components/icons'
import { SoundWaveBars } from '../components/SoundWaveBars'
import { SereneLayers } from '../components/SereneLayers'
import { Cloud, Music, Square, X, Sun, Moon } from 'lucide-react'
import { BodyScanSilhouette } from '../components/BodyScanSilhouette'
import { BreathingOrb } from '../components/BreathingOrb'

type View = 'main' | 'breathing' | 'bodyScan' | 'sleepStory' | 'tip' | 'listening' | 'soundscape'
type CardId = 'audio' | 'bodyScan' | 'music'

export default function SleepSupport() {
  const location = useLocation()
  const backTo = ((location.state as { from?: string })?.from) ?? '/'
  const t = useTranslation()
  const locale = useLocale()
  const sleep = t.sleep as Record<string, string>
  const sleepTips = getSleepTips(locale)
  const calmingPrompts = getCalmingPrompts(locale)
  const bodyScan = getBodyScan(locale)
  const sleepStory = getSleepStory(locale)
  const audioPlayer = useAudioPlayer(locale)
  const [view, setView] = useState<View>('main')
  const [isRedShift, setIsRedShift] = useState(true)
  const [tipIndex, setTipIndex] = useState(0)
  const [scanStep, setScanStep] = useState(0)
  const [storyStep, setStoryStep] = useState(0)
  const [activeCard, setActiveCard] = useState<CardId | null>(null)
  const isListening = audioPlayer.isPlaying

  useEffect(() => {
    setView((v) => (isListening ? 'listening' : v === 'listening' ? 'main' : v))
  }, [isListening])

  const showTip = (i: number) => {
    setTipIndex(i)
    setView('tip')
  }

  const breath478 = locale === 'zh'
    ? '吸气4秒，屏息2秒，呼气6秒。每3个循环略微放慢，引导心率下降。'
    : 'Inhale 4s, hold 2s, exhale 6s. Gradually slows every 3 cycles to lead your heart rate down.'

  const bgStyle = {
    backgroundColor: '#000000',
    ...(isRedShift && {
      filter: 'sepia(100%) saturate(200%) hue-rotate(-30deg)',
    }),
  }

  return (
    <motion.div
      className="min-h-dvh pt-safe pb-safe pb-12 overflow-x-hidden overflow-y-auto"
      style={bgStyle}
    >
      <div className="fixed inset-0 -z-10 bg-black" />

      {/* Hero - back link, no drag (drag conflicted with scroll) */}
      <div className="relative -mx-4 mb-4 h-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-transparent" />
        <Link to={backTo} className="absolute top-4 left-4 z-10 text-white/70 hover:text-white text-sm">
          ← {String(t.back)}
        </Link>
        <div className="absolute inset-0 flex items-end pb-6 px-6">
          <div>
            <h1 className="text-2xl font-bold text-white/95 drop-shadow animate-fade-in-up">
              {String(sleep.title)}
            </h1>
            <p className="text-sm text-white/70 mt-1 animate-fade-in-up stagger-1">
              {String(sleep.subtitle)}
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsRedShift(!isRedShift) }}
            className="p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
            aria-label={isRedShift ? 'Disable red shift' : 'Enable red shift'}
          >
            {isRedShift ? <Sun className="w-5 h-5" strokeWidth={2} /> : <Moon className="w-5 h-5" strokeWidth={2} />}
          </button>
        </div>
      </div>

      <div className="px-4 -mt-2">

        {view === 'listening' && (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white/60 text-center mb-10 px-6 text-sm">
              {String(sleep.putPhoneDown ?? sleep.subtitle)}
            </p>
            <div className="w-24 h-24 rounded-full bg-teal-500/20 flex items-center justify-center mb-12 animate-pulse">
              <Volume2 className="w-12 h-12 text-teal-400/80" strokeWidth={1.5} />
            </div>
            <div className="flex gap-4">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); audioPlayer.handleStop() }}
              className="min-w-[120px] py-3.5 px-6 rounded-2xl bg-white/10 text-white/90 font-medium border border-white/20 hover:bg-white/15 transition-colors"
            >
                {String(sleep.stopListening)}
              </button>
            </div>
          </motion.div>
        )}

        {view === 'main' && (
          <div className="space-y-6 animate-fade-in">
            {/* Cover Flow - horizontal swiper */}
            <div className="mb-8">
              <h3 className="text-sm text-white/50 mb-3">{locale === 'zh' ? '选择一项' : 'Choose one'}</h3>
              <Swiper
                modules={[FreeMode]}
                spaceBetween={16}
                slidesPerView={1.2}
                freeMode={{ enabled: true, momentum: false }}
                className="!overflow-visible"
              >
                <SwiperSlide>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveCard('audio') }}
                    className={`w-full aspect-[5/2] rounded-2xl p-3 flex flex-col items-center justify-center gap-1 transition-colors ${
                      audioPlayer.isPlaying
                        ? 'bg-teal-500/30 border border-teal-500/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Cloud className="w-8 h-8 text-teal-400/80" strokeWidth={1.5} />
                      {audioPlayer.isPlaying && <SoundWaveBars isActive className="ml-1" />}
                    </div>
                    <span className="text-white/90 font-medium">{String(sleep.audioController ?? sleep.soundscape)}</span>
                    <span className="text-xs text-white/50">{String(sleep.audioControllerSub ?? sleep.soundscapeSub)}</span>
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setScanStep(0); setView('bodyScan') }}
                    className="w-full aspect-[5/2] rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-14 text-teal-400/80">
                      <BodyScanSilhouette step={0} totalSteps={bodyScan.content.length} />
                    </div>
                    <span className="text-white/90 font-medium">{String(sleep.bodyScan)}</span>
                    <span className="text-xs text-white/50">{String(sleep.bodyScanSub)}</span>
                  </button>
                </SwiperSlide>
                <SwiperSlide>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveCard('music') }}
                    className="w-full aspect-[5/2] rounded-2xl bg-white/5 border border-white/10 p-3 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors"
                  >
                    <Music className="w-8 h-8 text-amber-400/80" strokeWidth={1.5} />
                    <span className="text-white/90 font-medium">{locale === 'zh' ? '环境音乐' : 'Ambient music'}</span>
                    <span className="text-xs text-white/50">Piano · Pads</span>
                  </button>
                </SwiperSlide>
              </Swiper>
            </div>

            {/* Serene Layers - Audio */}
            {activeCard === 'audio' && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="font-semibold text-white mb-6">{String(sleep.audioController ?? sleep.soundscape)}</h3>
                <SereneLayers
                  activePreset={audioPlayer.activePreset}
                  isLoading={audioPlayer.isLoading}
                  addFeedback={audioPlayer.addFeedback}
                  mixerTracks={audioPlayer.mixerTracks}
                  applyPreset={audioPlayer.applyPreset}
                  handleAdd={audioPlayer.handleAdd}
                  handleRemove={audioPlayer.handleRemove}
                  handlePlayMix={audioPlayer.handlePlayMix}
                  locale={locale}
                  t={sleep}
                />
                <p className="text-[10px] text-white/40 mt-4">
                  {locale === 'zh' ? '锁屏或通知栏可控制播放' : 'Control from lock screen'}
                </p>
              </div>
            )}

            {/* Music panel - Ambient Piano & Celestial Pads - add to mixer */}
            {activeCard === 'music' && (
              <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 space-y-3">
                <h3 className="font-semibold text-white">{locale === 'zh' ? '环境音乐' : 'Ambient music'}</h3>
                {SLEEP_AMBIENT_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      audioPlayer.handleAdd({
                        id: track.id,
                        category: 'ambiance',
                        titleEn: track.title,
                        titleZh: track.titleZh,
                        url: track.url,
                        durationSec: 0,
                      })
                    }}
                    className="block w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-sm"
                  >
                    {locale === 'zh' ? track.titleZh : track.title}
                  </button>
                ))}
                {audioPlayer.mixerTracks.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs text-white/50">{locale === 'zh' ? '混音器音轨' : 'Mixer tracks'}</h4>
                    {audioPlayer.mixerTracks.map((track, i) => (
                      <div key={`${track.id}-${i}`} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-white/80 truncate flex-1">{locale === 'zh' ? track.titleZh : track.titleEn}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); audioPlayer.handleRemove(i) }}
                          disabled={audioPlayer.isLoading}
                          className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400"
                          aria-label={locale === 'zh' ? '移除' : 'Remove'}
                        >
                          <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {audioPlayer.mixerTracks.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      audioPlayer.handlePlayMix()
                    }}
                    disabled={audioPlayer.isLoading}
                    className="mt-2 w-full py-3 rounded-xl bg-teal-500/60 hover:bg-teal-500/80 text-white font-medium flex items-center justify-center gap-2"
                  >
                    {locale === 'zh' ? `播放混音 (${audioPlayer.mixerTracks.length})` : `Play mix (${audioPlayer.mixerTracks.length})`}
                  </button>
                )}
                <button type="button" onClick={(e) => { e.stopPropagation(); setActiveCard(null) }} className="text-sm text-white/60 hover:text-white">
                  {String(sleep.back)}
                </button>
              </div>
            )}

            {/* Breathing */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setView('breathing') }}
              className="w-full flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-teal-500/30 hover:bg-white/8 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                <Wind className="w-7 h-7 text-teal-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white/95">{String(sleep.breathing)}</h3>
                <p className="text-sm text-white/60 mt-0.5">{breath478}</p>
              </div>
            </button>

            {/* Sleep story */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setStoryStep(0); setView('sleepStory') }}
              className="w-full flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 hover:bg-white/8 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-amber-400/90" strokeWidth={1.5} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-white/95">{String(sleep.sleepStory)}</h3>
                <p className="text-sm text-white/60 mt-0.5">{String(sleep.sleepStorySub)}</p>
              </div>
            </button>

            {/* Tips */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-4">{String(sleep.ifCantSleep)}</h3>
              <div className="space-y-2">
                {sleepTips.map((tip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); showTip(i) }}
                    className="w-full text-left p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
                  >
                    <p className="text-sm">{tip.title}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Calming prompts */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold text-white/90 mb-4">{String(sleep.tryThinking)}</h3>
              <ul className="space-y-3">
                {calmingPrompts.map((p, i) => (
                  <li key={i} className="text-sm text-white/70 leading-relaxed flex items-start gap-2">
                    <span className="text-teal-400/80 mt-0.5">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/chat"
              state={{ fromSleep: true, from: '/sleep' }}
              className="block w-full text-center py-3.5 rounded-xl border border-teal-500/40 text-teal-400/90 font-medium bg-white/5 hover:bg-teal-500/20 transition-colors"
            >
              {String(sleep.chatLink)}
            </Link>
          </div>
        )}

        {view === 'breathing' && (
          <div className="flex flex-col items-center py-8 animate-fade-in">
            <p className="text-teal-400 font-bold mb-2">{String(sleep.breathing)}</p>
            <p className="text-sm text-white/60 mb-8 text-center max-w-xs leading-relaxed">
              {breath478}
            </p>
            <div className="mb-10 flex items-center justify-center">
              <BreathingOrb />
            </div>
            <p className="text-xs text-white/50 mb-8">
              {locale === 'zh' ? '4秒吸 · 2秒屏 · 6秒呼' : '4s in · 2s hold · 6s out'}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setView('main') }}
              className="text-sm text-white/50 hover:text-white/70"
            >
              {String(sleep.back)}
            </button>
          </div>
        )}

        {view === 'bodyScan' && (
          <BodyScanView
            bodyScan={bodyScan}
            step={scanStep}
            onNext={() => setScanStep((s) => Math.min(s + 1, bodyScan.content.length - 1))}
            onBack={() => setView('main')}
            nextLabel={String(sleep.next)}
            backLabel={String(sleep.back)}
          />
        )}

        {view === 'sleepStory' && (
          <SleepStoryView
            story={sleepStory}
            step={storyStep}
            onNext={() => setStoryStep((s) => Math.min(s + 1, sleepStory.content.length - 1))}
            onBack={() => setView('main')}
            nextLabel={String(sleep.next)}
            backLabel={String(sleep.back)}
          />
        )}

        {view === 'tip' && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-fade-in">
            <h3 className="font-semibold text-white/95 mb-4">
              {sleepTips[tipIndex].title}
            </h3>
            <p className="text-white/80 leading-relaxed mb-8">
              {sleepTips[tipIndex].content}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setView('main') }}
              className="text-teal-400 font-medium"
            >
              ← {String(sleep.back)}
            </button>
          </div>
        )}

      </div>

      {/* Now Playing bar - hide when in listening view (that view has its own stop button) */}
      <AnimatePresence>
        {audioPlayer.isPlaying && audioPlayer.activeTrack && view !== 'listening' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 right-0 bottom-0 z-50 pb-safe px-4 pb-4"
          >
            <div
              className="rounded-2xl border border-white/15 shadow-2xl overflow-hidden"
              style={{ backgroundColor: '#000000' }}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{audioPlayer.activeTrack.title}</p>
                  <p className="text-xs text-white/50">{locale === 'zh' ? '正在播放' : 'Now playing'}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    audioPlayer.handleStop()
                  }}
                  className="shrink-0 w-12 h-12 rounded-xl bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white/90 transition-colors"
                  aria-label={locale === 'zh' ? '停止' : 'Stop'}
                >
                  <Square className="w-5 h-5" fill="currentColor" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function BodyScanView({
  bodyScan,
  step,
  onNext,
  onBack,
  nextLabel,
  backLabel,
}: {
  bodyScan: { title: string; subtitle: string; content: string[] }
  step: number
  onNext: () => void
  onBack: () => void
  nextLabel: string
  backLabel: string
}) {
  const isLast = step >= bodyScan.content.length - 1
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="font-semibold text-white/95">{bodyScan.title}</h3>
        <p className="text-sm text-white/60 mt-1">{bodyScan.subtitle}</p>
      </div>
      <div className="flex justify-center mb-6 text-teal-400/80">
        <BodyScanSilhouette step={step} totalSteps={bodyScan.content.length} className="w-20 h-40" />
      </div>
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 min-h-[200px] flex flex-col justify-center">
        <p className="text-lg text-white/90 leading-relaxed">
          {bodyScan.content[step]}
        </p>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          disabled={isLast}
          className={`flex-1 py-3.5 rounded-xl font-medium transition-colors ${
            isLast
              ? 'bg-teal-500/30 text-teal-300/80'
              : 'bg-teal-500/60 text-white hover:bg-teal-500/80'
          }`}
        >
          {isLast ? '...' : nextLabel}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onBack() }} className="px-6 py-3.5 text-white/60 hover:text-white">
          {backLabel}
        </button>
      </div>
    </div>
  )
}

function SleepStoryView({
  story,
  step,
  onNext,
  onBack,
  nextLabel,
  backLabel,
}: {
  story: { title: string; subtitle: string; content: string[] }
  step: number
  onNext: () => void
  onBack: () => void
  nextLabel: string
  backLabel: string
}) {
  const isLast = step >= story.content.length - 1
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="font-semibold text-white/95">{story.title}</h3>
        <p className="text-sm text-white/60 mt-1">{story.subtitle}</p>
      </div>
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 min-h-[220px] flex flex-col justify-center">
        <p className="text-lg text-white/85 leading-loose">
          {story.content[step]}
        </p>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          disabled={isLast}
          className={`flex-1 py-3.5 rounded-xl font-medium transition-colors ${
            isLast
              ? 'bg-amber-500/20 text-amber-300/80'
              : 'bg-amber-500/40 text-white hover:bg-amber-500/60'
          }`}
        >
          {isLast ? '...' : nextLabel}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onBack() }} className="px-6 py-3.5 text-white/60 hover:text-white">
          {backLabel}
        </button>
      </div>
    </div>
  )
}
