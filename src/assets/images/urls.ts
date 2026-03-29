/**
 * Local image URLs - downloaded at build time. No external dependency at runtime.
 * Run npm run download-images before build.
 */
import heroSunriseUrl from './hero-sunrise.jpg?url'
import morningLightUrl from './morning-light.jpg?url'
import oceanSunriseUrl from './ocean-sunrise.jpg?url'
import warmSunsetUrl from './warm-sunset.jpg?url'
import natureGreenUrl from './nature-green.jpg?url'
import softCloudsUrl from './soft-clouds.jpg?url'
import nightCalmUrl from './night-calm.jpg?url'
import flowersUrl from './flowers.jpg?url'
import handsCareUrl from './hands-care.jpg?url'
import sunshineUrl from './sunshine.jpg?url'
import familyUrl from './family.jpg?url'
import bookHopeUrl from './book-hope.jpg?url'
import breathUrl from './breath.jpg?url'

export const IMAGE_URLS = {
  heroSunrise: heroSunriseUrl,
  morningLight: morningLightUrl,
  oceanSunrise: oceanSunriseUrl,
  warmSunset: warmSunsetUrl,
  natureGreen: natureGreenUrl,
  softClouds: softCloudsUrl,
  nightCalm: nightCalmUrl,
  flowers: flowersUrl,
  handsCare: handsCareUrl,
  sunshine: sunshineUrl,
  family: familyUrl,
  bookHope: bookHopeUrl,
  breath: breathUrl,
  sleepMoon: warmSunsetUrl,
} as const
