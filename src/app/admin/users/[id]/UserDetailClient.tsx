'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, useJson, act, fmt, n, formatDate, formatDateTime, VerifiedPill, StatusPill, btnGhost, btnDanger, thStyle, tdStyle, Loading, ErrorCard } from '../../_shared'

type User = { id: string; email: string; name: string | null; emailVerified: boolean; createdAt: string; updatedAt: string }
type Study = { id: string; startupName: string | null; language: string; status: string; completionPercentage: number; createdAt: string; updatedAt: string; exports: number }
type Export = { id: string; language: string; completionSnapshot: number; pdf_url: string | null; createdAt: string; startupName: string | null }
interface Resp { user: User; studies: Study[]; exports: Export[] }

export default function UserDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { data, error, loading, reload } = useJson<Resp>(`/api/admin/users/${id}`)
  const [busy, setBusy] = useState(false)

  async function userAct(method: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(true)
    const ok = await act(`/api/admin/users/${id}`, method, body)
    setBusy(false)
    if (!ok) { alert('That action failed.'); return }
    if (method === 'DELETE') router.push('/admin/users')
    else reload()
  }
  async function studyAct(sid: string, method: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    const ok = await act(`/api/admin/studies/${sid}`, method, body)
    if (ok) reload(); else alert('That action failed.')
  }
  async function exportAct(eid: string, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return
    const ok = await act(`/api/admin/exports/${eid}`, 'DELETE')
    if (ok) reload(); else alert('That action failed.')
  }

  if (error) return <Shell active="users" title="User"><ErrorCard error={error} /></Shell>
  if (loading && !data) return <Shell active="users" title="User"><Loading /></Shell>
  if (!data) return <Shell active="users" title="User"><ErrorCard error="Not found" /></Shell>

  const { user, studies, exports } = data

  return (
    <Shell active="users" eyebrow="Back office · user" title={user.email}
      subtitle={<Link href="/admin/users" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← All users</Link>}>

      <div className="wb-card" style={{ padding: 22, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name || user.email}</span>
            <VerifiedPill verified={user.emailVerified} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
            Joined {formatDate(user.createdAt)} · ID <span style={{ fontFamily: 'var(--font-mono), monospace' }}>{user.id}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnGhost} disabled={busy} onClick={() => userAct('PATCH', { action: user.emailVerified ? 'unverify' : 'verify' })}>
            {user.emailVerified ? 'Unverify email' : 'Verify email'}
          </button>
          <button style={btnDanger} disabled={busy} onClick={() => userAct('DELETE', undefined, `Delete ${user.email}? This permanently removes their account, studies, and exports. This cannot be undone.`)}>
            Delete user
          </button>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Studies ({studies.length})</h2>
      <div className="wb-card" style={{ padding: 8, marginBottom: 28 }}>
        <div className="wb-tablewrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead><tr>{['Study', 'Status', 'Completion', 'Exports', 'Updated', ''].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {studies.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No studies.</td></tr>
              ) : studies.map(s => (
                <tr key={s.id} className="wb-row" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <td style={tdStyle}>{s.startupName || <span style={{ color: 'var(--text-faint)' }}>Untitled</span>} <span style={{ fontSize: 10, color: 'var(--text-hint)', fontFamily: 'var(--font-mono), monospace' }}>{s.language.toUpperCase()}</span></td>
                  <td style={tdStyle}><StatusPill status={s.status} /></td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{n(s.completionPercentage)}%</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(s.exports))}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDate(s.updatedAt)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <select defaultValue={s.status} onChange={e => studyAct(s.id, 'PATCH', { status: e.target.value })}
                      className="wb-input" style={{ width: 'auto', display: 'inline-block', padding: '5px 8px', fontSize: 12, marginRight: 6 }}>
                      <option value="draft">Draft</option>
                      <option value="complete">Complete</option>
                      <option value="exported">Exported</option>
                    </select>
                    <button style={btnDanger} onClick={() => studyAct(s.id, 'DELETE', undefined, `Delete this study and its answers and exports? This cannot be undone.`)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Exports ({exports.length})</h2>
      <div className="wb-card" style={{ padding: 8 }}>
        <div className="wb-tablewrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead><tr>{['Study', 'Lang', 'Completion', 'When', ''].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {exports.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No exports.</td></tr>
              ) : exports.map(e => (
                <tr key={e.id} className="wb-row" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <td style={tdStyle}>{e.startupName || <span style={{ color: 'var(--text-faint)' }}>Untitled</span>}</td>
                  <td style={tdStyle}>{e.language.toUpperCase()}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{n(e.completionSnapshot)}%</td>
                  <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDateTime(e.createdAt)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {e.pdf_url
                      ? <a href={`/api/admin/exports/${e.id}/download`} target="_blank" rel="noreferrer" style={{ ...btnGhost, textDecoration: 'none', marginRight: 6 }}>Download</a>
                      : <span style={{ fontSize: 11, color: 'var(--text-hint)', marginRight: 6 }}>no file</span>}
                    <button style={btnDanger} onClick={() => exportAct(e.id, 'Delete this export record? This cannot be undone.')}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  )
}
