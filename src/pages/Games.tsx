import { useState, useCallback, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLocale } from '../i18n/context'
import { motion, AnimatePresence } from 'framer-motion'
import GameFluidSand from './games/GameFluidSand'
import GameConstellation from './games/GameConstellation'
import GameBreatheSync from './games/GameBreatheSync'
import GameGeometricGarden from './games/GameGeometricGarden'
import GameLightPaint from './games/GameLightPaint'
import NightlyQuestHUD from '../components/NightlyQuestHUD'
import MissionCompleteBanner from '../components/MissionCompleteBanner'
import { useMissions, type MissionId } from '../hooks/useMissions'
import { successPulse } from '../utils/zenHaptics'
import { playSuccessChime } from '../utils/zenTone'
import { fireMissionConfetti } from '../utils/celebration'
import { Sparkles, Share2, Wind, Shapes, PenLine, Star, type LucideIcon } from 'lucide-react'

export type ZenGameId = 'fluid-sand' | 'constellation' | 'breathe-sync' | 'geometric-garden' | 'light-paint'

type GameMeta = {
  id: ZenGameId
  label: string
  labelZh: string
  tagline: string
  taglineZh: string
  icon: LucideIcon
  gradient: string
  iconBg: string
  visual: 'sand' | 'stars' | 'breath' | 'shapes' | 'glow'
}

const ZEN_GAMES: GameMeta[] = [
  { id: 'fluid-sand', label: 'Fluid Sand', labelZh: '流沙禅园', tagline: 'Touch & flow', taglineZh: '触碰流动', icon: Sparkles, gradient: 'from-amber-900/50 via-orange-800/30 to-amber-950/60', iconBg: 'bg-amber-500/30', visual: 'sand' },
  { id: 'constellation', label: 'Constellation', labelZh: '星座连线', tagline: 'Connect the stars', taglineZh: '连接星辰', icon: Share2, gradient: 'from-indigo-950/60 via-blue-950/40 to-slate-950/80', iconBg: 'bg-indigo-500/30', visual: 'stars' },
  { id: 'breathe-sync', label: 'Breathe-Sync', labelZh: '呼吸同步', tagline: 'In & out together', taglineZh: '同频呼吸', icon: Wind, gradient: 'from-teal-900/50 via-cyan-900/30 to-teal-950/60', iconBg: 'bg-teal-500/30', visual: 'breath' },
  { id: 'geometric-garden', label: 'Geometric Garden', labelZh: '几何花园', tagline: 'Drop & stack shapes', taglineZh: '投放堆叠', icon: Shapes, gradient: 'from-emerald-900/50 via-green-900/30 to-emerald-950/60', iconBg: 'bg-emerald-500/30', visual: 'shapes' },
  { id: 'light-paint', label: 'Light-Paint', labelZh: '光绘', tagline: 'Draw with light', taglineZh: '用光作画', icon: PenLine, gradient: 'from-violet-900/50 via-purple-800/30 to-fuchsia-950/60', iconBg: 'bg-violet-500/30', visual: 'glow' },
]

