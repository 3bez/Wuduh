import { requireAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'
import { ALL_CARDS } from '@/lib/cards/loader'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { logoutAdmin } from './actions'

// Back office must always reflect live data — never cache.
export const dynamic = 'force-dynamic'

// ── helpers ────────────────────────────────────────────────────────
function n(v: unknown): number {
  const x = typeof v === 'string' ? parseInt(v, 10) : (v as number)
  return Number.isFinite(x) ? x : 0
}
function fmt(v: number): string {
  return v.toLocaleString('en-US')
}
function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}
function formatDateTime(d: string): string {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// card id → short label, for the drop-off panel
const CARD_LABEL = new Map<string, string>(
  ALL_CARDS.map(c => [c.id, c.en?.category || c.en?.prompt || c.id])
)

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="var(--text-primary)" strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default async function AdminPage() {
  await requireAdmin()

  // ── one round-trip per logical group, run in parallel ──
  const [
    overview,
    byStatus,
    studiesByLang,
    exportsByLang,
    daily,
    skippedCards,
    recentUsers,
    recentExports,
  ] = await Promise.all([
    queryOne<Record<string, unknown>>(`
      SELECT
        (SELECT count(*) FROM users)                                                  AS total_users,
        (SELECT count(*) FROM users WHERE "emailVerified")                            AS verified_users,
        (SELECT count(*) FROM users WHERE "createdAt" > now() - interval '7 days')    AS users_7d,
        (SELECT count(*) FROM users WHERE "createdAt" > now() - interval '30 days')   AS users_30d,
        (SELECT count(*) FROM studies)                                                AS total_studies,
        (SELECT count(*) FROM studies WHERE "completionPercentage" = 100)             AS completed_studies,
        (SELECT coalesce(round(avg("completionPercentage")), 0) FROM studies)         AS avg_completion,
        (SELECT count(*) FROM exports)                                                AS total_exports,
        (SELECT count(*) FROM exports WHERE "createdAt" > now() - interval '30 days') AS exports_30d,
        (SELECT count(*) FROM sessions WHERE "expiresAt" > now())                     AS active_sessions,
        (SELECT count(DISTINCT "userId") FROM studies)                                AS users_with_study,
        (SELECT count(DISTINCT "userId") FROM exports)                                AS users_with_export
    `),
    query<{ status: string; n: string }>(`SELECT status, count(*)::int AS n FROM studies GROUP BY status`),
    query<{ language: string; n: string }>(`SELECT language, count(*)::int AS n FROM studies GROUP BY language`),
    query<{ language: string; n: string }>(`SELECT language, count(*)::int AS n FROM exports GROUP BY language`),
    query<{ day: string; label: string; signups: string; studies: string; exports: string }>(`
      WITH days AS (
        SELECT generate_series(
          date_trunc('day', now()) - interval '13 days',
          date_trunc('day', now()),
          interval '1 day'
        ) AS day
      )
      SELECT
        to_char(d.day, 'YYYY-MM-DD') AS day,
        to_char(d.day, 'DD Mon')     AS label,
        (SELECT count(*) FROM users   u WHERE date_trunc('day', u."createdAt") = d.day)::int AS signups,
        (SELECT count(*) FROM studies s WHERE date_trunc('day', s."createdAt") = d.day)::int AS studies,
        (SELECT count(*) FROM exports e WHERE date_trunc('day', e."createdAt") = d.day)::int AS exports
      FROM days d
      ORDER BY d.day
    `),
    query<{ cardId: string; skipped: string; total: string }>(`
      SELECT "cardId",
        count(*) FILTER (WHERE status = 'skipped')::int AS skipped,
        count(*)::int AS total
      FROM answers
      GROUP BY "cardId"
      HAVING count(*) FILTER (WHERE status = 'skipped') > 0
      ORDER BY skipped DESC, total DESC
      LIMIT 12
    `),
    query<{ id: string; email: string; emailVerified: boolean; name: string | null; createdAt: string; studies: string; exports: string }>(`
      SELECT u.id, u.email, u."emailVerified", u.name, u."createdAt",
        (SELECT count(*) FROM studies s WHERE s."userId" = u.id)::int AS studies,
        (SELECT count(*) FROM exports e WHERE e."userId" = u.id)::int AS exports
      FROM users u
      ORDER BY u."createdAt" DESC
      LIMIT 12
    `),
    query<{ id: string; language: string; completionSnapshot: number; createdAt: string; startupName: string | null; email: string | null }>(`
      SELECT e.id, e.language, e."completionSnapshot", e."createdAt",
        s."startupName", u.email
      FROM exports e
      LEFT JOIN studies s ON s.id = e."studyId"
      LEFT JOIN users u   ON u.id = e."userId"
      ORDER BY e."createdAt" DESC
      LIMIT 12
    `),
  ])

  const o = overview ?? {}
  const totalUsers      = n(o.total_users)
  const verifiedUsers   = n(o.verified_users)
  const users7d         = n(o.users_7d)
  const totalStudies    = n(o.total_studies)
  const completedStudies = n(o.completed_studies)
  const avgCompletion   = n(o.avg_completion)
  const totalExports    = n(o.total_exports)
  const exports30d      = n(o.exports_30d)
  const activeSessions  = n(o.active_sessions)
  const usersWithStudy  = n(o.users_with_study)
  const usersWithExport = n(o.users_with_export)

  const statusMap = Object.fromEntries(byStatus.map(r => [r.status, n(r.n)]))
  const draft     = statusMap['draft'] ?? 0
  const complete  = statusMap['complete'] ?? 0
  const exported  = statusMap['exported'] ?? 0

  const langMap     = Object.fromEntries(studiesByLang.map(r => [r.language, n(r.n)]))
  const expLangMap  = Object.fromEntries(exportsByLang.map(r => [r.language, n(r.n)]))

  const sumSignups = daily.reduce((a, d) => a + n(d.signups), 0)
  const sumStudies = daily.reduce((a, d) => a + n(d.studies), 0)
  const sumExports = daily.reduce((a, d) => a + n(d.exports), 0)

  const maxSkip = Math.max(1, ...skippedCards.map(c => n(c.skipped)))

  // funnel
  const funnel = [
    { label: 'Verified users', value: verifiedUsers },
    { label: 'Started a study', value: usersWithStudy },
    { label: 'Reached 100%', value: completedStudies },
    { label: 'Exported a PDF', value: usersWithExport },
  ]
  const funnelTop = Math.max(1, verifiedUsers, totalUsers)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <style>{`
        .ad-card { background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 14px; }
        .ad-row:hover { background: var(--bg-subtle); }
        .ad-link:hover { opacity: 0.85; }
        @media (max-width: 900px) { .ad-3col { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          .ad-header-inner { padding: 0 16px !important; height: 52px !important; }
          .ad-email { display: none !important; }
          .ad-kpi { grid-template-columns: repeat(2, 1fr) !important; }
          .ad-tablewrap { overflow-x: auto; }
        }
      `}</style>

      {/* Header */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="ad-header-inner" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoMark />
            <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Wuduh</span>
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '3px 8px', borderRadius: 6 }}>Admin</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/" className="ad-link" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>View site ↗</a>
            <ThemeToggle />
            <div style={{ width: 1, height: 16, background: 'var(--border-default)' }} />
            <form action={logoutAdmin}>
              <button type="submit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', padding: 0, fontFamily: 'inherit' }}>Log out</button>
            </form>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-500)', marginBottom: 10 }}>Back office</p>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 30, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>
            Everything at a glance
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Live across users, studies, and exports · as of {formatDateTime(new Date().toISOString())}
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: 'var(--text-faint)', marginBottom: 24, padding: '8px 12px', border: '1px dashed var(--border-strong)', borderRadius: 8 }}>
          debug · users {totalUsers} · studies {totalStudies} · exports {totalExports} · rows[ status {byStatus.length} · lang {studiesByLang.length} · daily {daily.length} · skipped {skippedCards.length} · recentUsers {recentUsers.length} · recentExports {recentExports.length} ]
        </div>

        {/* KPI grid */}
        <div className="ad-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
          <Stat label="Total users" value={fmt(totalUsers)} sub={`${fmt(users7d)} new this week`} />
          <Stat label="Verified" value={fmt(verifiedUsers)} sub={`${pct(verifiedUsers, totalUsers)}% of users`} accent="teal" />
          <Stat label="Active sessions" value={fmt(activeSessions)} sub="signed in now" />
          <Stat label="Total studies" value={fmt(totalStudies)} sub={`${fmt(completedStudies)} completed`} />
        </div>
        <div className="ad-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          <Stat label="Avg completion" value={`${avgCompletion}%`} sub="across all studies" accent="gold" />
          <Stat label="Total exports" value={fmt(totalExports)} sub={`${fmt(exports30d)} in last 30 days`} accent="gold" />
          <Stat label="Studies / user" value={totalUsers ? (totalStudies / totalUsers).toFixed(1) : '0'} sub="average" />
          <Stat label="Export rate" value={`${pct(usersWithExport, usersWithStudy)}%`} sub="of founders who started" accent="teal" />
        </div>

        {/* Funnel + Activity */}
        <div className="ad-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginBottom: 32 }}>
          <Panel title="Conversion funnel" subtitle="Unique founders at each step">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {funnel.map((f, i) => {
                const prev = i === 0 ? f.value : funnel[i - 1].value
                const stepConv = i === 0 ? null : pct(f.value, prev)
                return (
                  <div key={f.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.label}</span>
                      <span style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(f.value)}</span>
                        {stepConv !== null && (
                          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)' }}>{stepConv}%</span>
                        )}
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(2, pct(f.value, funnelTop))}%`, background: i === funnel.length - 1 ? 'var(--teal-500)' : 'var(--gold-500)', borderRadius: 99 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel title="Last 14 days" subtitle="Daily signups, studies, and exports">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              <MiniBars title="Signups" total={sumSignups} values={daily.map(d => n(d.signups))} labels={daily.map(d => d.label)} color="var(--gold-500)" />
              <MiniBars title="Studies" total={sumStudies} values={daily.map(d => n(d.studies))} labels={daily.map(d => d.label)} color="var(--teal-500)" />
              <MiniBars title="Exports" total={sumExports} values={daily.map(d => n(d.exports))} labels={daily.map(d => d.label)} color="var(--navy-700)" />
            </div>
          </Panel>
        </div>

        {/* Breakdowns */}
        <div className="ad-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          <Panel title="Studies by status">
            <DistRows rows={[
              { label: 'Draft', value: draft, color: 'var(--text-faint)' },
              { label: 'Complete', value: complete, color: 'var(--gold-500)' },
              { label: 'Exported', value: exported, color: 'var(--teal-500)' },
            ]} total={totalStudies} />
          </Panel>
          <Panel title="Studies by language">
            <DistRows rows={[
              { label: 'English', value: n(langMap['en']), color: 'var(--navy-700)' },
              { label: 'Arabic', value: n(langMap['ar']), color: 'var(--gold-500)' },
            ]} total={totalStudies} />
          </Panel>
          <Panel title="Exports by language">
            <DistRows rows={[
              { label: 'English', value: n(expLangMap['en']), color: 'var(--navy-700)' },
              { label: 'Arabic', value: n(expLangMap['ar']), color: 'var(--gold-500)' },
            ]} total={totalExports} />
          </Panel>
        </div>

        {/* Card drop-off */}
        <Panel title="Most-skipped cards" subtitle="Where founders leave a card blank — candidates to simplify or reword" style={{ marginBottom: 32 }}>
          {skippedCards.length === 0 ? (
            <Empty text="No skipped cards recorded yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {skippedCards.map(c => {
                const skip = n(c.skipped)
                return (
                  <div key={c.cardId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 180, flexShrink: 0, fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)', marginRight: 6 }}>{c.cardId}</span>
                      {CARD_LABEL.get(c.cardId) ?? c.cardId}
                    </div>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct(skip, maxSkip)}%`, background: 'var(--danger-500)', borderRadius: 99 }} />
                    </div>
                    <div style={{ width: 96, flexShrink: 0, textAlign: 'right', fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                      {fmt(skip)} skips
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>

        {/* Recent users */}
        <Panel title="Recent signups" subtitle="Newest 12 accounts" style={{ marginBottom: 32 }}>
          <div className="ad-tablewrap">
            <Table head={['User', 'Status', 'Studies', 'Exports', 'Joined']}>
              {recentUsers.length === 0 ? (
                <EmptyRow cols={5} text="No users yet." />
              ) : recentUsers.map(u => (
                <tr key={u.id} className="ad-row" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <Td>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{u.email}</div>
                    {u.name && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u.name}</div>}
                  </Td>
                  <Td>
                    {u.emailVerified
                      ? <Pill text="Verified" bg="var(--success-100)" fg="var(--success-500)" />
                      : <Pill text="Unverified" bg="var(--warning-100)" fg="var(--warning-500)" />}
                  </Td>
                  <Td mono>{fmt(n(u.studies))}</Td>
                  <Td mono>{fmt(n(u.exports))}</Td>
                  <Td muted>{formatDate(u.createdAt)}</Td>
                </tr>
              ))}
            </Table>
          </div>
        </Panel>

        {/* Recent exports */}
        <Panel title="Recent exports" subtitle="Newest 12 PDF exports">
          <div className="ad-tablewrap">
            <Table head={['Study', 'Founder', 'Lang', 'Completion', 'When']}>
              {recentExports.length === 0 ? (
                <EmptyRow cols={5} text="No exports yet." />
              ) : recentExports.map(e => (
                <tr key={e.id} className="ad-row" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <Td>{e.startupName || <span style={{ color: 'var(--text-faint)' }}>Untitled</span>}</Td>
                  <Td muted>{e.email ?? '—'}</Td>
                  <Td>
                    <Pill text={e.language === 'ar' ? 'عربي' : 'EN'}
                      bg={e.language === 'ar' ? 'var(--teal-100)' : 'var(--bg-subtle)'}
                      fg={e.language === 'ar' ? 'var(--teal-700)' : 'var(--text-faint)'} />
                  </Td>
                  <Td mono>{n(e.completionSnapshot)}%</Td>
                  <Td muted>{formatDateTime(e.createdAt)}</Td>
                </tr>
              ))}
            </Table>
          </div>
        </Panel>
      </main>
    </div>
  )
}

