// /study/[studyId] — the main card journey page.
// Reads ?card=ID from the URL. Defaults to the last incomplete card (resume).
// Server component: fetches study + all answers + resolves the active card.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ALL_CARDS, getCard, MANDATORY_CARDS } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'
import CardShell from '@/components/cards/CardShell'
import StudyProgressBar from '@/components/ui/StudyProgressBar'
import LogoutButton from '@/components/ui/LogoutButton'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ studyId: string }>
  searchParams: Promise<{ card?: string; lang?: string }>
}

export default async function StudyPage({ params, searchParams }: PageProps) {
  const { studyId }   = await params
  const { card: cardId, lang: langOverride } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch study
  const { data: study } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .eq('user_id', user.id)
    .single()

  if (!study) redirect('/dashboard')

  // Fetch all answers for this study
  const { data: answersRaw } = await supabase
    .from('answers')
    .select('card_id, answer, status')
    .eq('study_id', studyId)

  const answers = Object.fromEntries(
    (answersRaw ?? []).map(a => [a.card_id, { answer: a.answer, status: a.status }])
  )

  // Determine active language
  const lang: Language = (langOverride as Language) ?? study.language ?? 'en'

  // If language just changed, update the study record
  if (langOverride && langOverride !== study.language) {
    await supabase
      .from('studies')
      .update({ language: lang as Language })
      .eq('id', studyId)
  }

  // Resolve which card to show
  let activeCardId = cardId

  if (!activeCardId) {
    // Resume: find first incomplete mandatory card, or default to C0
    const firstIncomplete = ALL_CARDS.find(c =>
      !answers[c.id] || answers[c.id].status === 'skipped'
    )
    activeCardId = firstIncomplete?.id ?? 'C0'
  }

  const card = getCard(activeCardId)
  if (!card) redirect(`/study/${studyId}?card=C0`)

  // Completion %
  const answeredIds = new Set(
    Object.entries(answers)
      .filter(([, v]) => v.status === 'done')
      .map(([k]) => k)
  )
  const mandatoryDone = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  const completionPct = Math.round((mandatoryDone / MANDATORY_CARDS.length) * 100)

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-container mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Back to dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={dir === 'rtl' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </Link>

          <div className="flex-1">
            <StudyProgressBar percentage={completionPct} lang={lang} />
          </div>

          <Link
            href={`/study/${studyId}/overview`}
            className="text-xs text-slate-500 hover:text-navy-900 transition-colors whitespace-nowrap"
          >
            {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
          </Link>

          <LogoutButton />
        </div>
      </header>

      {/* Card area */}
      <main className="max-w-narrow mx-auto px-4 py-10 sm:py-16">
        <CardShell
          card={card}
          lang={lang}
          studyId={studyId}
          userId={user.id}
          existingAnswer={answers[card.id]?.answer}
          completionPct={completionPct}
        />
      </main>
    </div>
  )
}
