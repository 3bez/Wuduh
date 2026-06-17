import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Study } from '@/types/database'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'
import RenameStudy from '@/components/ui/RenameStudy'

// ── Logo mark — stroke uses CSS var so it adapts to dark mode ─────────────
function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path
        d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="var(--text-primary)"
        strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: studies } = await supabase
    .from('studies').select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles').select('full_name')
    .eq('id', user.id).single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Founder'
  const hasStudies = studies && studies.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <style>{`
        .db-new-btn:hover { opacity: 0.85; }
        .study-card { transition: box-shadow 200ms, transform 200ms; }
        .study-card:hover { box-shadow: var(--shadow-elevated); transform: translateY(-1px); }
        .study-card-continue:hover { opacity: 0.85; }
        .study-card-export:hover { background: var(--gold-400) !important; }
        .new-study-card:hover { border-color: var(--gold-500) !important; background: rgba(201,168,76,0.06) !important; }
        .new-study-card:hover .nsc-icon { background: var(--gold-100) !important; color: var(--gold-700) !important; }
        @media (max-width: 640px) {
          .db-header-inner { padding: 0 16px !important; height: 52px !important; }
          .db-email { display: none !important; }
          .db-wordmark { display: none !important; }
          .db-heading { font-size: 22px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="db-header-inner" style={{
          maxWidth: 1120, margin: '0 auto', padding: '0 24px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoMark />
            <span style={{
              fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18,
              color: 'var(--text-primary)', letterSpacing: '-0.01em',
            }}>Wuduh</span>
            <span className="db-wordmark" style={{
              fontFamily: 'var(--font-arabic), sans-serif', fontSize: 13,
              color: 'var(--text-faint)', direction: 'rtl',
            }}>وضوح</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="db-email" style={{ fontSize: 13, color: 'var(--text-faint)' }}>{user.email}</span>
            <ThemeToggle />
            <div style={{ width: 1, height: 16, background: 'var(--border-default)' }} />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: 'var(--font-mono), monospace', fontSize: 11,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--gold-500)', marginBottom: 10,
          }}>Dashboard</p>
          <div className="dash-page-header">
            <div>
              <h1 className="db-heading" style={{
              fontFamily: 'var(--font-display), serif', fontSize: 30, fontWeight: 500,
              color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6,
              }}>Welcome back, {firstName}</h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {hasStudies ? 'Continue where you left off, or start a new study.' : "Let's build your first feasibility study."}
              </p>
            </div>
            <Link href="/study/new" className="db-new-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--text-primary)', color: 'var(--bg-page)',
              fontSize: 14, fontWeight: 500, borderRadius: 9, padding: '11px 20px',
              textDecoration: 'none', transition: 'opacity 140ms', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 4v16m8-8H4" />
              </svg>
              New study
            </Link>
          </div>
        </div>

        {/* Grid or empty state */}
        {hasStudies ? (
          <div className="study-grid">
            {studies.map(study => <StudyCard key={study.id} study={study} />)}
            <NewStudyCard />
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}

// ── Study card ─────────────────────────────────────────────────────────────
function StudyCard({ study }: { study: Study }) {
  const pct = study.completion_percentage ?? 0

  const statusLabel = pct === 100 ? 'Complete' : pct === 0 ? 'Not started' : 'In progress'

  // Status badge — uses semantic colors that work in both modes
  const statusStyle = pct === 100
    ? { background: 'var(--success-100)', color: 'var(--success-500)' }
    : pct === 0
    ? { background: 'var(--bg-subtle)', color: 'var(--text-faint)' }
    : { background: 'var(--gold-100)', color: 'var(--gold-700)' }

  const langStyle = study.language === 'ar'
    ? { background: 'var(--teal-100)', color: 'var(--teal-700)' }
    : { background: 'var(--bg-subtle)', color: 'var(--text-faint)' }

  return (
    <div className="study-card" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 16, padding: 24,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {study.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={study.logo_url} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-mono), monospace', fontSize: 10,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 99, ...langStyle,
          }}>
            {study.language === 'ar' ? 'عربي' : 'EN'}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono), monospace', fontSize: 10,
            letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 99, ...statusStyle,
          }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Name + date */}
      <RenameStudy studyId={study.id} currentName={study.startup_name ?? null} />
      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 20 }}>
        Updated {formatDate(study.updated_at)}
      </p>

      {/* Progress */}
      <div style={{ marginBottom: 20, marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Progress</span>
          <span style={{
            fontFamily: 'var(--font-mono), monospace', fontSize: 12,
            color: pct === 100 ? 'var(--teal-500)' : 'var(--text-muted)',
            fontWeight: pct === 100 ? 600 : 400,
          }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 99,
            background: pct === 100 ? 'var(--teal-500)' : 'var(--gold-500)',
            transition: 'width 600ms cubic-bezier(0.22,0.61,0.36,1)',
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/study/${study.id}`} className="study-card-continue" style={{
          flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500,
          color: 'var(--bg-page)', background: 'var(--text-primary)',
          borderRadius: 8, padding: '9px 0', textDecoration: 'none',
          transition: 'opacity 140ms',
        }}>
          {pct === 100 ? 'Review' : 'Continue'}
        </Link>
        <Link href={`/study/${study.id}/export`} className="study-card-export" style={{
          flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500,
          color: 'var(--gold-700)', background: 'var(--gold-100)',
          borderRadius: 8, padding: '9px 0', textDecoration: 'none',
          transition: 'background 140ms',
        }}>
          Export PDF
        </Link>
      </div>
    </div>
  )
}