// ── presentational components ──────────────────────────────────────
function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'gold' | 'teal' }) {
  const valColor = accent === 'gold' ? 'var(--gold-700)' : accent === 'teal' ? 'var(--teal-500)' : 'var(--text-primary)'
  return (
    <div className="ad-card" style={{ padding: '18px 20px' }}>
      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 30, fontWeight: 600, color: valColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 8 }}>{sub}</div>}
    </div>
  )
}

function Panel({ title, subtitle, children, style }: { title: string; subtitle?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section className="ad-card" style={{ padding: 22, ...style }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 3 }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function MiniBars({ title, total, values, labels, color }: { title: string; total: number; values: number[]; labels: string[]; color: string }) {
  const max = Math.max(1, ...values)
  const W = 160, H = 46, gap = 2
  const bw = (W - gap * (values.length - 1)) / values.length
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(total)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" style={{ display: 'block', height: 46 }} aria-hidden="true">
        {values.map((v, i) => {
          const h = v === 0 ? 1.5 : Math.max(2, (v / max) * (H - 2))
          return <rect key={i} x={i * (bw + gap)} y={H - h} width={bw} height={h} rx={1} fill={v === 0 ? 'var(--border-default)' : color} />
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 9, color: 'var(--text-hint)', fontFamily: 'var(--font-mono), monospace' }}>{labels[0]}</span>
        <span style={{ fontSize: 9, color: 'var(--text-hint)', fontFamily: 'var(--font-mono), monospace' }}>{labels[labels.length - 1]}</span>
      </div>
    </div>
  )
}

function DistRows({ rows, total }: { rows: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map(r => (
        <div key={r.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.label}</span>
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: 'var(--text-muted)' }}>
              {fmt(r.value)} <span style={{ color: 'var(--text-hint)' }}>· {pct(r.value, total)}%</span>
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(r.value > 0 ? 2 : 0, pct(r.value, total))}%`, background: r.color, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
      <thead>
        <tr>
          {head.map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px', fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function Td({ children, mono, muted }: { children: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return (
    <td style={{ padding: '12px', fontSize: 13, verticalAlign: 'top',
      fontFamily: mono ? 'var(--font-mono), monospace' : 'var(--font-sans), sans-serif',
      color: muted ? 'var(--text-faint)' : 'var(--text-secondary)' }}>
      {children}
    </td>
  )
}

function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 99, background: bg, color: fg, whiteSpace: 'nowrap' }}>{text}</span>
  )
}

function Empty({ text }: { text: string }) {
  return <p style={{ fontSize: 13, color: 'var(--text-faint)', padding: '8px 0' }}>{text}</p>
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr><td colSpan={cols} style={{ padding: '20px 12px', fontSize: 13, color: 'var(--text-faint)', textAlign: 'center' }}>{text}</td></tr>
  )
}
