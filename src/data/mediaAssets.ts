/**
 * Local imagery - downloaded at build time. No external dependency.
 * Run npm run download-images before build.
 */
import { IMAGE_URLS } from '../assets/images/urls'

/** XinBridge logo */
export const logo = '/xinbridge_logo_1.drawio.png'

export const images = {
  heroSunrise: IMAGE_URLS.heroSunrise,
  morningLight: IMAGE_URLS.morningLight,
  oceanSunrise: IMAGE_URLS.oceanSunrise,
  warmSunset: IMAGE_URLS.warmSunset,
  natureGreen: IMAGE_URLS.natureGreen,
  softClouds: IMAGE_URLS.softClouds,
  nightCalm: IMAGE_URLS.nightCalm,
  flowers: IMAGE_URLS.flowers,
  handsCare: IMAGE_URLS.handsCare,
  sunshine: IMAGE_URLS.sunshine,
  family: IMAGE_URLS.family,
  bookHope: IMAGE_URLS.bookHope,
  breath: IMAGE_URLS.breath,
  sleepMoon: IMAGE_URLS.sleepMoon,
} as const

export const menuImages: Record<string, string> = {
  mood: images.flowers,
  chat: images.handsCare,
  symptoms: images.natureGreen,
  doctor: images.sunshine,
  breathing: images.breath,
  sleep: images.sleepMoon,
  caregiver: images.family,
  hope: images.bookHope,
  games: images.softClouds,
}
