'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shell, useJson, act, fmt, n, formatDate, VerifiedPill, btnGhost, btnDanger, thStyle, tdStyle, Loading, ErrorCard } from '../_shared'

type UserRow = {
  id: string; email: string; name: string | null; emailVerified: boolean
  createdAt: string; studies: number; exports: number; lastActive: string | null
}
interface Resp { users: UserRow[]; total: number }

export default function UsersClient() {
  const [q, setQ] = useState('')
  const [aq, setAq] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { const t = setTimeout(() => setAq(q), 300); return () => clearTimeout(t) }, [q])
  const { data, error, loading, reload } = useJson<Resp>(`/api/admin/users?q=${encodeURIComponent(aq)}&filter=${filter}&limit=100`)

  async function run(id: string, method: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(id)
    const ok = await act(`/api/admin/users/${id}`, method, body)
    setBusy(null)
    if (ok) reload()
    else alert('That action failed. Please try again.')
  }

  const users = data?.users || []

  return (
    <Shell active="users" eyebrow="Back office" title="Users" subtitle={data ? `${fmt(data.total)} total` : 'Manage everyone who has signed up'}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <input className="wb-input" style={{ maxWidth: 320 }} placeholder="Search by email or name…" value={q} onChange={e => setQ(e.target.value)} />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'verified', 'unverified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...btnGhost, textTransform: 'capitalize',
              borderColor: filter === f ? 'var(--gold-500)' : 'var(--border-default)',
              color: filter === f ? 'var(--gold-700)' : 'var(--text-muted)',
              background: filter === f ? 'var(--gold-100)' : 'transparent',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {error ? <ErrorCard error={error} /> : loading && !data ? <Loading /> : (
        <div className="wb-card" style={{ padding: 8 }}>
          <div className="wb-tablewrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead><tr>{['User', 'Status', 'Studies', 'Exports', 'Joined', ''].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="wb-row" style={{ borderTop: '1px solid var(--border-default)', opacity: busy === u.id ? 0.5 : 1 }}>
                    <td style={tdStyle}>
                      <Link href={`/admin/users/${u.id}`} style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none', fontSize: 13 }}>{u.email}</Link>
                      {u.name && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u.name}</div>}
                    </td>
                    <td style={tdStyle}><VerifiedPill verified={u.emailVerified} /></td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(u.studies))}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(u.exports))}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link href={`/admin/users/${u.id}`} style={{ ...btnGhost, textDecoration: 'none', marginRight: 6 }}>View</Link>
                      <button style={{ ...btnGhost, marginRight: 6 }} disabled={busy === u.id}
                        onClick={() => run(u.id, 'PATCH', { action: u.emailVerified ? 'unverify' : 'verify' })}>
                        {u.emailVerified ? 'Unverify' : 'Verify'}
                      </button>
                      <button style={btnDanger} disabled={busy === u.id}
                        onClick={() => run(u.id, 'DELETE', undefined, `Delete ${u.email}? This permanently removes their account, studies, and exports. This cannot be undone.`)}>
                        Delete
                      </button>
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
