/**
 * Celestial Architect - state management, Sky Gallery, mission progression
 */
import { useState, useCallback, useEffect } from 'react'
import { getItem, setItem } from '../utils/storage'
import {
  CELESTIAL_SHAPES,
  GALAXIES,
  type CelestialShape,
  type MissionType,
} from '../data/celestialShapes'

const SKY_GALLERY_KEY = 'xinbridge_celestial_sky'
const PROGRESS_KEY = 'xinbridge_celestial_progress'

export interface SkyGalleryItem {
  shapeId: string
  shapeName: string
  shapeNameZh: string
  message: string
  messageZh: string
  galaxyId: number
  missionType?: MissionType
  completedAt: string
}

export interface CelestialProgress {
  shapesCompleted: string[]
  missionsByShape: Record<string, MissionType[]>
  starsCollected: number
}

export function useConstellation(_locale?: 'zh' | 'en') {
  const [skyGallery, setSkyGallery] = useState<SkyGalleryItem[]>([])
  const [progress, setProgress] = useState<CelestialProgress>({
    shapesCompleted: [],
    missionsByShape: {},
    starsCollected: 0,
  })

  useEffect(() => {
    setSkyGallery(getItem<SkyGalleryItem[]>(SKY_GALLERY_KEY, []))
    setProgress(getItem<CelestialProgress>(PROGRESS_KEY, {
      shapesCompleted: [],
      missionsByShape: {},
      starsCollected: 0,
    }))
  }, [])

  const addToSkyGallery = useCallback((
    shape: CelestialShape,
    missionType?: MissionType
  ) => {
    const item: SkyGalleryItem = {
      shapeId: shape.id,
      shapeName: shape.name,
      shapeNameZh: shape.nameZh,
      message: shape.message,
      messageZh: shape.messageZh,
      galaxyId: shape.galaxyId,
      missionType,
      completedAt: new Date().toISOString(),
    }
    setSkyGallery((prev) => {
      const next = [...prev, item]
      setItem(SKY_GALLERY_KEY, next)
      return next
    })
    setProgress((p) => {
      const next = {
        ...p,
        shapesCompleted: p.shapesCompleted.includes(shape.id)
          ? p.shapesCompleted
          : [...p.shapesCompleted, shape.id],
        missionsByShape: {
          ...p.missionsByShape,
          [shape.id]: [
            ...(p.missionsByShape[shape.id] ?? []),
            ...(missionType ? [missionType] : []),
          ],
        },
        starsCollected: p.starsCollected + shape.stars.length,
      }
      setItem(PROGRESS_KEY, next)
      return next
    })
  }, [])

  const shapesForGalaxy = useCallback((galaxyId: number) =>
    CELESTIAL_SHAPES.filter((s) => s.galaxyId === galaxyId),
  [])

  const isShapeCompleted = useCallback((shapeId: string) =>
    progress.shapesCompleted.includes(shapeId),
  [progress.shapesCompleted])

  const isMissionDoneForShape = useCallback((shapeId: string, missionType: MissionType) =>
    (progress.missionsByShape[shapeId] ?? []).includes(missionType),
  [progress.missionsByShape])

  return {
    skyGallery,
    progress,
    galaxies: GALAXIES,
    shapes: CELESTIAL_SHAPES,
    addToSkyGallery,
    shapesForGalaxy,
    isShapeCompleted,
    isMissionDoneForShape,
  }
}
