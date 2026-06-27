'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shell, useJson, act, fmt, n, formatDate, StatusPill, btnGhost, btnDanger, thStyle, tdStyle, Loading, ErrorCard } from '../_shared'

type StudyRow = {
  id: string; startupName: string | null; language: string; status: string
  completionPercentage: number; createdAt: string; updatedAt: string
  email: string | null; userId: string | null; exports: number
}
interface Resp { studies: StudyRow[]; total: number }

export default function StudiesClient() {
  const [q, setQ] = useState('')
  const [aq, setAq] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'complete' | 'exported'>('all')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { const t = setTimeout(() => setAq(q), 300); return () => clearTimeout(t) }, [q])
  const { data, error, loading, reload } = useJson<Resp>(`/api/admin/studies?q=${encodeURIComponent(aq)}&status=${status}&limit=100`)

  async function run(id: string, method: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(id)
    const ok = await act(`/api/admin/studies/${id}`, method, body)
    setBusy(null)
    if (ok) reload(); else alert('That action failed.')
  }

  const studies = data?.studies || []

  return (
    <Shell active="studies" eyebrow="Back office" title="Studies" subtitle={data ? `${fmt(data.total)} total` : 'Every feasibility study across all founders'}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input className="wb-input" style={{ maxWidth: 320 }} placeholder="Search by startup or owner email…" value={q} onChange={e => setQ(e.target.value)} />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'draft', 'complete', 'exported'] as const).map(f => (
            <button key={f} onClick={() => setStatus(f)} style={{
              ...btnGhost, textTransform: 'capitalize',
              borderColor: status === f ? 'var(--gold-500)' : 'var(--border-default)',
              color: status === f ? 'var(--gold-700)' : 'var(--text-muted)',
              background: status === f ? 'var(--gold-100)' : 'transparent',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {error ? <ErrorCard error={error} /> : loading && !data ? <Loading /> : (
        <div className="wb-card" style={{ padding: 8 }}>
          <div className="wb-tablewrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead><tr>{['Study', 'Owner', 'Status', 'Completion', 'Exports', 'Updated', ''].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {studies.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No studies found.</td></tr>
                ) : studies.map(s => (
                  <tr key={s.id} className="wb-row" style={{ borderTop: '1px solid var(--border-default)', opacity: busy === s.id ? 0.5 : 1 }}>
                    <td style={tdStyle}>
                      {s.startupName || <span style={{ color: 'var(--text-faint)' }}>Untitled</span>}
                      <span style={{ fontSize: 10, color: 'var(--text-hint)', fontFamily: 'var(--font-mono), monospace', marginLeft: 6 }}>{s.language.toUpperCase()}</span>
                    </td>
                    <td style={tdStyle}>
                      {s.userId
                        ? <Link href={`/admin/users/${s.userId}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{s.email || '—'}</Link>
                        : (s.email || '—')}
                    </td>
                    <td style={tdStyle}><StatusPill status={s.status} /></td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{n(s.completionPercentage)}%</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(s.exports))}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDate(s.updatedAt)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <select defaultValue={s.status} disabled={busy === s.id} onChange={e => run(s.id, 'PATCH', { status: e.target.value })}
                        className="wb-input" style={{ width: 'auto', display: 'inline-block', padding: '5px 8px', fontSize: 12, marginRight: 6 }}>
                        <option value="draft">Draft</option>
                        <option value="complete">Complete</option>
                        <option value="exported">Exported</option>
                      </select>
                      <button style={btnDanger} disabled={busy === s.id}
                        onClick={() => run(s.id, 'DELETE', undefined, 'Delete this study and its answers and exports? This cannot be undone.')}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Shell>
  )
}
