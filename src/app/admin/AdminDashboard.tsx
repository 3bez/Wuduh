'use client'

import { Shell, useJson, n, fmt, pct, formatDate, formatDateTime, Pill, VerifiedPill, Loading, ErrorCard, thStyle, tdStyle } from './_shared'

type Row = Record<string, unknown>
interface Stats {
  overview: Record<string, unknown>
  byStatus: Row[]; studiesByLang: Row[]; exportsByLang: Row[]
  daily: Row[]; skippedCards: Row[]; recentUsers: Row[]; recentExports: Row[]
}

export default function AdminDashboard() {
  const { data, error } = useJson<Stats>('/api/admin/stats')
  return (
    <Shell active="overview" eyebrow="Back office" title="Everything at a glance"
      subtitle={`Live across users, studies, and exports${data ? ` · as of ${formatDateTime(new Date().toISOString())}` : ''}`}>
      {error ? <ErrorCard error={error} /> : !data ? <Loading /> : <Dashboard data={data} />}
    </Shell>
  )
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'gold' | 'teal' }) {
  const valColor = accent === 'gold' ? 'var(--gold-700)' : accent === 'teal' ? 'var(--teal-500)' : 'var(--text-primary)'
  return (
    <div className="wb-card" style={{ padding: '18px 20px' }}>
      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 30, fontWeight: 600, color: valColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 8 }}>{sub}</div>}
    </div>
  )
}

