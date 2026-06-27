'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shell, useJson, act, fmt, n, formatDate, VerifiedPill, BannedPill, Pagination, ExportCsvButton, SortHeader, DateRangeFilter, PAGE_SIZE, btnGhost, btnDanger, btnWarn, tdStyle, Loading, ErrorCard } from '../_shared'

type UserRow = {
  id: string; email: string; name: string | null; emailVerified: boolean
  banned: boolean; createdAt: string; studies: number; exports: number; lastActive: string | null
}
interface Resp { users: UserRow[]; total: number }

export default function UsersClient() {
  const [q, setQ] = useState('')
  const [aq, setAq] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'banned'>('all')
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('createdAt')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  useEffect(() => { const t = setTimeout(() => { setAq(q); setOffset(0) }, 300); return () => clearTimeout(t) }, [q])
  useEffect(() => { setOffset(0) }, [filter, sort, dir, dateFrom, dateTo])
  const url = `/api/admin/users?q=${encodeURIComponent(aq)}&filter=${filter}&limit=${PAGE_SIZE}&offset=${offset}&sort=${sort}&dir=${dir}${dateFrom ? `&from=${dateFrom}` : ''}${dateTo ? `&to=${dateTo}` : ''}`
  const { data, error, loading, reload } = useJson<Resp>(url)

  function handleSort(f: string, d: 'asc' | 'desc') { setSort(f); setDir(d) }

  async function run(id: string, method: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(id)
    const ok = await act(`/api/admin/users/${id}`, method, body)
    setBusy(null)
    if (ok) { reload(); setSelected(s => { const n = new Set(s); n.delete(id); return n }) }
    else alert('That action failed. Please try again.')
  }

  async function bulkAction(action: string, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return
    setBulkBusy(true)
    const r = await fetch('/api/admin/users/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [...selected], action }) })
    setBulkBusy(false)
    if (r.ok) { setSelected(new Set()); reload() }
    else { const j = await r.json().catch(() => ({})); alert(j.error || 'Bulk action failed.') }
  }

  const users = data?.users || []
  const allSelected = users.length > 0 && users.every(u => selected.has(u.id))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(users.map(u => u.id)))
  }
  function toggle(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <Shell active="users" eyebrow="Back office" title="Users" subtitle={data ? `${fmt(data.total)} total` : 'Manage everyone who has signed up'}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="wb-input" style={{ maxWidth: 320 }} placeholder="Search by email or name…" value={q} onChange={e => setQ(e.target.value)} />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'verified', 'unverified', 'banned'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...btnGhost, textTransform: 'capitalize',
              borderColor: filter === f ? 'var(--gold-500)' : 'var(--border-default)',
              color: filter === f ? 'var(--gold-700)' : 'var(--text-muted)',
              background: filter === f ? 'var(--gold-100)' : 'transparent',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <ExportCsvButton href="/api/admin/users/export" />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <DateRangeFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />
        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono), monospace' }}>{selected.size} selected</span>
            <button style={btnGhost} disabled={bulkBusy} onClick={() => bulkAction('verify', `Verify ${selected.size} users?`)}>Verify</button>
            <button style={btnWarn} disabled={bulkBusy} onClick={() => bulkAction('ban', `Ban ${selected.size} users? They will be logged out.`)}>Ban</button>
            <button style={btnDanger} disabled={bulkBusy} onClick={() => bulkAction('delete', `Delete ${selected.size} users? This permanently removes their accounts, studies, and exports. This cannot be undone.`)}>Delete</button>
          </div>
        )}
      </div>

      {error ? <ErrorCard error={error} /> : loading && !data ? <Loading /> : (
        <div className="wb-card" style={{ padding: 8 }}>
          <div className="wb-tablewrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead><tr>
                <th style={{ padding: '0 12px 10px', width: 32 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <SortHeader label="User" field="email" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Status" field="name" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Studies" field="studies" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Exports" field="exports" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Joined" field="createdAt" current={sort} dir={dir} onSort={handleSort} />
                <th style={{ padding: '0 12px 10px' }} />
              </tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="wb-row" style={{ borderTop: '1px solid var(--border-default)', opacity: busy === u.id ? 0.5 : 1 }}>
                    <td style={{ padding: '12px', verticalAlign: 'middle' }}><input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} /></td>
                    <td style={tdStyle}>
                      <Link href={`/admin/users/${u.id}`} style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none', fontSize: 13 }}>{u.email}</Link>
                      {u.name && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u.name}</div>}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      {u.banned ? <BannedPill /> : <VerifiedPill verified={u.emailVerified} />}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(u.studies))}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono), monospace' }}>{fmt(n(u.exports))}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-faint)' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link href={`/admin/users/${u.id}`} style={{ ...btnGhost, textDecoration: 'none', marginRight: 6 }}>View</Link>
                      <button style={{ ...btnGhost, marginRight: 6 }} disabled={busy === u.id}
                        onClick={() => run(u.id, 'PATCH', { action: u.emailVerified ? 'unverify' : 'verify' })}>
                        {u.emailVerified ? 'Unverify' : 'Verify'}
                      </button>
                      {u.banned ? (
                        <button style={{ ...btnWarn, marginRight: 6 }} disabled={busy === u.id}
                          onClick={() => run(u.id, 'PATCH', { action: 'unban' })}>Unban</button>
                      ) : (
                        <button style={{ ...btnWarn, marginRight: 6 }} disabled={busy === u.id}
                          onClick={() => run(u.id, 'PATCH', { action: 'ban' }, `Ban ${u.email}? They will be logged out and unable to access their account.`)}>Ban</button>
                      )}
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
          {data && <Pagination total={data.total} offset={offset} pageSize={PAGE_SIZE} onPage={setOffset} />}
        </div>
      )}
    </Shell>
  )
}
