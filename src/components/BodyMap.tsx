/**
 * Cartoon Human Body Map - Warm, friendly, supportive health figure
 * Based on user-provided SVG with distinct body parts.
 * Soft pastels, pulse animation, haptics, glassmorphism menu.
 */
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export type BodyRegionId =
  | 'head' | 'neck' | 'shoulders' | 'chest' | 'abdomen'
  | 'arms-upper-left' | 'arms-upper-right' | 'arms-lower-left' | 'arms-lower-right'
  | 'hands-left' | 'hands-right' | 'hips'
  | 'thighs-left' | 'thighs-right' | 'knees-left' | 'knees-right'
  | 'lower-legs-left' | 'lower-legs-right' | 'feet-left' | 'feet-right'

export type BodyPart = 'head' | 'chest' | 'stomach' | 'limbs'

const REGION_TO_PART: Record<BodyRegionId, BodyPart> = {
  head: 'head',
  neck: 'head',
  shoulders: 'chest',
  chest: 'chest',
  abdomen: 'stomach',
  'arms-upper-left': 'limbs',
  'arms-upper-right': 'limbs',
  'arms-lower-left': 'limbs',
  'arms-lower-right': 'limbs',
  'hands-left': 'limbs',
  'hands-right': 'limbs',
  hips: 'limbs',
  'thighs-left': 'limbs',
  'thighs-right': 'limbs',
  'knees-left': 'limbs',
  'knees-right': 'limbs',
  'lower-legs-left': 'limbs',
  'lower-legs-right': 'limbs',
  'feet-left': 'limbs',
  'feet-right': 'limbs',
}

/** Center [cx, cy] for pulse animation - viewBox 200×450 */
const PULSE_CENTERS: Record<BodyRegionId, [number, number]> = {
  head: [100, 50],
  neck: [100, 90],
  shoulders: [100, 110],
  chest: [100, 150],
  abdomen: [100, 210],
  'arms-upper-left': [40, 155],
  'arms-upper-right': [160, 155],
  'arms-lower-left': [35, 225],
  'arms-lower-right': [165, 225],
  'hands-left': [35, 270],
  'hands-right': [165, 270],
  hips: [100, 255],
  'thighs-left': [80, 305],
  'thighs-right': [120, 305],
  'knees-left': [80, 350],
  'knees-right': [120, 350],
  'lower-legs-left': [80, 390],
  'lower-legs-right': [120, 390],
  'feet-left': [80, 430],
  'feet-right': [120, 430],
}

async function hapticSelection() {
  try {
    const { Haptics } = await import('@capacitor/haptics')
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) await Haptics.selectionChanged()
  } catch { /* ignore */ }
}

const BODY_FILL = '#FFE0BD'
const BODY_STROKE = '#d4a5a5'
const SOFT_LAVENDER = '#e6d9f5'

/** Min touch target 48px — in 200-wide viewBox, 48 units when scaled */
const MIN_HIT = 48

interface BodyMapProps {
  onSelectBodyPart: (partId: BodyRegionId, logicalPart: BodyPart) => void
  activePart: BodyPart | null
  activeRegion: BodyRegionId | null
}

function HitRect({
  regionId,
  x,
  y,
  w,
  h,
  isHighlighted,
  onSelect,
  onHover,
}: {
  regionId: BodyRegionId
  x: number
  y: number
  w: number
  h: number
  isHighlighted: boolean
  onSelect: (e: React.MouseEvent, id: BodyRegionId) => void
  onHover: (id: BodyRegionId | null) => void
}) {
  const sw = Math.max(w, MIN_HIT)
  const sh = Math.max(h, MIN_HIT)
  const sx = x - (sw - w) / 2
  const sy = y - (sh - h) / 2
  return (
    <rect
      x={sx}
      y={sy}
      width={sw}
      height={sh}
      fill={isHighlighted ? 'rgba(252,224,189,0.4)' : 'transparent'}
      className="cursor-pointer transition-colors"
      onClick={(e) => onSelect(e, regionId)}
      onMouseEnter={() => onHover(regionId)}
      onMouseLeave={() => onHover(null)}
      onTouchStart={() => onHover(regionId)}
      onTouchEnd={() => onHover(null)}
    />
  )
}

