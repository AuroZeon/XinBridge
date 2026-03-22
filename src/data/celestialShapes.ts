/**
 * Celestial Architect - Galaxy definitions, shapes, star types, messages of strength
 */

export type StarType = 'distant' | 'nova' | 'binary'

export interface CelestialStar {
  id: number
  type: StarType
  pairId?: number // for binary: index of paired star
  x: number // 0-100 normalized
  y: number
  order?: number // for Perfectionist: connect in this order (1-based)
}

export interface CelestialShape {
  id: string
  galaxyId: number
  name: string
  nameZh: string
  stars: CelestialStar[]
  edges: [number, number][] // pairs of star indices to connect
  message: string
  messageZh: string
}

function s(x: number, y: number, type: StarType = 'distant', pairId?: number, order?: number): CelestialStar {
  return { id: 0, type, pairId, x, y, order }
}

export const GALAXIES = [
  { id: 1, name: 'The Inner Child', nameZh: '内在孩童', desc: 'Simple shapes', descZh: '简单形状' },
  { id: 2, name: 'The Guardian', nameZh: '守护者', desc: 'Animal forms', descZh: '动物形态' },
  { id: 3, name: 'The Infinite', nameZh: '无限', desc: 'Fractal patterns', descZh: '分形图案' },
] as const

export const CELESTIAL_SHAPES: CelestialShape[] = [
  // Galaxy 1 - Simple
  {
    id: 'triangle',
    galaxyId: 1,
    name: 'Triangle',
    nameZh: '三角',
    stars: [
      { ...s(50, 25, 'distant'), id: 0, order: 1 },
      { ...s(25, 75, 'distant'), id: 1, order: 2 },
      { ...s(75, 75, 'nova'), id: 2, order: 3 },
    ],
    edges: [[0, 1], [1, 2], [2, 0]],
    message: 'The triangle reminds us that strength comes in threes: body, mind, and spirit.',
    messageZh: '三角提醒我们，力量源于三者：身体、心灵与灵魂。',
  },
  {
    id: 'square',
    galaxyId: 1,
    name: 'Square',
    nameZh: '方形',
    stars: [
      { ...s(35, 30, 'distant'), id: 0, order: 1 },
      { ...s(65, 30, 'distant'), id: 1, order: 2 },
      { ...s(65, 70, 'binary', 3), id: 2, order: 3 },
      { ...s(35, 70, 'binary', 2), id: 3, order: 4 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0]],
    message: 'The square grounds us—four corners of stability in an uncertain world.',
    messageZh: '方形象征稳固，在不确定的世界中给予我们四角支撑。',
  },
  {
    id: 'heart',
    galaxyId: 1,
    name: 'Heart',
    nameZh: '心形',
    stars: [
      { ...s(50, 25, 'distant'), id: 0, order: 1 },
      { ...s(25, 45, 'distant'), id: 1, order: 2 },
      { ...s(50, 70, 'nova'), id: 2, order: 3 },
      { ...s(75, 45, 'distant'), id: 3, order: 4 },
      { ...s(25, 60, 'distant'), id: 4, order: 5 },
      { ...s(75, 60, 'distant'), id: 5, order: 6 },
    ],
    edges: [[0, 1], [1, 4], [4, 2], [2, 5], [5, 3], [3, 0]],
    message: 'The heart constellation glows with the light we choose to give.',
    messageZh: '心形星座闪耀着我们选择付出的光芒。',
  },
  // Galaxy 2 - Animals
  {
    id: 'swan',
    galaxyId: 2,
    name: 'Swan',
    nameZh: '天鹅',
    stars: [
      { ...s(30, 50, 'distant'), id: 0, order: 1 },
      { ...s(45, 35, 'distant'), id: 1, order: 2 },
      { ...s(55, 30, 'nova'), id: 2, order: 3 },
      { ...s(70, 35, 'distant'), id: 3, order: 4 },
      { ...s(80, 50, 'distant'), id: 4, order: 5 },
      { ...s(75, 65, 'distant'), id: 5, order: 6 },
      { ...s(50, 70, 'distant'), id: 6, order: 7 },
      { ...s(25, 65, 'distant'), id: 7, order: 8 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]],
    message: 'The swan reminds us of our inner grace, even in stillness.',
    messageZh: '天鹅提醒我们，即使在静默中，内心依然优雅。',
  },
  {
    id: 'bear',
    galaxyId: 2,
    name: 'Bear',
    nameZh: '熊',
    stars: [
      { ...s(50, 20, 'distant'), id: 0, order: 1 },
      { ...s(35, 45, 'distant'), id: 1, order: 2 },
      { ...s(65, 45, 'binary', 3), id: 2, order: 3 },
      { ...s(65, 70, 'binary', 2), id: 3, order: 4 },
      { ...s(35, 70, 'distant'), id: 4, order: 5 },
      { ...s(50, 55, 'nova'), id: 5, order: 6 },
    ],
    edges: [[0, 1], [0, 2], [1, 4], [4, 5], [5, 3], [3, 2], [2, 1]],
    message: 'The bear teaches us that protection and gentleness can coexist.',
    messageZh: '熊教会我们，保护与温柔可以并存。',
  },
  {
    id: 'lion',
    galaxyId: 2,
    name: 'Lion',
    nameZh: '狮子',
    stars: [
      { ...s(50, 25, 'nova'), id: 0, order: 1 },
      { ...s(30, 40, 'distant'), id: 1, order: 2 },
      { ...s(70, 40, 'distant'), id: 2, order: 3 },
      { ...s(20, 65, 'distant'), id: 3, order: 4 },
      { ...s(50, 75, 'distant'), id: 4, order: 5 },
      { ...s(80, 65, 'distant'), id: 5, order: 6 },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [3, 4], [4, 5], [5, 2]],
    message: 'The lion constellation speaks of courage that comes from the heart.',
    messageZh: '狮子星座诉说着源自心底的勇气。',
  },
  // Galaxy 3 - Fractal
  {
    id: 'spiral',
    galaxyId: 3,
    name: 'Spiral Galaxy',
    nameZh: '漩涡星系',
    stars: (() => {
      const stars: CelestialStar[] = []
      const n = 12
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        const r = 25 + (i / n) * 30
        stars.push({
          id: i,
          type: (i % 4 === 0 ? 'nova' : 'distant') as StarType,
          x: 50 + Math.cos(a) * r,
          y: 50 + Math.sin(a) * r,
          order: i + 1,
        })
      }
      return stars
    })(),
    edges: Array.from({ length: 12 }, (_, i) => [i, (i + 1) % 12] as [number, number]),
    message: 'In the spiral we see that every end is a new beginning.',
    messageZh: '在漩涡中我们看到，每个尽头都是新的开端。',
  },
]

export type MissionType = 'swift' | 'perfectionist' | 'lightbringer'

export const MISSION_DEFS: { id: MissionType; name: string; nameZh: string; desc: string; descZh: string }[] = [
  { id: 'swift', name: 'The Swift Path', nameZh: '迅捷之路', desc: 'Complete in under 20 seconds', descZh: '20秒内完成' },
  { id: 'perfectionist', name: 'The Perfectionist', nameZh: '完美主义', desc: 'Connect in numbered order', descZh: '按数字顺序连线' },
  { id: 'lightbringer', name: 'The Light-Bringer', nameZh: '光之使者', desc: 'Activate all Nova stars first', descZh: '先激活所有新星' },
]
