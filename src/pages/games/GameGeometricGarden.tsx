/**
 * Geometric Garden - Tap to drop soft-edged shapes. Matter.js physics.
 * Mission: Stack 10 blocks
 */
import { useRef, useEffect, useCallback, useState } from 'react'
// @ts-expect-error matter-js has no types
import Matter from 'matter-js'
import { selectionPulse, impactLight } from '../../utils/zenHaptics'
import { playZenBell } from '../../utils/zenTone'
import type { MissionId } from '../../hooks/useMissions'

const COLORS = ['rgba(196,181,253,0.85)', 'rgba(251,191,36,0.8)', 'rgba(167,243,208,0.8)', 'rgba(254,202,202,0.8)']
const SHAPES = ['circle', 'square', 'squircle'] as const

interface GameGeometricGardenProps {
  locale: 'zh' | 'en'
  freeMode?: boolean
  reportProgress?: (id: MissionId, value: number) => void
  onMissionComplete?: (id: MissionId, label: string) => void
  onExit?: () => void
}

export default function GameGeometricGarden({ locale, freeMode, reportProgress, onMissionComplete, onExit }: GameGeometricGardenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const lastCollisionRef = useRef<number>(0)
  const [blockCount, setBlockCount] = useState(0)

  const addShape = useCallback((x: number, y: number) => {
    const engine = engineRef.current
    if (!engine || !canvasRef.current) return
    selectionPulse()

    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const size = 24 + Math.random() * 16

    let body: Matter.Body
    if (shape === 'circle') {
      body = Matter.Bodies.circle(x, y, size / 2, {
        restitution: 0.3,
        friction: 0.4,
        density: 0.002,
        render: { fillStyle: color },
      })
    } else if (shape === 'squircle') {
      const radius = size / 2
      const verts: Matter.Vector[] = []
      const n = 8
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        const r = radius * (0.85 + 0.15 * Math.cos(a * 4))
        verts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r })
      }
      body = Matter.Bodies.fromVertices(x, y, verts, {
        restitution: 0.3,
        friction: 0.4,
        density: 0.002,
        render: { fillStyle: color },
      })
    } else {
      body = Matter.Bodies.rectangle(x, y, size, size, {
        restitution: 0.3,
        friction: 0.4,
        density: 0.002,
        chamfer: { radius: size * 0.15 },
        render: { fillStyle: color },
      })
    }

    ;(body as Matter.Body & { _color?: string })._color = color
    ;(body as Matter.Body & { _shape?: string })._shape = shape
    ;(body as Matter.Body & { _size?: number })._size = size
    Matter.Composite.add(engine.world, body)
    playZenBell(392, 0.1)
    const next = blockCount + 1
    setBlockCount(next)
    if (!freeMode && reportProgress) reportProgress('stack-10', next)
    if (!freeMode && onMissionComplete && next === 10) {
      onMissionComplete('stack-10', locale === 'zh' ? '堆叠 10 个几何块' : 'Stack 10 Geometric Blocks')
    }
  }, [blockCount, freeMode, reportProgress, onMissionComplete, locale])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const Engine = Matter.Engine
    const Runner = Matter.Runner
    const Composite = Matter.Composite
    const Bodies = Matter.Bodies
    const Events = Matter.Events

    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    const engine = Engine.create({ gravity: { x: 0, y: 0.8 } })
    engineRef.current = engine

    const ground = Bodies.rectangle(w / 2, h + 20, w + 100, 60, { isStatic: true })
    const left = Bodies.rectangle(-30, h / 2, 60, h + 100, { isStatic: true })
    const right = Bodies.rectangle(w + 30, h / 2, 60, h + 100, { isStatic: true })
    Composite.add(engine.world, [ground, left, right])

    Events.on(engine, 'collisionStart', () => {
      const now = Date.now()
      if (now - lastCollisionRef.current > 150) {
        lastCollisionRef.current = now
        impactLight()
      }
    })

    const runner = Runner.create()
    Runner.run(runner, engine)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const renderLoop = () => {
      ctx.fillStyle = '#0a0a0c'
      ctx.fillRect(0, 0, w, h)

      const bodies = Composite.allBodies(engine.world)
      for (const body of bodies) {
        if (body.isStatic) continue
        const color = (body as Matter.Body & { _color?: string })._color ?? 'rgba(196,181,253,0.8)'
        const shape = (body as Matter.Body & { _shape?: string })._shape ?? 'circle'
        const size = (body as Matter.Body & { _size?: number })._size ?? 24

        ctx.save()
        ctx.translate(body.position.x, body.position.y)
        ctx.rotate(body.angle)
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 12

        if (shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (shape === 'squircle') {
          const r = size / 2
          ctx.beginPath()
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2
            const rad = r * (0.85 + 0.15 * Math.cos(a * 4))
            const x = Math.cos(a) * rad
            const y = Math.sin(a) * rad
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.fillRect(-size / 2, -size / 2, size, size)
        }

        ctx.shadowBlur = 0
        ctx.restore()
      }

      requestAnimationFrame(renderLoop)
    }
    renderLoop()

    const handleResize = () => {
      const r = canvas.getBoundingClientRect()
      Matter.Body.setPosition(ground, { x: r.width / 2, y: r.height + 20 })
      Matter.Body.setPosition(left, { x: -30, y: r.height / 2 })
      Matter.Body.setPosition(right, { x: r.width + 30, y: r.height / 2 })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      Runner.stop(runner)
      Engine.clear(engine)
      window.removeEventListener('resize', handleResize)
      engineRef.current = null
    }
  }, [])

  const handleTap = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (y < rect.height - 20) addShape(x, Math.max(40, y))
    },
    [addShape]
  )

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0c] pt-safe">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <p className="text-sm text-white/60">
          {locale === 'zh' ? '轻触屏幕投放形状' : 'Tap to drop shapes'}
        </p>
        <button
          type="button"
          onClick={onExit}
          className="px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm pointer-events-auto"
        >
          ← {locale === 'zh' ? '退出' : 'Exit'}
        </button>
      </div>
      <div
        className="absolute inset-0 w-full h-full touch-none cursor-pointer"
        style={{ paddingTop: 'calc(var(--safe-top) + 2.5rem)' }}
        onPointerDown={handleTap}
      >
        <canvas ref={canvasRef} className="w-full h-full block" style={{ touchAction: 'none' }} />
      </div>
    </div>
  )
}
