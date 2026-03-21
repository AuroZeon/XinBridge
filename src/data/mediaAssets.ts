/**
 * Curated imagery - Pexels (free, attribution required)
 * Professional healthcare/wellness visuals
 * URL format: /photos/{id}/{filename}?w={width}
 */
const P = (id: string, filename: string, w = 800) =>
  `https://images.pexels.com/photos/${id}/${filename}?auto=compress&cs=tinysrgb&w=${w}`

/** XinBridge logo - used for favicon, header, app icon */
export const logo = '/xinbridge_logo_1.drawio.png'

export const images = {
  heroSunrise: P('6243769', 'pexels-photo-6243769.jpeg', 1200),
  morningLight: P('4010464', 'pexels-photo-4010464.jpeg', 800),
  oceanSunrise: P('33545', 'pexels-photo-33545.jpeg', 800),
  warmSunset: P('2081128', 'pexels-photo-2081128.jpeg', 800),
  natureGreen: P('1392084', 'pexels-photo-1392084.jpeg', 800),
  softClouds: P('45848', 'pexels-photo-45848.jpeg', 800),
  nightCalm: P('1072179', 'pexels-photo-1072179.jpeg', 800),
  flowers: P('462118', 'pexels-photo-462118.jpeg', 800),
  handsCare: P('6646916', 'pexels-photo-6646916.jpeg', 600),
  sunshine: P('414612', 'pexels-photo-414612.jpeg', 600),
  family: P('3184292', 'pexels-photo-3184292.jpeg', 600),
  bookHope: P('159711', 'books-bookstore-book-reading-159711.jpeg', 600),
  breath: P('1179229', 'pexels-photo-1179229.jpeg', 600),
  sleepMoon: P('1252890', 'pexels-photo-1252890.jpeg', 600),
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
