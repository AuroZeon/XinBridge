/**
 * Brightness Sync: when ambient/dark (prefers-color-scheme: dark), apply OLED Black mode.
 */
import { createContext, useContext, useState, useEffect } from 'react'

type AmbientDarkContextValue = {
  isOledDark: boolean
}

const AmbientDarkContext = createContext<AmbientDarkContextValue>({ isOledDark: false })

export function useAmbientDark() {
  return useContext(AmbientDarkContext)
}

export function AmbientDarkProvider({ children }: { children: React.ReactNode }) {
  const [isOledDark, setIsOledDark] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setIsOledDark(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isOledDark) {
      root.classList.add('oled-dark')
    } else {
      root.classList.remove('oled-dark')
    }
  }, [isOledDark])

  return (
    <AmbientDarkContext.Provider value={{ isOledDark }}>
      {children}
    </AmbientDarkContext.Provider>
  )
}
