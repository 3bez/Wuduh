'use client'

import { useState } from 'react'
import type { Language } from '@/types/cards'

interface Props {
  hint: string
  lang: Language
}

export default function HintPanel({ hint, lang }: Props) {
  const [open, setOpen] = useState(false)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div dir={dir}>
      <style>{`
        .hint-toggle:hover { color: #A6852F !important; }
        @keyframes hint-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .hint-body { animation: hint-in 200ms cubic-bezier(0.22,0.61,0.36,1) both; }
      `}</style>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="hint-toggle"
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          color: '#C9A84C',
          padding: 0,
          fontFamily: 'var(--font-sans), sans-serif',
          transition: 'color 140ms',
          flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
        }}
      >
        {/* Lightbulb icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>{lang === 'ar' ? (open ? 'إخفاء التلميح' : 'تلميح') : (open ? 'Hide hint' : 'Hint')}</span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
          aria-hidden="true"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="hint-body"
          style={{
            marginTop: 10,
            background: '#FFFBF0',
            border: '1px solid #EEE0BF',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            color: '#4A5666',
            lineHeight: 1.7,
            textAlign: dir === 'rtl' ? 'right' : 'left',
            fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : undefined,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}
