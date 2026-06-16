'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolved: 'light',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<ResolvedTheme>('light')

  // On mount — read saved preference
  useEffect(() => {
    const saved = localStorage.getItem('wuduh-theme') as Theme | null
    if (saved) setThemeState(saved)
  }, [])

  // Whenever theme changes — apply .dark class + watch system preference
  useEffect(() => {
    const root = document.documentElement

    function apply(t: Theme) {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = t === 'dark' || (t === 'system' && systemDark)
      root.classList.toggle('dark', isDark)
      setResolved(isDark ? 'dark' : 'light')
    }

    apply(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('wuduh-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
