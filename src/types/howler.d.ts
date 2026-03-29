declare module 'howler' {
  export const Howler: {
    stop(): void
    unload(): void
  }
  export interface HowlOptions {
    src: string | string[]
    html5?: boolean
    loop?: boolean
    volume?: number
    preload?: boolean
    onload?: () => void
    onloaderror?: () => void
  }

  export class Howl {
    constructor(options: HowlOptions)
    play(): number
    stop(): this
    volume(value?: number): number | this
    fade(from: number, to: number, duration: number): this
    unload(): void
  }
}
