/**
 * Body scan - SVG silhouette with glow at focus point
 * Steps: head(1), shoulders(4), chest(5), belly(6), knees/toes(7)
 */
type FocusArea = 'head' | 'shoulders' | 'chest' | 'belly' | 'legs' | null

const STEP_TO_AREA: FocusArea[] = [
  null,
  'head',
  'head',
  'shoulders',
  'shoulders',
  'chest',
  'belly',
  'legs',
  'legs',
  'legs',
]

export function getFocusArea(step: number, totalSteps: number): FocusArea {
  const idx = Math.min(step, totalSteps - 1)
  return STEP_TO_AREA[idx] ?? null
}

interface BodyScanSilhouetteProps {
  step: number
  totalSteps: number
  className?: string
}

export function BodyScanSilhouette({ step, totalSteps, className }: BodyScanSilhouetteProps) {
  const focus = getFocusArea(step, totalSteps)

  return (
    <svg
      viewBox="0 0 100 200"
      className={className}
      aria-hidden
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-strong">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Simplified body silhouette */}
      <ellipse
        cx="50"
        cy="25"
        rx="18"
        ry="22"
        fill="currentColor"
        opacity={focus === 'head' ? 0.9 : 0.25}
        filter={focus === 'head' ? 'url(#glow-strong)' : undefined}
      />
      <path
        d="M 35 45 Q 50 55 65 45 L 62 95 Q 50 90 38 95 Z"
        fill="currentColor"
        opacity={focus === 'shoulders' || focus === 'chest' ? 0.9 : 0.25}
        filter={focus === 'shoulders' || focus === 'chest' ? 'url(#glow-strong)' : undefined}
      />
      <path
        d="M 40 95 L 60 95 L 58 140 L 42 140 Z"
        fill="currentColor"
        opacity={focus === 'belly' ? 0.9 : 0.25}
        filter={focus === 'belly' ? 'url(#glow-strong)' : undefined}
      />
      <path
        d="M 42 140 L 38 200 M 58 140 L 62 200"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity={focus === 'legs' ? 0.9 : 0.25}
        filter={focus === 'legs' ? 'url(#glow-strong)' : undefined}
      />
    </svg>
  )
}
