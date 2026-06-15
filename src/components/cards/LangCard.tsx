'use client'

// LangCard — Card C0: language selection. Can't be skipped.

import type { CardConfig, Language } from '@/types/cards'
import { useAutoSave } from '@/hooks/useAutoSave'

interface Props {
  card: CardConfig
  studyId: string
  onComplete: (lang: Language) => void
}

export default function LangCard({ card, studyId, onComplete }: Props) {
  const { save, saving } = useAutoSave(studyId)

  async function choose(lang: Language) {
    await save({ card_id: card.id, answer: lang, status: 'done' })
    onComplete(lang)
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-2 pb-4">
      <p className="text-sm text-slate-500 text-center mb-2">
        {card.en.helper}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {card.options?.map(opt => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value as Language)}
            disabled={saving}
            dir={opt.dir}
            className="flex-1 py-5 rounded-xl border-2 border-slate-200
                       hover:border-gold-500 hover:bg-gold-100/40
                       active:scale-[0.98] transition-all duration-150
                       text-center font-medium text-navy-900 text-lg
                       focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          >
            <span className="block font-display text-2xl mb-1">
              {opt.label_en}
            </span>
            <span className="block font-arabic text-base text-slate-500">
              {opt.label_ar}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