export default function Games() {
  const [selected, setSelected] = useState<ZenGameId | null>(null)
  const [bannerMission, setBannerMission] = useState<{ label: string } | null>(null)
  const backTo = ((useLocation().state as { from?: string })?.from) ?? '/'
  const locale = useLocale()
  const {
    sparks,
    missions,
    freeMode,
    setFreeMode,
    reportProgress,
    completeMission,
    addGalleryItem,
  } = useMissions(locale)

  useEffect(() => {
    if (bannerMission) {
      const t = setTimeout(() => setBannerMission(null), 2500)
      return () => clearTimeout(t)
    }
  }, [bannerMission])

  const handleMissionComplete = useCallback((missionId: MissionId, label: string) => {
    completeMission(missionId)
    successPulse()
    playSuccessChime()
    fireMissionConfetti()
    setBannerMission({ label })
    if (missionId === 'constellation-5') addGalleryItem({ id: 'star-5', type: 'star', name: 'Five Stars', nameZh: '五星' })
    if (missionId === 'fluid-sand-treasure') addGalleryItem({ id: 'treasure-hope', type: 'treasure', name: 'Hidden Hope', nameZh: '隐藏的希望' })
    if (missionId === 'stack-10') addGalleryItem({ id: 'shape-stack', type: 'shape', name: 'Tower of Ten', nameZh: '十块高塔' })
    if (missionId === 'breathe-perfect-10') addGalleryItem({ id: 'star-perfect', type: 'star', name: 'Perfect Rhythm', nameZh: '完美节奏' })
  }, [completeMission, addGalleryItem])

  const handleExit = useCallback(() => {
    if (selected) setSelected(null)
  }, [selected])

  return (
    <motion.div className="min-h-dvh bg-[#0a0a0c] flex flex-col overflow-hidden">
      <header className="header-safe flex items-center justify-between gap-4 px-4 py-4 shrink-0 relative">
        <Link
          to={backTo}
          className="px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium hover:bg-white/15"
        >
          ← {locale === 'zh' ? '返回' : 'Back'}
        </Link>
        <h1 className="text-lg font-semibold text-white/95">
          {locale === 'zh' ? '禅趣玩具' : 'Zen Toys'}
        </h1>
        <Link to="/gallery" state={{ from: '/games' }} className="flex items-center gap-1 text-amber-400/90 text-sm">
          <Star className="w-4 h-4" strokeWidth={2} />
          <span>{sparks}</span>
        </Link>
      </header>

      <p className="text-sm text-white/60 px-4 pb-2 text-center">
        {locale === 'zh' ? '进入心流，平静身心' : 'Flow state. Calm body and mind.'}
      </p>

      {selected && (
        <NightlyQuestHUD
          missions={missions.map((m) => ({
            id: m.id,
            label: m.label,
            progress: m.progress,
            target: m.target,
            done: m.done,
          }))}
          sparks={sparks}
          freeMode={freeMode}
          onToggleFreeMode={() => setFreeMode(!freeMode)}
          locale={locale}
        />
      )}

      <MissionCompleteBanner
        visible={!!bannerMission}
        label={bannerMission?.label ?? ''}
        locale={locale}
      />

      {selected ? (
        <motion.div
          key="game"
          className="flex-1 min-h-0 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {selected === 'fluid-sand' && (
              <GameFluidSand
                key="fluid-sand"
                locale={locale}
                freeMode={freeMode}
                reportProgress={reportProgress}
                onMissionComplete={handleMissionComplete}
                onExit={handleExit}
              />
            )}
            {selected === 'constellation' && (
              <GameConstellation
                key="constellation"
                locale={locale}
                freeMode={freeMode}
                reportProgress={reportProgress}
                onMissionComplete={handleMissionComplete}
                addGalleryItem={addGalleryItem}
                onExit={handleExit}
              />
            )}
            {selected === 'breathe-sync' && (
              <GameBreatheSync
                key="breathe-sync"
                locale={locale}
                freeMode={freeMode}
                reportProgress={reportProgress}
                onMissionComplete={handleMissionComplete}
                onExit={handleExit}
              />
            )}
            {selected === 'geometric-garden' && (
              <GameGeometricGarden
                key="geometric-garden"
                locale={locale}
                freeMode={freeMode}
                reportProgress={reportProgress}
                onMissionComplete={handleMissionComplete}
                onExit={handleExit}
              />
            )}
            {selected === 'light-paint' && <GameLightPaint key="light-paint" locale={locale} onExit={handleExit} />}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          key="selector"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-safe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="px-4 pb-6 grid grid-cols-2 gap-3">
            {ZEN_GAMES.map((g, i) => {
              const Icon = g.icon
              return (
                <motion.button
                  key={g.id}
                  type="button"
                  onClick={() => setSelected(g.id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  className={`relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all text-left group bg-gradient-to-br ${g.gradient}`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative p-4 flex flex-col h-full min-h-[120px]">
                    {/* Themed icon + mini visual */}
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-12 h-12 rounded-xl ${g.iconBg} flex items-center justify-center backdrop-blur-sm`}>
                        <Icon className="w-6 h-6 text-white/95" strokeWidth={1.5} />
                      </div>
                      {g.visual === 'sand' && (
                        <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/30" />
                      )}
                      {g.visual === 'stars' && (
                        <div className="flex gap-0.5">
                          {[1,2,3].map(j => <div key={j} className="w-1 h-1 rounded-full bg-indigo-300/60" />)}
                        </div>
                      )}
                      {g.visual === 'breath' && (
                        <div className="w-6 h-6 rounded-full border-2 border-teal-400/40" />
                      )}
                      {g.visual === 'shapes' && (
                        <div className="w-5 h-5 rotate-45 bg-emerald-400/30 rounded-sm" />
                      )}
                      {g.visual === 'glow' && (
                        <div className="w-4 h-4 rounded-full bg-violet-400/50 blur-sm" />
                      )}
                    </div>
                    <span className="text-white/95 font-semibold text-sm">
                      {locale === 'zh' ? g.labelZh : g.label}
                    </span>
                    <span className="text-white/60 text-xs mt-0.5">
                      {locale === 'zh' ? g.taglineZh : g.tagline}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
