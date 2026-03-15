/**
 * Curated imagery - Pexels (free, attribution required)
 * Professional healthcare/wellness visuals
 */
const P = (id: string, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&fit=crop`

export const images = {
  heroSunrise: P('6243769', 1200),
  morningLight: P('4010464', 800),
  oceanSunrise: P('33545', 800),
  warmSunset: P('2081128', 800),
  natureGreen: P('1392084', 800),
  softClouds: P('45848', 800),
  nightCalm: P('1072179', 800),
  flowers: P('5680269', 800),
  handsCare: P('6646916', 600),
  sunshine: P('414612', 600),
  family: P('3184292', 600),
  bookHope: P('2679617', 600),
  breath: P('1179229', 600),
  sleepMoon: P('1252890', 600),
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
}
