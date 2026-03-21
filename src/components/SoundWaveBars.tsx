/**
 * Subtle CSS-animated sound wave (3-4 bars) for active track indicator
 */
interface SoundWaveBarsProps {
  isActive: boolean
  className?: string
  barCount?: number
}

export function SoundWaveBars({ isActive, className = '', barCount = 4 }: SoundWaveBarsProps) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-hidden
    >
      {Array.from({ length: barCount }, (_, i) => (
        <span
          key={i}
          className={`block w-1 h-3 rounded-full transition-opacity duration-300 ${
            isActive ? 'bg-teal-400/90 animate-soundwave-bar' : 'bg-white/30'
          }`}
          style={
            isActive
              ? { animationDelay: `${i * 0.12}s` }
              : undefined
          }
        />
      ))}
    </div>
  )
}
