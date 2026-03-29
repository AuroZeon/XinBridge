/**
 * Light-Paint - Glowing brush on dark canvas. Trail fades over ~10s.
 */
import { useRef, useEffect, useCallback } from 'react'
import { selectionPulse } from '../../utils/zenHaptics'

const FADE_MS = 10000
const BRUSH_SIZE = 8
const COLORS = ['rgba(196,181,253,0.9)', 'rgba(251,191,36,0.85)', 'rgba(167,243,208,0.85)']

interface Stroke {
  path: { x: number; y: number }[]
  color: string
  createdAt: number
}

interface GameLightPaintProps {
  locale: 'zh' | 'en'
  onExit?: () => void
}

export default function GameLightPaint({ locale, onExit }: GameLightPaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const isDrawingRef = useRef(false)
  const colorIndexRef = useRef(0)

  const getPointer = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const touch = 'touches' in e ? (e as React.TouchEvent).touches[0] : null
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      selectionPulse()
      const p = getPointer(e)
      if (!p) return
      isDrawingRef.current = true
      colorIndexRef.current = (colorIndexRef.current + 1) % COLORS.length
      strokesRef.current.push({
        path: [p],
        color: COLORS[colorIndexRef.current],
        createdAt: Date.now(),
      })
    },
    [getPointer]
  )

  const handlePointerMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      if (!isDrawingRef.current) return
      const p = getPointer(e)
      if (!p) return
      const strokes = strokesRef.current
      if (strokes.length) strokes[strokes.length - 1].path.push(p)
    },
    [getPointer]
  )

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    const loop = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const now = Date.now()

      ctx.fillStyle = '#0a0a0c'
      ctx.fillRect(0, 0, w, h)

      const strokes = strokesRef.current
      strokesRef.current = strokes.filter((s) => now - s.createdAt < FADE_MS)

      for (const stroke of strokesRef.current) {
        const age = now - stroke.createdAt
        const alpha = Math.max(0, 1 - age / FADE_MS)
        const path = stroke.path
        if (path.length < 2) continue

        ctx.beginPath()
        ctx.moveTo(path[0].x, path[0].y)
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y)
        }
        ctx.strokeStyle = stroke.color.replace(/[\d.]+\)$/, `${alpha})`)
        ctx.lineWidth = BRUSH_SIZE
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.shadowColor = stroke.color
        ctx.shadowBlur = 20
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0c] pt-safe">
      <div className="absolute top-safe left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <p className="text-sm text-white/60">
          {locale === 'zh' ? '在黑暗中画出光芒 · 约10秒渐隐' : 'Draw with light · fades ~10s'}
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
        className="absolute inset-0 w-full h-full touch-none"
        style={{ paddingTop: 'calc(var(--safe-top) + 2.5rem)' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" style={{ touchAction: 'none' }} />
      </div>
    </div>
  )
}