function Panel({ title, subtitle, children, style }: { title: string; subtitle?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section className="wb-card" style={{ padding: 22, ...style }}>
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
  const bw = (W - gap * (values.length - 1)) / Math.max(1, values.length)
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

function Dashboard({ data }: { data: Stats }) {
  const o = data.overview ?? {}
  const totalUsers = n(o.total_users), verifiedUsers = n(o.verified_users), users7d = n(o.users_7d)
  const totalStudies = n(o.total_studies), completedStudies = n(o.completed_studies), avgCompletion = n(o.avg_completion)
  const totalExports = n(o.total_exports), exports30d = n(o.exports_30d), activeSessions = n(o.active_sessions)
  const usersWithStudy = n(o.users_with_study), usersWithExport = n(o.users_with_export)

  const statusMap = Object.fromEntries((data.byStatus || []).map(r => [String(r.status), n(r.n)]))
  const draft = statusMap['draft'] ?? 0, complete = statusMap['complete'] ?? 0, exported = statusMap['exported'] ?? 0
  const langMap = Object.fromEntries((data.studiesByLang || []).map(r => [String(r.language), n(r.n)]))
  const expLangMap = Object.fromEntries((data.exportsByLang || []).map(r => [String(r.language), n(r.n)]))

  const daily = data.daily || []
  const sumSignups = daily.reduce((a, d) => a + n(d.signups), 0)
  const sumStudies = daily.reduce((a, d) => a + n(d.studies), 0)
  const sumExports = daily.reduce((a, d) => a + n(d.exports), 0)
  const skippedCards = data.skippedCards || []
  const maxSkip = Math.max(1, ...skippedCards.map(c => n(c.skipped)))
  const recentUsers = data.recentUsers || []
  const recentExports = data.recentExports || []

  const funnel = [
    { label: 'Verified users', value: verifiedUsers },
    { label: 'Started a study', value: usersWithStudy },
    { label: 'Reached 100%', value: completedStudies },
    { label: 'Exported a PDF', value: usersWithExport },
  ]
  const funnelTop = Math.max(1, verifiedUsers, totalUsers)

  return (
    <>
      <div className="wb-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
        <Stat label="Total users" value={fmt(totalUsers)} sub={`${fmt(users7d)} new this week`} />
        <Stat label="Verified" value={fmt(verifiedUsers)} sub={`${pct(verifiedUsers, totalUsers)}% of users`} accent="teal" />
        <Stat label="Active sessions" value={fmt(activeSessions)} sub="signed in now" />
        <Stat label="Total studies" value={fmt(totalStudies)} sub={`${fmt(completedStudies)} completed`} />
      </div>
      <div className="wb-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        <Stat label="Avg completion" value={`${avgCompletion}%`} sub="across all studies" accent="gold" />
        <Stat label="Total exports" value={fmt(totalExports)} sub={`${fmt(exports30d)} in last 30 days`} accent="gold" />
        <Stat label="Studies / user" value={totalUsers ? (totalStudies / totalUsers).toFixed(1) : '0'} sub="average" />
        <Stat label="Export rate" value={`${pct(usersWithExport, usersWithStudy)}%`} sub="of founders who started" accent="teal" />
      </div>

      <div className="wb-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginBottom: 32 }}>
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
                      {stepConv !== null && <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)' }}>{stepConv}%</span>}
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
            <MiniBars title="Signups" total={sumSignups} values={daily.map(d => n(d.signups))} labels={daily.map(d => String(d.label))} color="var(--gold-500)" />
            <MiniBars title="Studies" total={sumStudies} values={daily.map(d => n(d.studies))} labels={daily.map(d => String(d.label))} color="var(--teal-500)" />
            <MiniBars title="Exports" total={sumExports} values={daily.map(d => n(d.exports))} labels={daily.map(d => String(d.label))} color="var(--navy-700)" />
          </div>
        </Panel>
      </div>

      <div className="wb-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
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

      <Panel title="Most-skipped cards" subtitle="Where founders leave a card blank" style={{ marginBottom: 32 }}>
        {skippedCards.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', padding: '8px 0' }}>No skipped cards recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skippedCards.map((c, i) => {
              const skip = n(c.skipped)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 180, flexShrink: 0, fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)', marginRight: 6 }}>{String(c.cardId)}</span>
                    {String(c.label ?? c.cardId)}
                  </div>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct(skip, maxSkip)}%`, background: 'var(--danger-500)', borderRadius: 99 }} />
                  </div>
                  <div style={{ width: 96, flexShrink: 0, textAlign: 'right', fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--text-muted)' }}>{fmt(skip)} skips</div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      <Panel title="Recent signups" subtitle="Newest 12 accounts" style={{ marginBottom: 32 }}>
        <div className="wb-tablewrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
            <thead><tr>{['User', 'Status', 'Studies', 'Exports', 'Joined'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '20px 12px', fontSize: 13, color: 'var(--text-faint)', textAlign: 'center' }}>No users yet.</td></tr>
              ) : recentUsers.map((u, i) => (
                <tr key={i} className="wb-row" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{String(u.email ?? '')}</div>
                    {u.name ? <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{String(u.name)}</div> : null}
                  </td>
                  <td style={tdStyle}><VerifiedPill verified={!!u.emailVerified} /></td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(u.studies))}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(u.exports))}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDate(String(u.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recent exports" subtitle="Newest 12 PDF exports">
        <div className="wb-tablewrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
            <thead><tr>{['Study', 'Founder', 'Lang', 'Completion', 'When'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {recentExports.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '20px 12px', fontSize: 13, color: 'var(--text-faint)', textAlign: 'center' }}>No exports yet.</td></tr>
              ) : recentExports.map((e, i) => (
                <tr key={i} className="wb-row" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <td style={tdStyle}>{e.startupName ? String(e.startupName) : <span style={{ color: 'var(--text-faint)' }}>Untitled</span>}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{e.email ? String(e.email) : '—'}</td>
                  <td style={tdStyle}><Pill text={e.language === 'ar' ? 'عربي' : 'EN'} bg={e.language === 'ar' ? 'var(--teal-100)' : 'var(--bg-subtle)'} fg={e.language === 'ar' ? 'var(--teal-700)' : 'var(--text-faint)'} /></td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{n(e.completionSnapshot)}%</td>
                  <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDateTime(String(e.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
