import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SECTIONS, getCardsForSection, MANDATORY_CARDS } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'
import LogoutButton from '@/components/ui/LogoutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface PageProps { params: Promise<{ studyId: string }> }

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

export default async function OverviewPage({ params }: PageProps) {
  const { studyId } = await params
  const supabase    = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: study } = await supabase.from('studies').select('*')
    .eq('id', studyId).eq('user_id', user.id).single()
  if (!study) redirect('/dashboard')

  const { data: answersRaw } = await supabase.from('answers')
    .select('card_id, status').eq('study_id', studyId)

  const answers = Object.fromEntries((answersRaw ?? []).map(a => [a.card_id, a.status as string]))
  const lang: Language = (study.language as Language) ?? 'en'
  const dir  = lang === 'ar' ? 'rtl' : 'ltr'

  const answeredIds   = new Set(Object.entries(answers).filter(([, s]) => s === 'done').map(([k]) => k))
  const mandatoryDone = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  const completionPct = Math.round((mandatoryDone / MANDATORY_CARDS.length) * 100)

  const contentSections = SECTIONS.filter(s => s.id !== 'cover')
  const sectionStats = contentSections.map(section => {
    const cards   = getCardsForSection(section.id)
    const done    = cards.filter(c => answers[c.id] === 'done').length
    const skipped = cards.filter(c => answers[c.id] === 'skipped').length
    const total   = cards.length
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0
    return { section, cards, done, skipped, total, pct }
  })

  const totalDone    = sectionStats.reduce((a, s) => a + s.done, 0)
  const totalCards   = sectionStats.reduce((a, s) => a + s.total, 0)
  const totalSkipped = sectionStats.reduce((a, s) => a + s.skipped, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }} dir={dir}>
      <style>{`
        .ov-back:hover  { color: var(--text-primary) !important; }
        .ov-row:hover   { background: var(--bg-subtle) !important; }
        .ov-continue:hover { opacity: 0.85; }
        .ov-export:hover   { background: var(--gold-400) !important; }
        .ov-cont-link:hover { background: var(--gold-100) !important; color: var(--gold-700) !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href={`/study/${studyId}`} className="ov-back" aria-label="Back to study"
            style={{ color: 'var(--text-hint)', transition: 'color 140ms', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={dir === 'rtl' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </Link>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <LogoMark />
          </Link>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
            {lang === 'ar' ? 'نظرة عامة' : 'Overview'}
          </span>
          <ThemeToggle />
          <div style={{ width: 1, height: 16, background: 'var(--border-default)' }} />
          <LogoutButton />
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-500)', marginBottom: 10 }}>
            {lang === 'ar' ? 'نظرة عامة على الدراسة' : 'Study overview'}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
            <h1 style={{
              fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif',
              fontSize: 26, fontWeight: 500, color: 'var(--text-primary)',
              letterSpacing: lang === 'ar' ? 0 : '-0.02em', lineHeight: 1.2,
            }}>
              {study.startup_name ?? (lang === 'ar' ? 'دراسة بدون عنوان' : 'Untitled study')}
            </h1>
            <Link href={`/study/${studyId}/export`} className="ov-export" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'var(--gold-500)', color: '#0D1B2A',
              fontSize: 13, fontWeight: 600, borderRadius: 8, padding: '9px 16px',
              textDecoration: 'none', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(201,168,76,0.25)', transition: 'background 140ms',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28, overflow: 'hidden' }}>
          {[
            { value: `${completionPct}%`, label: lang === 'ar' ? 'مكتمل' : 'Complete', color: completionPct === 100 ? 'var(--teal-500)' : 'var(--gold-500)' },
            { value: `${totalDone} / ${totalCards}`, label: lang === 'ar' ? 'بطاقات منجزة' : 'Cards answered', color: 'var(--text-primary)' },
            { value: String(totalSkipped), label: lang === 'ar' ? 'تم تخطيها' : 'Skipped', color: totalSkipped > 0 ? 'var(--warning-500)' : 'var(--text-faint)' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ padding: '20px 16px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border-default)' : undefined }}>
              <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 26, fontWeight: 500, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 5 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sectionStats.map(({ section, cards, done, skipped, total, pct }) => (
            <div key={section.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, overflow: 'hidden' }}>

              {/* Section header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                {/* Progress ring */}
                <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="16" cy="16" r="12" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                    <circle cx="16" cy="16" r="12" fill="none"
                      stroke={pct === 100 ? 'var(--teal-500)' : 'var(--gold-500)'}
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 12}`}
                      strokeDashoffset={`${2 * Math.PI * 12 * (1 - pct / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono), monospace', fontSize: 8, color: 'var(--text-muted)' }}>
                    {pct}
                  </span>
                </div>

                <div style={{ flex: 1, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : undefined, marginBottom: 1 }}>
                    {section[lang].label}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)' }}>
                    {done} / {total}{skipped > 0 && ` · ${skipped} ${lang === 'ar' ? 'محذوف' : 'skipped'}`}
                  </p>
                </div>

                {pct < 100 && (
                  <Link href={`/study/${studyId}?card=${cards.find(c => answers[c.id] !== 'done')?.id ?? cards[0].id}`}
                    className="ov-cont-link"
                    style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.06em', color: 'var(--gold-500)', textDecoration: 'none', padding: '4px 10px', borderRadius: 99, border: '1px solid var(--gold-500)', transition: 'background 140ms, color 140ms', flexShrink: 0 }}>
                    {lang === 'ar' ? 'متابعة' : 'Continue'}
                  </Link>
                )}
              </div>

              {/* Card rows */}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {cards.map((card, idx) => {
                  const status  = answers[card.id] ?? 'pending'
                  const content = card[lang]

                  const statusConfig = {
                    done:    { bg: 'var(--success-100)', icon: 'var(--teal-500)' },
                    skipped: { bg: 'var(--warning-100)', icon: 'var(--warning-500)' },
                    pending: { bg: 'var(--bg-subtle)',   icon: 'var(--text-faint)' },
                  }[status] ?? { bg: 'var(--bg-subtle)', icon: 'var(--text-faint)' }

                  return (
                    <li key={card.id} style={{ borderTop: idx > 0 ? '1px solid var(--border-subtle)' : undefined }}>
                      <Link href={`/study/${studyId}?card=${card.id}`} className="ov-row" style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 20px', textDecoration: 'none',
                        transition: 'background 140ms',
                        flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
                      }}>
                        {/* Status icon */}
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: statusConfig.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {status === 'done' && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={statusConfig.icon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>
                          )}
                          {status === 'skipped' && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={statusConfig.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h6m0 0l-2-2m2 2l-2 2" /></svg>
                          )}
                          {status === 'pending' && (
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: statusConfig.icon }} />
                          )}
                        </div>

                        <span style={{
                          flex: 1, fontSize: 13,
                          color: status === 'done' ? 'var(--text-secondary)' : status === 'skipped' ? 'var(--text-faint)' : 'var(--text-secondary)',
                          lineHeight: 1.4,
                          fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : undefined,
                          textAlign: dir === 'rtl' ? 'right' : 'left',
                        }}>
                          {content.prompt}
                        </span>

                        {!card.required && (
                          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.06em', color: 'var(--text-faint)', border: '1px solid var(--border-strong)', padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>
                            {lang === 'ar' ? 'اختياري' : 'Optional'}
                          </span>
                        )}

                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ flexShrink: 0, transform: dir === 'rtl' ? 'rotate(180deg)' : undefined }} aria-hidden="true">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ marginTop: 32, display: 'flex', gap: 10, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
          <Link href={`/study/${studyId}`} className="ov-continue" style={{
            flex: 1, textAlign: 'center', background: 'var(--text-primary)', color: 'var(--bg-page)',
            fontSize: 14, fontWeight: 500, borderRadius: 9, padding: '13px 0',
            textDecoration: 'none', transition: 'opacity 140ms',
          }}>
            {lang === 'ar' ? 'متابعة الدراسة' : 'Continue study'}
          </Link>
          <Link href={`/study/${studyId}/export`} className="ov-export" style={{
            flex: 1, textAlign: 'center', background: 'var(--gold-500)', color: '#0D1B2A',
            fontSize: 14, fontWeight: 600, borderRadius: 9, padding: '13px 0',
            textDecoration: 'none', transition: 'background 140ms',
          }}>
            {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Link>
        </div>
      </main>
    </div>
  )
}
