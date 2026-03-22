/**
 * Mission complete - confetti, slow-motion golden particles
 */
import confetti from 'canvas-confetti'

export function fireMissionConfetti(): void {
  const count = 80
  const defaults = { origin: { y: 0.6 }, startVelocity: 35 }
  const colors = ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#fef3c7']

  function fire(particleRatio: number, spread: number) {
    confetti({
      ...defaults,
      particleCount: Math.floor(count * particleRatio),
      colors,
      spread,
    })
  }

  fire(0.25, 26)
  fire(0.2, 60)
  fire(0.35, 100)
  fire(0.1, 120)
}
