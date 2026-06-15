'use client'

// CardShell — the elevated swipe card that wraps every card in the journey.
// Renders the correct input component, handles navigation, shows the hint.

import { useRouter } from 'next/navigation'
import type { CardConfig, Language } from '@/types/cards'
import { localise, getNextCard, getPrevCard, sectionLabel } from '@/lib/cards/loader'
import HintPanel from './HintPanel'
import LangCard from './LangCard'
import TextCard from './TextCard'
import TableCard from './TableCard'
import UploadCard from './UploadCard'
import { cn } from '@/lib/utils'

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  userId: string
  existingAnswer?: unknown
  completionPct: number
}

export default function CardShell({ card, lang, studyId, userId, existingAnswer, completionPct }: Props) {
  const router = useRouter()
  const content = localise(card, lang)
  const dir     = lang === 'ar' ? 'rtl' : 'ltr'
  const next    = getNextCard(card.id)
  const prev    = getPrevCard(card.id)

  function goNext() {
    if (next) {
      router.push(`/study/${studyId}?card=${next.id}`)
    } else {
      router.push(`/study/${studyId}/overview`)
    }
  }

  function goPrev() {
    if (prev) router.push(`/study/${studyId}?card=${prev.id}`)
  }

  function handleLangComplete(chosenLang: Language) {
    // Reload page with the new language applied — server will read from DB
    router.push(`/study/${studyId}?card=${next?.id ?? 'C1'}&lang=${chosenLang}`)
    router.refresh()
  }

  // Section eyebrow label
  const sectionName = sectionLabel(card.section, lang)
  const isCover     = card.section === 'cover'

  return (
    <div
      className="card-swipe w-full max-w-narrow mx-auto px-6 py-7 sm:px-8 sm:py-9"
      dir={dir}
    >
      {/* Eyebrow */}
      <div className={cn(
        'flex items-center justify-between mb-5',
        lang === 'ar' && 'flex-row-reverse'
      )}>
        <span className="eyebrow">
          {isCover ? content.category : `${sectionName} · ${content.category}`}
        </span>
        {!card.required && (
          <span className="text-2xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
            {lang === 'ar' ? 'اختياري' : 'Optional'}
          </span>
        )}
      </div>

      {/* Prompt */}
      <h2 className={cn(
        'font-display text-xl sm:text-2xl font-semibold text-navy-900 leading-snug mb-2',
        lang === 'ar' && 'font-arabic text-right'
      )}>
        {content.prompt}
      </h2>

      {/* Helper */}
      {content.helper && card.type !== 'lang' && (
        <p className={cn(
          'text-sm text-slate-500 mb-5 leading-relaxed',
          lang === 'ar' && 'font-arabic text-right'
        )}>
          {content.helper}
        </p>
      )}

      {/* Card input */}
      <div className="mb-5">
        {card.type === 'lang' && (
          <LangCard
            card={card}
            studyId={studyId}
            onComplete={handleLangComplete}
          />
        )}
        {card.type === 'text' && (
          <TextCard
            card={card}
            lang={lang}
            studyId={studyId}
            initialValue={typeof existingAnswer === 'string' ? existingAnswer : ''}
            onComplete={goNext}
            onSkip={goNext}
          />
        )}
        {card.type === 'table' && (
          <TableCard
            card={card}
            lang={lang}
            studyId={studyId}
            initialRows={Array.isArray(existingAnswer) ? existingAnswer as Record<string, string>[] : undefined}
            onComplete={goNext}
            onSkip={goNext}
          />
        )}
        {card.type === 'upload' && (
          <UploadCard
            card={card}
            lang={lang}
            studyId={studyId}
            userId={userId}
            initialUrl={typeof existingAnswer === 'string' ? existingAnswer : undefined}
            onComplete={goNext}
            onSkip={goNext}
          />
        )}
      </div>

      {/* Hint */}
      {content.hint && card.type !== 'lang' && (
        <HintPanel hint={content.hint} lang={lang} />
      )}

      {/* Back nav */}
      {prev && card.type !== 'lang' && (
        <div className={cn('mt-6 pt-5 border-t border-slate-100', lang === 'ar' ? 'text-right' : 'text-left')}>
          <button
            onClick={goPrev}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {lang === 'ar' ? '← الرجوع' : '← Back'}
          </button>
        </div>
      )}
    </div>
  )
}
