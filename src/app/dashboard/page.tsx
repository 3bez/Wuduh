import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Study } from '@/types/database'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'

// ── Logo mark ──────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path
        d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="#0D1B2A"
        strokeWidth="7.8"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: studies } = await supabase
    .from('studies')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Founder'
  const hasStudies = studies && studies.length > 0

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F8' }}>

      {/* ── Header ── */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #E8ECF1',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoMark />
            <span style={{
              fontFamily: 'var(--font-display), "IBM Plex Serif", serif',
              fontWeight: 600,
              fontSize: 18,
              color: '#0D1B2A',
              letterSpacing: '-0.01em',
            }}>
              Wuduh
            </span>
            <span style={{
              fontFamily: 'var(--font-arabic), "IBM Plex Sans Arabic", sans-serif',
              fontSize: 13,
              color: '#8795A6',
              direction: 'rtl',
            }}>
              وضوح
            </span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 13, color: '#8795A6' }}>{user.email}</span>
            <div style={{ width: 1, height: 16, background: '#E8ECF1' }} />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: 'var(--font-mono), "IBM Plex Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            marginBottom: 10,
          }}>
            Dashboard
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display), "IBM Plex Serif", serif',
                fontSize: 30,
                fontWeight: 500,
                color: '#0D1B2A',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 6,
              }}>
                Welcome back, {firstName}
              </h1>
              <p style={{ fontSize: 15, color: '#647183', lineHeight: 1.5 }}>
                {hasStudies
                  ? 'Continue where you left off, or start a new study.'
                  : "Let's build your first feasibility study."}
              </p>
            </div>

            {/* New study button — always visible */}
            <Link
              href="/study/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#0D1B2A',
                color: '#EEF3F7',
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 9,
                padding: '11px 20px',
                textDecoration: 'none',
                transition: 'background 140ms',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 4v16m8-8H4" />
              </svg>
              New study
            </Link>
          </div>
        </div>

        {/* ── Studies grid or empty state ── */}
        {hasStudies ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {studies.map(study => (
              <StudyCard key={study.id} study={study} />
            ))}

            {/* "New study" card — always last in grid */}
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

  // Determine status label
  const statusLabel = pct === 100 ? 'Complete' : pct === 0 ? 'Not started' : 'In progress'
  const statusColor = pct === 100
    ? { bg: '#DCEFE6', text: '#11724E' }
    : pct === 0
    ? { bg: '#E8ECF1', text: '#647183' }
    : { bg: '#F6EEDB', text: '#8A6F26' }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E8ECF1',
      borderRadius: 16,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 200ms, transform 200ms',
    }}
      className="study-card"
    >
      <style>{`
        .study-card:hover { box-shadow: 0 8px 24px rgba(13,27,42,0.09); transform: translateY(-1px); }
        .study-card-continue:hover { background: #132A40 !important; }
        .study-card-export:hover { background: #EEE0BF !important; }
      `}</style>

      {/* Top row: logo + lang badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#F4F6F8',
          border: '1px solid #E8ECF1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {study.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={study.logo_url} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4BFCB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Lang badge */}
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 99,
            background: study.language === 'ar' ? '#D8F1EE' : '#EEF3F7',
            color: study.language === 'ar' ? '#0A6E66' : '#305F86',
          }}>
            {study.language === 'ar' ? 'عربي' : 'EN'}
          </span>
          {/* Status badge */}
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: 99,
            background: statusColor.bg,
            color: statusColor.text,
          }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Name + date */}
      <h3 style={{
        fontFamily: 'var(--font-display), "IBM Plex Serif", serif',
        fontSize: 17,
        fontWeight: 500,
        color: '#0D1B2A',
        marginBottom: 4,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {study.startup_name ?? 'Untitled study'}
      </h3>
      <p style={{ fontSize: 12, color: '#8795A6', marginBottom: 20 }}>
        Updated {formatDate(study.updated_at)}
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: 20, marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <span style={{ fontSize: 12, color: '#8795A6' }}>Progress</span>
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 12,
            color: pct === 100 ? '#11724E' : '#647183',
            fontWeight: pct === 100 ? 600 : 400,
          }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 4, background: '#F4F6F8', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 99,
            background: pct === 100 ? '#0D9488' : '#C9A84C',
            transition: 'width 600ms cubic-bezier(0.22,0.61,0.36,1)',
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Link
          href={`/study/${study.id}`}
          className="study-card-continue"
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 500,
            color: '#EEF3F7',
            background: '#0D1B2A',
            borderRadius: 8,
            padding: '9px 0',
            textDecoration: 'none',
            transition: 'background 140ms',
          }}
        >
          {pct === 100 ? 'Review' : 'Continue'}
        </Link>
        <Link
          href={`/study/${study.id}/export`}
          className="study-card-export"
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 500,
            color: '#8A6F26',
            background: '#F6EEDB',
            borderRadius: 8,
            padding: '9px 0',
            textDecoration: 'none',
            transition: 'background 140ms',
          }}
        >
          Export PDF
        </Link>
      </div>
    </div>
  )
}

