/**
 * Curated imagery - Unsplash (free, reliable CDN)
 * Format: https://images.unsplash.com/photo-{timestamp}-{hash}?w={width}&q=80
 */
const U = (slug: string, w = 800) =>
  `https://images.unsplash.com/${slug}?w=${w}&q=80&fit=crop`

/** XinBridge logo */
export const logo = '/xinbridge_logo_1.drawio.png'

export const images = {
  heroSunrise: U('photo-1507525428034-b723cf961d3e', 1200),
  morningLight: U('photo-1470071459604-3b5ec3a7fe05', 800),
  oceanSunrise: U('photo-1505142468610-359e7d316be0', 800),
  warmSunset: U('photo-1519681393784-d120267933ba', 800),
  natureGreen: U('photo-1441974231531-c6227db76b6e', 800),
  softClouds: U('photo-1472214103451-9374bd1c798e', 800),
  nightCalm: U('photo-1534796636902-acd3cc52864b', 800),
  flowers: U('photo-1490750967868-88e448145051', 800),
  handsCare: U('photo-1579684385127-1ef15d508118', 600),
  sunshine: U('photo-1544367567-0f2fcb009e0b', 600),
  family: U('photo-1529156069898-49953e39b3ac', 600),
  bookHope: U('photo-1507842217343-583bb7270b66', 600),
  breath: U('photo-1507003211169-0a1dd7228f2d', 600),
  sleepMoon: U('photo-1519681393784-d120267933ba', 600),
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
