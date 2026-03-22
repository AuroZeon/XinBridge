/**
 * Constellation Connect - Tap two nearby stars to connect them.
 * Mission progression: 3 → 5 → 8 connections → all 12 dots connected.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { selectionPulse, notificationSuccess } from '../../utils/zenHaptics'
import { playConstellationNote } from '../../utils/zenTone'
import { fireMissionConfetti } from '../../utils/celebration'
import { getItem, setItem } from '../../utils/storage'
import type { MissionId } from '../../hooks/useMissions'

const DOT_COUNT = 12
const LEVEL_KEY = 'zen_constellation_level'

const MISSIONS = [
  { lines: 3, label: 'Connect 3', labelZh: '连接 3 条' },
  { lines: 5, label: 'Connect 5', labelZh: '连接 5 条' },
  { lines: 8, label: 'Connect 8', labelZh: '连接 8 条' },
  { lines: -1, label: 'Connect all 12 stars', labelZh: '连接全部 12 颗星' },
] as const

function connectDist(w: number) {
  return Math.min(120, (w / 300) * 80)
}

interface Dot {
  id: number
  x: number
  y: number
  vx: number
  vy: number
}

function initDots(w: number, h: number): Dot[] {
  return Array.from({ length: DOT_COUNT }, (_, i) => ({
    id: i,
    x: 40 + (w - 80) * Math.random(),
    y: 60 + (h - 120) * Math.random(),
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
  }))
}

interface GameConstellationProps {
  locale: 'zh' | 'en'
  freeMode?: boolean
  reportProgress?: (id: MissionId, value: number) => void
  onMissionComplete?: (id: MissionId, label: string) => void
  addGalleryItem?: (item: { id: string; type: 'star' | 'treasure' | 'shape'; name: string; nameZh: string }) => void
  onExit?: () => void
}

function allDotsConnected(lines: { a: number; b: number }[]): boolean {
  const connected = new Set<number>()
  lines.forEach((l) => { connected.add(l.a); connected.add(l.b) })
  return connected.size === DOT_COUNT
}

export default function GameConstellation({ locale, freeMode, reportProgress, onMissionComplete, addGalleryItem, onExit }: GameConstellationProps) {
  const [dots, setDots] = useState<Dot[]>([])
  const [lines, setLines] = useState<{ a: number; b: number }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [level, setLevel] = useState(() => Math.min(4, Math.max(1, getItem<number>(LEVEL_KEY, 1))))
  const [banner, setBanner] = useState<string | null>(null)
  const [bounds, setBounds] = useState({ w: 400, h: 600 })
  const boundsRef = useRef(bounds)
  boundsRef.current = bounds

  const mission = MISSIONS[level - 1]
  const progress = mission.lines === -1
    ? (lines.length > 0 ? new Set(lines.flatMap((l) => [l.a, l.b])).size : 0)
    : lines.length
  const target = mission.lines === -1 ? DOT_COUNT : mission.lines

  const init = useCallback(() => {
    const { w, h } = boundsRef.current
    setDots(initDots(w, h))
    setLines([])
    setSelected(null)
  }, [])

  useEffect(() => {
    const update = () => setBounds({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    setDots(initDots(bounds.w, bounds.h))
  }, [bounds.w, bounds.h])

  useEffect(() => {
    if (banner) {
      const t = setTimeout(() => setBanner(null), 2200)
      return () => clearTimeout(t)
    }
  }, [banner])

  useEffect(() => {
    if (dots.length === 0) return
    const id = setInterval(() => {
      setDots((d) =>
        d.map((dot) => {
          let { x, y, vx, vy } = dot
          x += vx
          y += vy
          if (x < 10 || x > boundsRef.current.w - 10) vx *= -1
          if (y < 30 || y > boundsRef.current.h - 10) vy *= -1
          return { ...dot, x, y, vx, vy }
        })
      )
    }, 50)
    return () => clearInterval(id)
  }, [dots.length])

  const dist = (a: Dot, b: Dot) => Math.hypot(a.x - b.x, a.y - b.y)

  const celebrateAndLevelUp = useCallback(() => {
    notificationSuccess()
    fireMissionConfetti()
    playConstellationNote(5)
    const msg = level < 4
      ? (locale === 'zh' ? `阶段 ${level} 完成！` : `Stage ${level} complete!`)
      : (locale === 'zh' ? '全部完成！夜空已点亮 ✨' : 'All complete! Night sky lit ✨')
    setBanner(msg)
    if (level >= 2) addGalleryItem?.({ id: 'star-5', type: 'star', name: 'Five Stars', nameZh: '五星' })
    if (!freeMode && reportProgress) reportProgress('constellation-5', level >= 4 ? 5 : level)
    if (!freeMode && onMissionComplete) onMissionComplete('constellation-5', msg)
    if (level < 4) {
      const next = level + 1
      setLevel(next)
      setItem(LEVEL_KEY, next)
      setTimeout(() => init(), 800)
    } else {
      setItem(LEVEL_KEY, 1)
      setTimeout(() => { setLevel(1); init() }, 1200)
    }
  }, [level, locale, freeMode, reportProgress, onMissionComplete, addGalleryItem, init])

  const handleDot = useCallback(
    (id: number) => {
      selectionPulse()
      if (selected === null) {
        setSelected(id)
        return
      }
      if (selected === id) {
        setSelected(null)
        return
      }
      const a = dots.find((d) => d.id === selected)!
      const b = dots.find((d) => d.id === id)!
      if (dist(a, b) < connectDist(boundsRef.current.w) && !lines.some((l) => (l.a === selected && l.b === id) || (l.a === id && l.b === selected))) {
        const newLines = [...lines, { a: selected, b: id }]
        setLines(newLines)
        playConstellationNote(newLines.length)
        const nowComplete = mission.lines === -1 ? allDotsConnected(newLines) : newLines.length >= mission.lines
        if (nowComplete) celebrateAndLevelUp()
      }
      setSelected(null)
    },
    [selected, dots, lines, mission, celebrateAndLevelUp]
  )

  const { w, h } = bounds
  const dotRadius = Math.max(8, Math.min(14, w / 30))

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0c] pt-safe">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex gap-2 items-center pointer-events-auto">
          <button onClick={init} className="px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm">
            {locale === 'zh' ? '重置' : 'Reset'}
          </button>
          <span className="text-xs text-lavender-300/80">
            {locale === 'zh' ? `阶段 ${level}` : `Stage ${level}`}: {progress} / {target}
          </span>
        </div>
        <button type="button" onClick={onExit} className="px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm pointer-events-auto">
          ← {locale === 'zh' ? '返回' : 'Back'}
        </button>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full touch-none">
        {lines.map((l, i) => {
          const da = dots.find((d) => d.id === l.a)
          const db = dots.find((d) => d.id === l.b)
          if (!da || !db) return null
          return (
            <line
              key={i}
              x1={da.x}
              y1={da.y}
              x2={db.x}
              y2={db.y}
              stroke="rgba(196,181,253,0.6)"
              strokeWidth={Math.max(2, w / 150)}
              strokeLinecap="round"
            />
          )
        })}
        {dots.map((d) => (
          <g key={d.id} style={{ cursor: 'pointer' }} onClick={() => handleDot(d.id)}>
            <circle
              cx={d.x}
              cy={d.y}
              r={dotRadius}
              fill={selected === d.id ? 'rgba(196,181,253,0.9)' : 'rgba(196,181,253,0.5)'}
              filter="url(#glow)"
            />
          </g>
        ))}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <AnimatePresence>
        {banner && (
          <motion.div
            className="absolute inset-x-4 top-24 z-20 py-3 px-4 rounded-xl bg-indigo-500/40 border border-indigo-400/50 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white font-medium">{banner}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-xs px-4">
        {locale === 'zh' ? `轻触两点连线 · ${mission.lines === -1 ? '连接全部12颗星' : `目标 ${target} 条`}` : `Tap two dots to connect · ${mission.lines === -1 ? 'Connect all 12 stars' : `Goal: ${target} links`}`}
      </p>
    </div>
  )
}