// ── New study card (grid item) ─────────────────────────────────────────────
function NewStudyCard() {
  return (
    <Link
      href="/study/new"
      style={{
        background: 'transparent',
        border: '1.5px dashed #D4DBE3',
        borderRadius: 16,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        textDecoration: 'none',
        minHeight: 220,
        transition: 'border-color 200ms, background 200ms',
      }}
      className="new-study-card"
    >
      <style>{`
        .new-study-card:hover { border-color: #C9A84C !important; background: rgba(201,168,76,0.04) !important; }
        .new-study-card:hover .new-study-icon { background: #F6EEDB !important; color: #8A6F26 !important; }
      `}</style>
      <div
        className="new-study-icon"
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#F4F6F8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8795A6',
          transition: 'background 200ms, color 200ms',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#36404D', marginBottom: 3 }}>New study</p>
        <p style={{ fontSize: 12, color: '#8795A6' }}>Arabic or English</p>
      </div>
    </Link>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E8ECF1',
      borderRadius: 20,
      padding: '72px 40px',
      textAlign: 'center',
      maxWidth: 560,
      margin: '0 auto',
    }}>
      {/* Icon */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: '#EEF3F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <svg width="28" height="28" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
          <path
            d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
            stroke="#7BA0BF"
            strokeWidth="7.8"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display), "IBM Plex Serif", serif',
        fontSize: 22,
        fontWeight: 500,
        color: '#0D1B2A',
        letterSpacing: '-0.015em',
        marginBottom: 10,
      }}>
        Your first study starts here
      </h2>
      <p style={{ fontSize: 14, color: '#647183', lineHeight: 1.65, maxWidth: 360, margin: '0 auto 32px' }}>
        Answer one card at a time. When you&apos;re done, Wuduh assembles your answers into a
        feasibility study you&apos;ll be proud to send to investors.
      </p>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 0,
        marginBottom: 32,
        background: '#F4F6F8',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {[
          { num: '52', label: 'cards' },
          { num: '8', label: 'sections' },
          { num: '2', label: 'languages' },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex: 1,
            padding: '16px 8px',
            borderRight: i < 2 ? '1px solid #E8ECF1' : undefined,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display), serif',
              fontSize: 24,
              fontWeight: 500,
              color: '#0D1B2A',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginBottom: 4,
            }}>
              {s.num}<span style={{ color: '#C9A84C' }}>.</span>
            </div>
            <div style={{ fontSize: 11, color: '#8795A6', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono), monospace' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/study/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#0D1B2A',
          color: '#EEF3F7',
          fontSize: 14,
          fontWeight: 500,
          borderRadius: 9,
          padding: '12px 24px',
          textDecoration: 'none',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v16m8-8H4" />
        </svg>
        Start your first study
      </Link>
    </div>
  )
}
