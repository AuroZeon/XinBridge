declare module 'howler' {
  export interface HowlOptions {
    src: string | string[]
    loop?: boolean
    volume?: number
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
