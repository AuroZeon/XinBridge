/**
 * Stardust Flow - Full-screen physics-based relaxation game.
 * Matter.js circular bodies, bioluminescent colors, tilt gravity, rake to uncover treasure.
 */
import { useRef, useEffect, useCallback, useState } from 'react'
import { impactLight, notificationSuccess } from '../../utils/zenHaptics'
import type { MissionId } from '../../hooks/useMissions'
// @ts-expect-error matter-js has no types
import Matter from 'matter-js'

const PARTICLE_COUNT = 380
const PARTICLE_RADIUS = 6
const RAKE_RADIUS = 110
const RAKE_STRENGTH = 0.04
const UNCOVER_THRESHOLD = 0.55
const TREASURE_SIZE = 42

/* Velocity to color: #00F5FF (cyan) -> #7B68EE (slate blue) */
function velocityToColor(vx: number, vy: number): string {
  const speed = Math.min(1, Math.hypot(vx, vy) / 8)
  const r = Math.round(0 + (123 - 0) * (1 - speed) + 123 * speed)
  const g = Math.round(245 + (104 - 245) * (1 - speed) + 104 * speed)
  const b = Math.round(255 + (238 - 255) * (1 - speed) + 238 * speed)
  return `rgba(${r},${g},${b},0.85)`
}

interface GameFluidSandProps {
  locale: 'zh' | 'en'
  freeMode?: boolean
  reportProgress?: (id: MissionId, value: number) => void
  onMissionComplete?: (id: MissionId, label: string) => void
  onExit?: () => void
}

