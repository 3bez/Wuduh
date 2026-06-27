'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Language } from '@/types/cards'

type Locale = Language // 'en' | 'ar'
type Dir = 'ltr' | 'rtl'

interface LocaleContextValue {
  locale: Locale
  dir: Dir
  isRtl: boolean
  setLocale: (l: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  dir: 'ltr',
  isRtl: false,
  setLocale: () => {},
  toggleLocale: () => {},
})

export function useLocale() {
  return useContext(LocaleContext)
}

/**
 * Provides the UI language for the marketing + dashboard shells.
 * This is independent of a study's own language (each study keeps its own,
 * chosen at creation). Mirrors ThemeProvider: default on the server, then
 * the saved preference is read from localStorage after mount.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  // On mount — read saved preference
  useEffect(() => {
    const saved = localStorage.getItem('wuduh-locale')
    if (saved === 'ar' || saved === 'en') setLocaleState(saved)
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('wuduh-locale', l)
  }

  function toggleLocale() {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }

  const dir: Dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <LocaleContext.Provider value={{ locale, dir, isRtl: locale === 'ar', setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}