export function BodyMap({ onSelectBodyPart, activePart, activeRegion }: BodyMapProps) {
  const [hoverRegion, setHoverRegion] = useState<BodyRegionId | null>(null)
  const [pulseOrigin, setPulseOrigin] = useState<{ x: number; y: number } | null>(null)

  const handlePartClick = useCallback(
    (e: React.MouseEvent, regionId: BodyRegionId) => {
      e.preventDefault()
      e.stopPropagation()
      hapticSelection()
      const [cx, cy] = PULSE_CENTERS[regionId]
      setPulseOrigin({ x: cx, y: cy })
      setTimeout(() => setPulseOrigin(null), 500)
      onSelectBodyPart(regionId, REGION_TO_PART[regionId])
    },
    [onSelectBodyPart]
  )

  const isHighlighted = (regionId: BodyRegionId) =>
    activeRegion === regionId ||
    (activePart !== null && REGION_TO_PART[regionId] === activePart) ||
    hoverRegion === regionId

  return (
    <div className="relative w-48 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <svg
        viewBox="0 0 200 450"
        className="relative z-10 w-full max-w-[200px]"
        style={{ aspectRatio: '200/450' }}
      >
        <defs>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#d4a5a5" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Soft pulse ring */}
        {pulseOrigin && (
          <motion.circle
            cx={pulseOrigin.x}
            cy={pulseOrigin.y}
            r={0}
            fill="none"
            stroke={SOFT_LAVENDER}
            strokeWidth="3"
            strokeOpacity="0.6"
            initial={{ r: 0, opacity: 1 }}
            animate={{ r: 45, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}

        {/* Visual body parts — warm pastel fill, soft stroke */}
        <g id="head" filter="url(#soft-shadow)">
          <circle cx="100" cy="50" r="30" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="neck">
          <rect x="90" y="80" width="20" height="20" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="shoulders">
          <rect x="50" y="100" width="100" height="20" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="chest">
          <rect x="60" y="120" width="80" height="60" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="abdomen">
          <rect x="65" y="180" width="70" height="60" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="arms-upper-left">
          <rect x="30" y="120" width="20" height="70" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="arms-upper-right">
          <rect x="150" y="120" width="20" height="70" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="arms-lower-left">
          <rect x="25" y="190" width="20" height="70" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="arms-lower-right">
          <rect x="155" y="190" width="20" height="70" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="hands-left">
          <circle cx="35" cy="270" r="15" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="hands-right">
          <circle cx="165" cy="270" r="15" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="hips">
          <rect x="60" y="240" width="80" height="30" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="thighs-left">
          <rect x="65" y="270" width="30" height="70" rx="15" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="thighs-right">
          <rect x="105" y="270" width="30" height="70" rx="15" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="knees-left">
          <circle cx="80" cy="350" r="12" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="knees-right">
          <circle cx="120" cy="350" r="12" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="lower-legs-left">
          <rect x="70" y="360" width="20" height="60" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="lower-legs-right">
          <rect x="110" y="360" width="20" height="60" rx="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="feet-left">
          <ellipse cx="80" cy="430" rx="20" ry="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>
        <g id="feet-right">
          <ellipse cx="120" cy="430" rx="20" ry="10" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="2" />
        </g>

        {/* Hit areas — min 48×48 for touch targets */}
        <HitRect regionId="head" x={70} y={20} w={60} h={60} isHighlighted={isHighlighted('head')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="neck" x={90} y={80} w={20} h={20} isHighlighted={isHighlighted('neck')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="shoulders" x={50} y={100} w={100} h={20} isHighlighted={isHighlighted('shoulders')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="chest" x={60} y={120} w={80} h={60} isHighlighted={isHighlighted('chest')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="abdomen" x={65} y={180} w={70} h={60} isHighlighted={isHighlighted('abdomen')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="arms-upper-left" x={30} y={120} w={20} h={70} isHighlighted={isHighlighted('arms-upper-left')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="arms-upper-right" x={150} y={120} w={20} h={70} isHighlighted={isHighlighted('arms-upper-right')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="arms-lower-left" x={25} y={190} w={20} h={70} isHighlighted={isHighlighted('arms-lower-left')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="arms-lower-right" x={155} y={190} w={20} h={70} isHighlighted={isHighlighted('arms-lower-right')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="hands-left" x={20} y={255} w={30} h={30} isHighlighted={isHighlighted('hands-left')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="hands-right" x={150} y={255} w={30} h={30} isHighlighted={isHighlighted('hands-right')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="hips" x={60} y={240} w={80} h={30} isHighlighted={isHighlighted('hips')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="thighs-left" x={65} y={270} w={30} h={70} isHighlighted={isHighlighted('thighs-left')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="thighs-right" x={105} y={270} w={30} h={70} isHighlighted={isHighlighted('thighs-right')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="knees-left" x={68} y={338} w={24} h={24} isHighlighted={isHighlighted('knees-left')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="knees-right" x={108} y={338} w={24} h={24} isHighlighted={isHighlighted('knees-right')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="lower-legs-left" x={70} y={360} w={20} h={60} isHighlighted={isHighlighted('lower-legs-left')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="lower-legs-right" x={110} y={360} w={20} h={60} isHighlighted={isHighlighted('lower-legs-right')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="feet-left" x={60} y={420} w={40} h={20} isHighlighted={isHighlighted('feet-left')} onSelect={handlePartClick} onHover={setHoverRegion} />
        <HitRect regionId="feet-right" x={100} y={420} w={40} h={20} isHighlighted={isHighlighted('feet-right')} onSelect={handlePartClick} onHover={setHoverRegion} />
      </svg>
    </div>
  )
}
