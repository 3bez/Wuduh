'use client'

import { useLocale } from './LocaleProvider'

/**
 * Language switch for the marketing + dashboard shells.
 * Shows the language you'll switch TO (like a typical toggle), and persists
 * the choice via LocaleProvider (localStorage key `wuduh-locale`).
 */
export default function LocaleToggle() {
  const { isRtl, toggleLocale } = useLocale()

  // Label shows the *target* language.
  const targetLabel = isRtl ? 'EN' : 'ع'
  const aria = isRtl ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'
  const title = isRtl ? 'English' : 'العربية'

  return (
    <button
      onClick={toggleLocale}
      aria-label={aria}
      title={title}
      style={{
        height: 32,
        minWidth: 32,
        padding: '0 9px',
        borderRadius: 8,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-subtle)',
        color: 'var(--text-faint)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        transition: 'background 140ms, color 140ms, border-color 140ms',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--text-primary)'
        e.currentTarget.style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-faint)'
        e.currentTarget.style.borderColor = 'var(--border-default)'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        fontFamily: isRtl ? 'var(--font-sans), sans-serif' : 'var(--font-arabic), sans-serif',
      }}>
        {targetLabel}
      </span>
    </button>
  )
}