// ── New study card ─────────────────────────────────────────────────────────
function NewStudyCard() {
  return (
    <Link href="/study/new" className="new-study-card" style={{
      background: 'transparent', border: '1.5px dashed var(--border-strong)',
      borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      textDecoration: 'none', minHeight: 220,
      transition: 'border-color 200ms, background 200ms',
    }}>
      <div className="nsc-icon" style={{
        width: 44, height: 44, borderRadius: 10,
        background: 'var(--bg-subtle)', color: 'var(--text-faint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 200ms, color 200ms',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 3 }}>New study</p>
        <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Arabic or English</p>
      </div>
    </Link>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 20, padding: '72px 40px', textAlign: 'center',
      maxWidth: 560, margin: '0 auto',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: 'var(--bg-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
      }}>
        <LogoMark size={28} />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display), serif', fontSize: 22, fontWeight: 500,
        color: 'var(--text-primary)', letterSpacing: '-0.015em', marginBottom: 10,
      }}>Your first study starts here</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 32px' }}>
        Answer one card at a time. When you&apos;re done, Wuduh assembles your answers into a feasibility study you&apos;ll be proud to send to investors.
      </p>

      {/* Stats */}
      <div style={{
        display: 'flex', marginBottom: 32,
        background: 'var(--bg-subtle)', borderRadius: 12, overflow: 'hidden',
      }}>
        {[{ num: '52', label: 'cards' }, { num: '8', label: 'sections' }, { num: '2', label: 'languages' }].map((s, i) => (
          <div key={s.label} style={{
            flex: 1, padding: '16px 8px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid var(--border-default)' : undefined,
          }}>
            <div style={{
              fontFamily: 'var(--font-display), serif', fontSize: 24, fontWeight: 500,
              color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4,
            }}>{s.num}<span style={{ color: 'var(--gold-500)' }}>.</span></div>
            <div style={{
              fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase',
              letterSpacing: '0.06em', fontFamily: 'var(--font-mono), monospace',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Link href="/study/new" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--text-primary)', color: 'var(--bg-page)',
        fontSize: 14, fontWeight: 500, borderRadius: 9, padding: '12px 24px', textDecoration: 'none',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v16m8-8H4" />
        </svg>
        Start your first study
      </Link>
    </div>
  )
}
