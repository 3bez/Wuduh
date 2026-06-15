'use client'

// TextCard — open text input. Auto-saves on blur, 300ms debounce on keystroke.

import { useState } from 'react'
import type { CardConfig, Language } from '@/types/cards'
import { localise } from '@/lib/cards/loader'
import { useAutoSave } from '@/hooks/useAutoSave'
import { cn } from '@/lib/utils'

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  initialValue?: string
  onComplete: (value: string) => void
  onSkip: () => void
}

export default function TextCard({ card, lang, studyId, initialValue = '', onComplete, onSkip }: Props) {
  const [value, setValue]   = useState(initialValue)
  const { save, saving, lastSaved } = useAutoSave(studyId)
  const content = localise(card, lang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const maxLen = card.max_length ?? 1000

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    // Debounced auto-save while typing
    save({ card_id: card.id, answer: e.target.value, status: 'done' }, 800)
  }

  function handleBlur() {
    if (value.trim()) {
      save({ card_id: card.id, answer: value, status: 'done' })
    }
  }

  async function handleComplete() {
    await save({ card_id: card.id, answer: value, status: 'done' })
    onComplete(value)
  }

  async function handleSkip() {
    await save({ card_id: card.id, answer: value || null, status: 'skipped' })
    onSkip()
  }

  return (
    <div className="flex flex-col gap-4" dir={dir}>
      {content.example && (
        <div className="bg-slate-50 border border-slate-200 rounded-md px-4 py-3">
          <p className="eyebrow text-2xs mb-1">{lang === 'ar' ? 'مثال' : 'Example'}</p>
          <p className="text-sm text-slate-600 italic leading-relaxed">{content.example}</p>
        </div>
      )}

      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          dir={dir}
          rows={6}
          maxLength={maxLen}
          placeholder={content.helper}
          className={cn(
            'w-full rounded-lg border border-slate-200 px-4 py-3',
            'text-base text-navy-900 placeholder:text-slate-400 leading-relaxed',
            'resize-none',
            'focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500',
            'transition-colors duration-150',
            lang === 'ar' && 'font-arabic text-right'
          )}
        />
        <div className={cn(
          'absolute bottom-3 text-xs text-slate-400',
          lang === 'ar' ? 'left-3' : 'right-3'
        )}>
          {value.length} / {maxLen}
        </div>
      </div>

      {/* Save indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {saving
            ? (lang === 'ar' ? 'جاري الحفظ…' : 'Saving…')
            : lastSaved
            ? (lang === 'ar' ? 'تم الحفظ' : 'Saved')
            : ''}
        </span>
      </div>

      {/* Actions */}
      <div className={cn('flex gap-3 mt-2', lang === 'ar' && 'flex-row-reverse')}>
        <button
          onClick={handleComplete}
          disabled={saving}
          className="flex-1 btn-primary py-3 text-sm"
        >
          {lang === 'ar' ? 'تم ← التالي' : 'Done — next card'}
        </button>
        {!card.required && (
          <button
            onClick={handleSkip}
            disabled={saving}
            className="btn-ghost py-3 text-sm px-4"
          >
            {lang === 'ar' ? 'تخطّ' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  )
}
