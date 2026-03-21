declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number
    spread?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
    shapes?: string[]
    startVelocity?: number
    decay?: number
  }
  export default function confetti(options?: Options): Promise<null>
}
