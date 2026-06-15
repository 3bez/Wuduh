'use client'

// HintPanel — expandable hint panel. Opens/closes inline below the card.

import { useState } from 'react'
import type { Language } from '@/types/cards'
import { cn } from '@/lib/utils'

interface Props {
  hint: string
  lang: Language
}

export default function HintPanel({ hint, lang }: Props) {
  const [open, setOpen] = useState(false)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div dir={dir}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 text-xs text-slate-400',
          'hover:text-gold-600 transition-colors'
        )}
        aria-expanded={open}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {lang === 'ar' ? (open ? 'إخفاء التلميح' : 'تلميح') : (open ? 'Hide hint' : 'Hint')}
        <svg
          className={cn('w-3 h-3 transition-transform duration-200', open && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={cn(
          'mt-3 bg-gold-100/60 border border-gold-200 rounded-lg px-4 py-3',
          'text-sm text-navy-800 leading-relaxed',
          lang === 'ar' && 'font-arabic text-right'
        )}>
          {hint}
        </div>
      )}
    </div>
  )
}