export default function GameFluidSand({ locale, freeMode, reportProgress, onMissionComplete, onExit }: GameFluidSandProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const pointerRef = useRef<{ x: number; y: number; vx: number; vy: number; active: boolean }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
  })
  const gravityRef = useRef({ x: 0, y: 1 })
  const treasureRef = useRef<{ x: number; y: number } | null>(null)
  const foundRef = useRef(false)
  const lastFlowHapticRef = useRef(0)
  const [gravityLock, setGravityLock] = useState(true)
  const gravityLockRef = useRef(false)
  gravityLockRef.current = gravityLock

  const getPointer = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const touch = 'touches' in e ? (e as React.TouchEvent).touches[0] : null
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const handleReset = useCallback(() => {
    foundRef.current = false
    const engine = engineRef.current
    if (!engine) return
    const w = window.innerWidth
    const h = window.innerHeight

    Matter.Composite.clear(engine.world)
    treasureRef.current = {
      x: w * 0.5 + (Math.random() - 0.5) * w * 0.3,
      y: h * 0.5 + (Math.random() - 0.5) * h * 0.3,
    }
    const t = treasureRef.current

    const bodies: Matter.Body[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = Math.random() * Math.min(w, h) * 0.45
      const a = Math.random() * Math.PI * 2
      const body = Matter.Bodies.circle(
        t.x + Math.cos(a) * r,
        t.y + Math.sin(a) * r,
        PARTICLE_RADIUS,
        { restitution: 0.4, friction: 0.2, frictionAir: 0.008 }
      )
      bodies.push(body)
    }
    Matter.Composite.add(engine.world, bodies)

    const ground = Matter.Bodies.rectangle(w / 2, h + 30, w + 100, 60, { isStatic: true })
    const left = Matter.Bodies.rectangle(-30, h / 2, 60, h + 100, { isStatic: true })
    const right = Matter.Bodies.rectangle(w + 30, h / 2, 60, h + 100, { isStatic: true })
    Matter.Composite.add(engine.world, [ground, left, right])
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      if (!treasureRef.current) {
        treasureRef.current = {
          x: w * 0.5 + (Math.random() - 0.5) * w * 0.25,
          y: h * 0.5 + (Math.random() - 0.5) * h * 0.25,
        }
      }

      if (!engineRef.current) {
        const engine = Matter.Engine.create({
          gravity: { x: 0, y: 1 },
          positionIterations: 8,
          velocityIterations: 10,
        })
        engineRef.current = engine
        Matter.Runner.run(Matter.Runner.create(), engine)
        handleReset()
      } else {
        const engine = engineRef.current
        const all = Matter.Composite.allBodies(engine.world) as Matter.Body[]
        const statics = all.filter((b: Matter.Body) => b.isStatic)
        if (statics.length >= 3) {
          const ground = statics.find((b: Matter.Body) => b.position.y > h)
          const left = statics.find((b: Matter.Body) => b.position.x < 0)
          const right = statics.find((b: Matter.Body) => b.position.x > w)
          if (ground) Matter.Body.setPosition(ground, { x: w / 2, y: h + 30 })
          if (left) Matter.Body.setPosition(left, { x: -30, y: h / 2 })
          if (right) Matter.Body.setPosition(right, { x: w + 30, y: h / 2 })
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    let orientationHandler: ((e: DeviceOrientationEvent) => void) | null = null
    const useOrientation = () => {
      const handler = (e: DeviceOrientationEvent) => {
        if (gravityLockRef.current) return
        const beta = (e.beta ?? 0) * (Math.PI / 180)
        const gamma = (e.gamma ?? 0) * (Math.PI / 180)
        gravityRef.current = {
          x: Math.max(-1, Math.min(1, gamma / 45)),
          y: Math.max(0.3, Math.min(1.2, 0.6 + beta / 90)),
        }
      }
      orientationHandler = handler
      window.addEventListener('deviceorientation', handler, true)
    }

    if (typeof DeviceOrientationEvent !== 'undefined') {
      const req = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission
      if (typeof req === 'function') {
        req().then((p: string) => p === 'granted' && useOrientation()).catch(() => useOrientation())
      } else {
        useOrientation()
      }
    }

    let raf = 0
    const loop = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const engine = engineRef.current
      const ptr = pointerRef.current
      const t = treasureRef.current

      if (!engine || !t) {
        raf = requestAnimationFrame(loop)
        return
      }

      engine.gravity.x = gravityRef.current.x * 0.8
      engine.gravity.y = gravityRef.current.y * 0.8

      const bodies = Matter.Composite.allBodies(engine.world) as Matter.Body[]
      const particles = bodies.filter((b: Matter.Body) => !b.isStatic)

      if (ptr.active) {
        for (const body of particles) {
          const dx = body.position.x - ptr.x
          const dy = body.position.y - ptr.y
          const dist = Math.hypot(dx, dy) || 1
          if (dist < RAKE_RADIUS) {
            const f = (1 - dist / RAKE_RADIUS) * RAKE_STRENGTH
            Matter.Body.applyForce(body, body.position, {
              x: (dx / dist) * f + ptr.vx * 0.003,
              y: (dy / dist) * f + ptr.vy * 0.003,
            })
          }
        }
        if (Date.now() - lastFlowHapticRef.current > 100) {
          lastFlowHapticRef.current = Date.now()
          impactLight()
        }
      }

      if (!foundRef.current && t) {
        const covering = particles.filter(
          (b: Matter.Body) => Math.hypot(b.position.x - t.x, b.position.y - t.y) < TREASURE_SIZE
        ).length
        const totalInRadius = particles.filter(
          (b: Matter.Body) => Math.hypot(b.position.x - t.x, b.position.y - t.y) < TREASURE_SIZE * 1.5
        ).length
        const uncovered = totalInRadius > 0 ? 1 - covering / totalInRadius : 1
        if (uncovered >= UNCOVER_THRESHOLD) {
          foundRef.current = true
          notificationSuccess()
          if (!freeMode && reportProgress) reportProgress('fluid-sand-treasure', 1)
          if (!freeMode && onMissionComplete) {
            onMissionComplete('fluid-sand-treasure', locale === 'zh' ? '揭开隐藏的希望' : 'Uncover the Hidden Hope')
          }
        }
      }

      ctx.save()
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, w, h)

      const nebulaTime = Date.now() / 8000
      const g = ctx.createRadialGradient(
        w * (0.3 + 0.2 * Math.sin(nebulaTime)),
        h * (0.4 + 0.15 * Math.cos(nebulaTime * 0.7)),
        0,
        w * 0.6,
        h * 0.8,
        w
      )
      g.addColorStop(0, 'rgba(75,0,130,0.06)')
      g.addColorStop(0.5, 'rgba(30,0,60,0.03)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.restore()

      ctx.save()
      ctx.filter = 'contrast(1.15) brightness(1.05)'
      for (const body of particles as Matter.Body[]) {
        const vx = body.velocity.x
        const vy = body.velocity.y
        ctx.fillStyle = velocityToColor(vx, vy)
        ctx.beginPath()
        ctx.arc(body.position.x, body.position.y, PARTICLE_RADIUS * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.filter = 'none'
      ctx.restore()

      if (t) {
        ctx.save()
        ctx.globalAlpha = foundRef.current ? 1 : 0.4 + 0.2 * Math.sin(Date.now() / 600)
        ctx.translate(t.x, t.y)
        ctx.strokeStyle = '#D4AF37'
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Date.now() / 2000
          const r = TREASURE_SIZE / 2
          const x = Math.cos(a) * r
          const y = Math.sin(a) * r
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
        ctx.fillStyle = 'rgba(212,175,55,0.2)'
        ctx.fill()
        ctx.font = '32px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'rgba(255,215,0,0.95)'
        ctx.fillText('🌸', 0, 0)
        ctx.restore()
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      if (orientationHandler) window.removeEventListener('deviceorientation', orientationHandler, true)
      cancelAnimationFrame(raf)
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current)
        engineRef.current = null
      }
    }
  }, [handleReset, freeMode, reportProgress, onMissionComplete, locale])

  const handlePointerDown = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const { x, y } = getPointer(e)
      pointerRef.current = { x, y, vx: 0, vy: 0, active: true }
    },
    [getPointer]
  )

  const handlePointerMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!pointerRef.current.active) return
      const { x, y } = getPointer(e)
      const ptr = pointerRef.current
      ptr.vx = x - ptr.x
      ptr.vy = y - ptr.y
      ptr.x = x
      ptr.y = y
    },
    [getPointer]
  )

  const handlePointerUp = useCallback(() => {
    pointerRef.current.active = false
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 flex flex-col bg-black pt-safe"
    >
      <div
        className="flex-1 relative touch-none min-h-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{ touchAction: 'none' }}
        />
      </div>

      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm"
          >
            {locale === 'zh' ? '重置' : 'Reset'}
          </button>
          <button
            type="button"
            onClick={() => setGravityLock((g) => !g)}
            className={`px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-sm ${
              gravityLock ? 'bg-amber-500/30 text-amber-200' : 'bg-white/10 text-white/90'
            }`}
          >
            {gravityLock ? (locale === 'zh' ? '重力:固定' : 'Gravity: Locked') : (locale === 'zh' ? '重力:跟随' : 'Gravity: Tilt')}
          </button>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="px-3 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm pointer-events-auto"
        >
          ← {locale === 'zh' ? '退出' : 'Exit'}
        </button>
      </div>

      <p className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-xs px-4">
        {locale === 'zh' ? '滑动拨开沙粒 · 轻触花朵' : 'Swipe to rake sand · Find the flower'}
      </p>
    </div>
  )
}
