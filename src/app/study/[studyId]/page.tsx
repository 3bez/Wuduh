import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ALL_CARDS, getCard, MANDATORY_CARDS, sectionLabel } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'
import CardShell from '@/components/cards/CardShell'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface PageProps {
  params: Promise<{ studyId: string }>
  searchParams: Promise<{ card?: string; lang?: string }>
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="var(--text-primary)" strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default async function StudyPage({ params, searchParams }: PageProps) {
  const { studyId } = await params
  const { card: cardId, lang: langOverride } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: study } = await supabase
    .from('studies').select('*')
    .eq('id', studyId).eq('user_id', user.id).single()

  if (!study) redirect('/dashboard')

  const { data: answersRaw } = await supabase
    .from('answers').select('card_id, answer, status').eq('study_id', studyId)

  const answers = Object.fromEntries(
    (answersRaw ?? []).map(a => [a.card_id, { answer: a.answer, status: a.status }])
  )

  const lang: Language = (langOverride as Language) ?? study.language ?? 'en'
  if (langOverride && langOverride !== study.language) {
    await supabase.from('studies').update({ language: lang }).eq('id', studyId)
  }

  let activeCardId = cardId
  if (!activeCardId) {
    const firstIncomplete = ALL_CARDS.find(c => !answers[c.id] || answers[c.id].status === 'skipped')
    activeCardId = firstIncomplete?.id ?? 'C0'
  }

  const card = getCard(activeCardId)
  if (!card) redirect(`/study/${studyId}?card=C0`)

  const answeredIds = new Set(
    Object.entries(answers).filter(([, v]) => v.status === 'done').map(([k]) => k)
  )
  const mandatoryDone = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  const completionPct = Math.round((mandatoryDone / MANDATORY_CARDS.length) * 100)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const currentSectionLabel = sectionLabel(card.section, lang)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }} dir={dir}>
      <style>{`
        .sj-back:hover  { color: var(--text-primary) !important; }
        .sj-overview:hover { color: var(--text-primary) !important; background: var(--bg-subtle) !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto', padding: '0 20px',
          height: 56, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Back to dashboard */}
          <Link href="/dashboard" className="sj-back" aria-label="Back to dashboard"
            style={{ color: 'var(--text-hint)', transition: 'color 140ms', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={dir === 'rtl' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </Link>

          {/* Logo → dashboard */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <LogoMark />
          </Link>

          {/* Progress */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                {card.section !== 'cover' ? currentSectionLabel : (lang === 'ar' ? 'الغلاف' : 'Cover')}
              </span>
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.04em' }}>
                {completionPct}%
              </span>
            </div>
            <div style={{ height: 3, background: 'var(--border-default)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${completionPct}%`, borderRadius: 99,
                background: completionPct === 100 ? 'var(--teal-500)' : 'var(--gold-500)',
                transition: 'width 600ms cubic-bezier(0.22,0.61,0.36,1)',
              }} />
            </div>
          </div>

          {/* Overview */}
          <Link href={`/study/${studyId}/overview`} className="sj-overview"
            style={{ fontSize: 12, color: 'var(--text-faint)', textDecoration: 'none', padding: '5px 10px', borderRadius: 6, transition: 'color 140ms, background 140ms', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
          </Link>

          <ThemeToggle />
          <div style={{ width: 1, height: 16, background: 'var(--border-default)', flexShrink: 0 }} />
          <LogoutButton />
        </div>
      </header>

      {/* ── Card area ── */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>
        <CardShell
          card={card} lang={lang} studyId={studyId} userId={user.id}
          existingAnswer={answers[card.id]?.answer} completionPct={completionPct}
        />
      </main>
    </div>
  )
}
