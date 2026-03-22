/**
 * Nightly Quest - mission tracking and global Spark counter
 */
import { useState, useCallback, useEffect } from 'react'
import { getItem, setItem } from '../utils/storage'

export type MissionId =
  | 'constellation-5'
  | 'stack-10'
  | 'breathe-clear-50'
  | 'constellation-shape'
  | 'fluid-sand-treasure'
  | 'geometric-moonlight'
  | 'breathe-perfect-10'

export interface Mission {
  id: MissionId
  label: string
  labelZh: string
  target: number
  progress: number
  game: 'constellation' | 'fluid-sand' | 'geometric-garden' | 'breathe-sync'
}

const MISSION_DEFS: Omit<Mission, 'progress'>[] = [
  { id: 'constellation-5', label: 'Connect 5 Constellations', labelZh: '连线 5 个星座', target: 5, game: 'constellation' },
  { id: 'stack-10', label: 'Stack 10 Geometric Blocks', labelZh: '堆叠 10 个几何块', target: 10, game: 'geometric-garden' },
  { id: 'breathe-clear-50', label: 'Clear 50% in Breathe-Sync', labelZh: '呼吸同步清除 50%', target: 50, game: 'breathe-sync' },
  { id: 'constellation-shape', label: 'Complete a Ghost Shape', labelZh: '完成一个幽灵形状', target: 1, game: 'constellation' },
  { id: 'fluid-sand-treasure', label: 'Uncover the Hidden Hope', labelZh: '揭开隐藏的希望', target: 1, game: 'fluid-sand' },
  { id: 'geometric-moonlight', label: 'Reach the Moonlight Line', labelZh: '抵达月光线', target: 1, game: 'geometric-garden' },
  { id: 'breathe-perfect-10', label: '10 Perfect Rhythm Taps', labelZh: '10 次完美节奏点击', target: 10, game: 'breathe-sync' },
]

const SPARKS_KEY = 'zen_sparks'
const PROGRESS_KEY = 'zen_mission_progress'
const GALLERY_KEY = 'zen_gallery'

export interface GalleryItem {
  id: string
  type: 'star' | 'treasure' | 'shape'
  name: string
  nameZh: string
  unlockedAt: string
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function useMissions(locale: 'zh' | 'en') {
  const [sparks, setSparks] = useState(0)
  const [progress, setProgress] = useState<Record<MissionId, number>>({} as Record<MissionId, number>)
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [nightlyMissions, setNightlyMissions] = useState<Mission[]>([])
  const [freeMode, setFreeMode] = useState(false)

  useEffect(() => {
    setSparks(getItem<number>(SPARKS_KEY, 0))
    setProgress(getItem<Record<MissionId, number>>(PROGRESS_KEY, {} as Record<MissionId, number>))
    setGallery(getItem<GalleryItem[]>(GALLERY_KEY, []))
  }, [])

  useEffect(() => {
    const defs = MISSION_DEFS.map((d) => ({
      ...d,
      progress: progress[d.id] ?? 0,
    }))
    setNightlyMissions(pickRandom(defs, 3))
  }, [progress])

  const reportProgress = useCallback((missionId: MissionId, value: number) => {
    setProgress((p) => {
      const next = { ...p, [missionId]: value }
      setItem(PROGRESS_KEY, next)
      return next
    })
  }, [])

  const completeMission = useCallback((_missionId: MissionId) => {
    setSparks((s) => {
      const n = s + 1
      setItem(SPARKS_KEY, n)
      return n
    })
  }, [])

  const addGalleryItem = useCallback((item: Omit<GalleryItem, 'unlockedAt'>) => {
    const full: GalleryItem = { ...item, unlockedAt: new Date().toISOString() }
    setGallery((g) => {
      const next = [...g.filter((x) => x.id !== full.id), full]
      setItem(GALLERY_KEY, next)
      return next
    })
  }, [])

  const missions = nightlyMissions.map((m) => ({
    ...m,
    label: locale === 'zh' ? m.labelZh : m.label,
    done: m.progress >= m.target,
  }))

  return {
    sparks,
    missions,
    freeMode,
    setFreeMode,
    reportProgress,
    completeMission,
    addGalleryItem,
    gallery,
  }
}
