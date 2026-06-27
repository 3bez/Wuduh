'use client'

import { useRouter } from 'next/navigation'
import type { Language } from '@/types/cards'

/**
 * Switches THIS study's language (persisted to studies.language via the
 * `?lang=` override that the study + overview pages handle on load).
 * Independent of the site-wide UI toggle — a study owns its language because
 * it drives the card content and the PDF export.
 */
export default function StudyLangToggle({ targetLang, href }: { targetLang: Language; href: string }) {
  const router = useRouter()

  function go() {
    router.push(href)
    router.refresh()
  }

  const label = targetLang === 'ar' ? 'ع' : 'EN'
  const aria = targetLang === 'ar' ? 'تغيير لغة الدراسة إلى العربية' : 'Switch study language to English'
  const title = targetLang === 'ar' ? 'العربية' : 'English'

  return (
    <button
      onClick={go}
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
        fontFamily: targetLang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif',
      }}>
        {label}
      </span>
    </button>
  )
}
