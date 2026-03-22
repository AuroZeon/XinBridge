/**
 * Nightly Quest - semi-transparent top bar with 3 random missions
 */
import { motion } from 'framer-motion'

export interface MissionDisplay {
  id: string
  label: string
  progress: number
  target: number
  done: boolean
}

export default function NightlyQuestHUD({
  missions,
  sparks,
  freeMode,
  onToggleFreeMode,
  locale,
}: {
  missions: MissionDisplay[]
  sparks: number
  freeMode: boolean
  onToggleFreeMode: () => void
  locale: 'zh' | 'en'
}) {
  return (
    <motion.div
      className="absolute top-0 left-0 right-0 z-20 px-3 py-2 bg-black/60 backdrop-blur-md border-b border-white/10"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs text-amber-400/90 font-medium">
          ✦ {locale === 'zh' ? `星火 ${sparks}` : `Sparks ${sparks}`}
        </span>
        <button
          type="button"
          onClick={onToggleFreeMode}
          className="text-[10px] px-2 py-0.5 rounded text-white/60 hover:text-white/90"
        >
          {freeMode ? (locale === 'zh' ? '自由模式' : 'Free Mode') : (locale === 'zh' ? '任务模式' : 'Missions')}
        </button>
      </div>
      {!freeMode && (
        <div className="space-y-1">
          {missions.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[10px]">
                  <span className="truncate text-white/70">{m.label}</span>
                  <span className={m.done ? 'text-amber-400' : 'text-white/50'}>
                    {m.progress}/{m.target}
                  </span>
                </div>
                <div className="h-0.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
                  <motion.div
                    className="h-full bg-amber-400/80 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
              {m.done && <span className="text-amber-400 text-xs">✓</span>}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
