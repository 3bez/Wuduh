// /study/[studyId]/overview — section overview with jump-to-card navigation.
// Shows every card grouped by section with done/skipped/pending status.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SECTIONS, getCardsForSection, MANDATORY_CARDS } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'
import StudyProgressBar from '@/components/ui/StudyProgressBar'
import LogoutButton from '@/components/ui/LogoutButton'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ studyId: string }>
}

export default async function OverviewPage({ params }: PageProps) {
  const { studyId } = await params
  const supabase    = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: study } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .eq('user_id', user.id)
    .single()

  if (!study) redirect('/dashboard')

  const { data: answersRaw } = await supabase
    .from('answers')
    .select('card_id, status')
    .eq('study_id', studyId)

  const answers = Object.fromEntries((answersRaw ?? []).map(a => [a.card_id, a.status]))

  const lang: Language = (study.language as Language) ?? 'en'
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const answeredIds = new Set(Object.entries(answers).filter(([, s]) => s === 'done').map(([k]) => k))
  const mandatoryDone = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  const completionPct = Math.round((mandatoryDone / MANDATORY_CARDS.length) * 100)

  // Sections (skip cover in the list view)
  const contentSections = SECTIONS.filter(s => s.id !== 'cover')

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-container mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            href={`/study/${studyId}`}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={dir === 'rtl' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </Link>
          <div className="flex-1">
            <StudyProgressBar percentage={completionPct} lang={lang} />
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-narrow mx-auto px-4 py-10">
        {/* Study name + export */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">{lang === 'ar' ? 'نظرة عامة' : 'Study overview'}</p>
            <h1 className={cn(
              'font-display text-2xl font-semibold text-navy-900',
              lang === 'ar' && 'font-arabic'
            )}>
              {study.startup_name ?? (lang === 'ar' ? 'دراسة بدون عنوان' : 'Untitled study')}
            </h1>
          </div>
          <Link
            href={`/study/${studyId}/export`}
            className="btn-accent text-sm py-2 px-4 whitespace-nowrap"
          >
            {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Link>
        </div>

        {/* Section list */}
        <div className="space-y-4">
          {contentSections.map(section => {
            const cards = getCardsForSection(section.id)
            const done  = cards.filter(c => answers[c.id] === 'done').length
            const total = cards.length

            return (
              <div key={section.id} className="card overflow-hidden">
                {/* Section header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <h2 className={cn(
                    'font-medium text-navy-900 text-base',
                    lang === 'ar' && 'font-arabic'
                  )}>
                    {section[lang].label}
                  </h2>
                  <span className="font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
                    {done} / {total}
                  </span>
                </div>

                {/* Card rows */}
                <ul className="divide-y divide-slate-50">
                  {cards.map(card => {
                    const status  = answers[card.id] ?? 'pending'
                    const content = card[lang]

                    return (
                      <li key={card.id}>
                        <Link
                          href={`/study/${studyId}?card=${card.id}`}
                          className={cn(
                            'flex items-center gap-3 px-5 py-3.5',
                            'hover:bg-slate-50 transition-colors',
                            lang === 'ar' && 'flex-row-reverse'
                          )}
                        >
                          {/* Status dot */}
                          <span className={cn(
                            'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                            status === 'done'    && 'bg-teal-100',
                            status === 'skipped' && 'bg-warning-100',
                            status === 'pending' && 'bg-slate-100',
                          )}>
                            {status === 'done' && (
                              <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {status === 'skipped' && (
                              <svg className="w-3 h-3 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8" />
                              </svg>
                            )}
                          </span>

                          <span className={cn(
                            'flex-1 text-sm',
                            status === 'done'    && 'text-navy-800',
                            status === 'skipped' && 'text-slate-500',
                            status === 'pending' && 'text-slate-700',
                            lang === 'ar' && 'font-arabic text-right'
                          )}>
                            {content.prompt}
                          </span>

                          {!card.required && (
                            <span className="text-2xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 flex-shrink-0">
                              {lang === 'ar' ? 'اختياري' : 'Optional'}
                            </span>
                          )}

                          <svg
                            className={cn(
                              'w-4 h-4 text-slate-300 flex-shrink-0',
                              lang === 'ar' && 'rotate-180'
                            )}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Continue / Export footer */}
        <div className={cn('mt-8 flex gap-3', lang === 'ar' && 'flex-row-reverse')}>
          <Link
            href={`/study/${studyId}`}
            className="flex-1 btn-primary py-3 text-sm text-center"
          >
            {lang === 'ar' ? 'متابعة الدراسة' : 'Continue study'}
          </Link>
          <Link
            href={`/study/${studyId}/export`}
            className="flex-1 btn-accent py-3 text-sm text-center"
          >
            {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Link>
        </div>
      </main>
    </div>
  )
}
