'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shell, useJson, act, fmt, n, formatDate, formatDateTime, VerifiedPill, BannedPill, StatusPill, btnGhost, btnDanger, btnWarn, thStyle, tdStyle, Loading, ErrorCard } from '../../_shared'

type User = { id: string; email: string; name: string | null; emailVerified: boolean; banned: boolean; banReason: string | null; createdAt: string; updatedAt: string }
type Study = { id: string; startupName: string | null; language: string; status: string; completionPercentage: number; createdAt: string; updatedAt: string; exports: number }
type Export = { id: string; language: string; completionSnapshot: number; pdf_url: string | null; createdAt: string; startupName: string | null }
type Session = { id: string; ipAddress: string | null; userAgent: string | null; createdAt: string; expiresAt: string; active: boolean }
interface Resp { user: User; studies: Study[]; exports: Export[]; sessions: Session[] }

const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6, display: 'block' }
const btnPrimary: React.CSSProperties = { background: 'var(--gold-500)', border: '1px solid var(--gold-500)', color: '#1a1206', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }

export default function UserDetailClient({ id }: { id: string }) {
  const { data, error, loading, reload } = useJson<Resp>(`/api/admin/users/${id}`)
  if (error) return <Shell active="users" title="User"><ErrorCard error={error} /></Shell>
  if (loading && !data) return <Shell active="users" title="User"><Loading /></Shell>
  if (!data) return <Shell active="users" title="User"><ErrorCard error="Not found" /></Shell>
  return <Inner key={data.user.id} id={id} data={data} reload={reload} />
}

function Inner({ id, data, reload }: { id: string; data: Resp; reload: () => void }) {
  const router = useRouter()
  const { user, studies, exports, sessions } = data
  const [name, setName] = useState(user.name ?? '')
  const [email, setEmail] = useState(user.email)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const dirty = name !== (user.name ?? '') || email !== user.email

  async function saveProfile() {
    setBusy(true); setMsg('')
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
      if (!r.ok) { const j = await r.json().catch(() => ({})); setMsg(j.error || 'Save failed') }
      else { setMsg('Saved'); reload(); setTimeout(() => setMsg(''), 1500) }
    } catch { setMsg('Save failed') }
    setBusy(false)
  }
  async function userAct(method: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(true)
    const ok = await act(`/api/admin/users/${id}`, method, body)
    setBusy(false)
    if (!ok) { alert('That action failed.'); return }
    if (method === 'DELETE') router.push('/admin/users'); else reload()
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
  async function revokeAll() {
    if (!window.confirm('Force-logout this user from all devices? They will need to sign in again.')) return
    const ok = await act(`/api/admin/users/${id}/sessions`, 'DELETE')
    if (ok) reload(); else alert('That action failed.')
  }
  async function revokeOne(sid: string) {
    const ok = await act(`/api/admin/sessions/${sid}`, 'DELETE')
    if (ok) reload(); else alert('That action failed.')
  }

  return (
    <Shell active="users" eyebrow="Back office · user" title={user.email}
      subtitle={<Link href="/admin/users" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← All users</Link>}>

      {/* profile editor */}
      <div className="wb-card" style={{ padding: 22, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Profile</h2>
            {user.banned ? <BannedPill /> : <VerifiedPill verified={user.emailVerified} />}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnGhost} disabled={busy} onClick={() => userAct('PATCH', { action: user.emailVerified ? 'unverify' : 'verify' })}>{user.emailVerified ? 'Unverify email' : 'Verify email'}</button>
            {user.banned ? (
              <button style={btnWarn} disabled={busy} onClick={() => userAct('PATCH', { action: 'unban' })}>Unban user</button>
            ) : (
              <button style={btnWarn} disabled={busy} onClick={() => userAct('PATCH', { action: 'ban' }, `Ban ${user.email}? They will be logged out and unable to access their account.`)}>Ban user</button>
            )}
            <button style={btnDanger} disabled={busy} onClick={() => userAct('DELETE', undefined, `Delete ${user.email}? This permanently removes their account, studies, and exports. This cannot be undone.`)}>Delete user</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input className="wb-input" value={name} onChange={e => setName(e.target.value)} placeholder="—" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input className="wb-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        {user.banned && user.banReason && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--danger-100)', borderRadius: 8, fontSize: 13, color: 'var(--danger-500)' }}>
            <strong>Ban reason:</strong> {user.banReason}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button style={{ ...btnPrimary, opacity: dirty ? 1 : 0.5 }} disabled={busy || !dirty} onClick={saveProfile}>Save profile</button>
          {msg && <span style={{ fontSize: 12, color: msg === 'Saved' ? 'var(--success-500)' : 'var(--danger-500)' }}>{msg}</span>}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Joined {formatDate(user.createdAt)} · <span style={{ fontFamily: 'var(--font-mono), monospace' }}>{user.id}</span></span>
        </div>
      </div>

      {/* sessions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Sessions ({sessions.length})</h2>
        {sessions.length > 0 && <button style={btnDanger} onClick={revokeAll}>Force-logout everywhere</button>}
      </div>
      <div className="wb-card" style={{ padding: 8, marginBottom: 28 }}>
        <div className="wb-tablewrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead><tr>{['Device', 'IP', 'Started', 'Expires', ''].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No active sessions.</td></tr>
              ) : sessions.map(s => (
                <tr key={s.id} className="wb-row" style={{ borderTop: '1px solid var(--border-default)' }}>
                  <td style={{ ...tdStyle, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.userAgent || '—'}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{s.ipAddress || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDateTime(s.createdAt)}</td>
                  <td style={{ ...tdStyle, color: s.active ? 'var(--text-faint)' : 'var(--danger-500)' }}>{s.active ? formatDate(s.expiresAt) : 'expired'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}><button style={btnGhost} onClick={() => revokeOne(s.id)}>Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* studies */}
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
                  <td style={tdStyle}>
                    <Link href={`/admin/studies/${s.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>{s.startupName || 'Untitled'}</Link>
                    <span style={{ fontSize: 10, color: 'var(--text-hint)', fontFamily: 'var(--font-mono), monospace', marginLeft: 6 }}>{s.language.toUpperCase()}</span>
                  </td>
                  <td style={tdStyle}><StatusPill status={s.status} /></td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{n(s.completionPercentage)}%</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(s.exports))}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDate(s.updatedAt)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link href={`/admin/studies/${s.id}`} style={{ ...btnGhost, textDecoration: 'none', marginRight: 6 }}>Open</Link>
                    <button style={btnDanger} onClick={() => studyAct(s.id, 'DELETE', undefined, 'Delete this study and its answers and exports? This cannot be undone.')}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* exports */}
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
