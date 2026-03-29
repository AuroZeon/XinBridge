/**
 * Sanctuary Audio UI - Presets + Mixer (add tracks) + Play button
 * Add sounds to mixer first, then Play to start. Presets auto-play.
 */
import type { HarmonyPreset } from '../hooks/useAudioPlayer'
import type { SoundTrack } from '../data/soundLibrary'
import { SOUND_LIBRARY } from '../data/soundLibrary'
import { Check, Play, Plus, X } from 'lucide-react'

interface SereneLayersProps {
  activePreset: HarmonyPreset | null
  isLoading: boolean
  addFeedback: string | null
  mixerTracks: SoundTrack[]
  applyPreset: (p: HarmonyPreset) => void
  handleAdd: (track: SoundTrack) => void
  handleRemove: (index: number) => void
  handlePlayMix: () => void
  locale: 'zh' | 'en'
  t: Record<string, string>
}

export function SereneLayers({
  activePreset,
  isLoading,
  addFeedback,
  mixerTracks,
  applyPreset,
  handleAdd,
  handleRemove,
  handlePlayMix,
  locale,
  t,
}: SereneLayersProps) {
  const presets: { id: HarmonyPreset; label: string }[] = [
    { id: 'deepSleep', label: String(t.deepSleep ?? 'Deep Sleep') },
    { id: 'calmMind', label: String(t.calmMind ?? 'Calm Mind') },
    { id: 'pureNature', label: String(t.pureNature ?? 'Pure Nature') },
    { id: 'forestWalk', label: String(t.forestWalk ?? 'Forest Walk') },
    { id: 'riverFlow', label: String(t.riverFlow ?? 'River Flow') },
  ]

  const allTracks = [...SOUND_LIBRARY.nature, ...SOUND_LIBRARY.ambiance]
  const mixerIds = new Set(mixerTracks.map((x) => x.id))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* One-tap presets - auto-play when clicked */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              applyPreset(p.id)
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
              activePreset === p.id
                ? 'bg-teal-500/50 text-white border border-teal-400/60'
                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
            } ${isLoading ? 'opacity-80' : ''}`}
          >
            {isLoading && activePreset === p.id ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : null}
            {p.label}
          </button>
        ))}
      </div>

      {/* Mixer: add sounds, then Play */}
      <div>
        <h4 className="text-xs text-white/50 mb-2">{locale === 'zh' ? '添加音效到混音器' : 'Add sound to mixer'}</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {allTracks.map((track) => {
            const title = locale === 'zh' ? track.titleZh : track.titleEn
            const inMixer = mixerIds.has(track.id)
            const justAdded = addFeedback === title
            return (
              <div
                key={track.id}
                className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-white/80 truncate flex-1">{title}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleAdd(track)
                  }}
                  disabled={isLoading}
                  className="shrink-0 w-8 h-8 rounded-full bg-teal-500/30 hover:bg-teal-500/50 flex items-center justify-center text-teal-400 transition-colors disabled:opacity-50"
                  aria-label={locale === 'zh' ? `添加 ${title}` : `Add ${title}`}
                >
                  {inMixer || justAdded ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
                </button>
              </div>
            )
          })}
        </div>

        {mixerTracks.length > 0 && (
          <div className="mt-3 space-y-1">
            <h4 className="text-xs text-white/50 mb-2">{locale === 'zh' ? '混音器音轨' : 'Mixer tracks'}</h4>
            {mixerTracks.map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white/5 border border-white/10"
              >
                <span className="text-sm text-white/80 truncate flex-1">
                  {locale === 'zh' ? track.titleZh : track.titleEn}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemove(i)
                  }}
                  disabled={isLoading}
                  className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors disabled:opacity-50"
                  aria-label={locale === 'zh' ? `移除 ${track.titleZh}` : `Remove ${track.titleEn}`}
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {mixerTracks.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handlePlayMix()
            }}
            disabled={isLoading}
            className="mt-4 w-full py-3.5 rounded-xl bg-teal-500/60 hover:bg-teal-500/80 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" strokeWidth={2.5} />
            )}
            {locale === 'zh' ? `播放 (${mixerTracks.length})` : `Play (${mixerTracks.length})`}
          </button>
        )}
      </div>
    </div>
  )
}
