'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shell, useJson, act, fmt, n, formatDate, StatusPill, Pagination, ExportCsvButton, SortHeader, DateRangeFilter, PAGE_SIZE, btnGhost, btnDanger, tdStyle, Loading, ErrorCard } from '../_shared'

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
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('updatedAt')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  useEffect(() => { const t = setTimeout(() => { setAq(q); setOffset(0) }, 300); return () => clearTimeout(t) }, [q])
  useEffect(() => { setOffset(0) }, [status, sort, dir, dateFrom, dateTo])
  const url = `/api/admin/studies?q=${encodeURIComponent(aq)}&status=${status}&limit=${PAGE_SIZE}&offset=${offset}&sort=${sort}&dir=${dir}${dateFrom ? `&from=${dateFrom}` : ''}${dateTo ? `&to=${dateTo}` : ''}`
  const { data, error, loading, reload } = useJson<Resp>(url)

  function handleSort(f: string, d: 'asc' | 'desc') { setSort(f); setDir(d) }

  async function run(id: string, method: string, body?: unknown, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(id)
    const ok = await act(`/api/admin/studies/${id}`, method, body)
    setBusy(null)
    if (ok) { reload(); setSelected(s => { const n = new Set(s); n.delete(id); return n }) }
    else alert('That action failed.')
  }

  async function bulkAction(action: string, confirmMsg: string, extra?: Record<string, unknown>) {
    if (!window.confirm(confirmMsg)) return
    setBulkBusy(true)
    const r = await fetch('/api/admin/studies/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [...selected], action, ...extra }) })
    setBulkBusy(false)
    if (r.ok) { setSelected(new Set()); reload() }
    else { const j = await r.json().catch(() => ({})); alert(j.error || 'Bulk action failed.') }
  }

  const studies = data?.studies || []
  const allSelected = studies.length > 0 && studies.every(s => selected.has(s.id))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(studies.map(s => s.id)))
  }
  function toggle(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <Shell active="studies" eyebrow="Back office" title="Studies" subtitle={data ? `${fmt(data.total)} total` : 'Every feasibility study across all founders'}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
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
        <div style={{ flex: 1 }} />
        <ExportCsvButton href="/api/admin/studies/export" />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <DateRangeFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />
        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono), monospace' }}>{selected.size} selected</span>
            <button style={btnDanger} disabled={bulkBusy} onClick={() => bulkAction('delete', `Delete ${selected.size} studies and all their answers and exports? This cannot be undone.`)}>Delete</button>
          </div>
        )}
      </div>

      {error ? <ErrorCard error={error} /> : loading && !data ? <Loading /> : (
        <div className="wb-card" style={{ padding: 8 }}>
          <div className="wb-tablewrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
              <thead><tr>
                <th style={{ padding: '0 12px 10px', width: 32 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <SortHeader label="Study" field="startupName" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Owner" field="email" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Status" field="status" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Completion" field="completionPercentage" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Exports" field="exports" current={sort} dir={dir} onSort={handleSort} />
                <SortHeader label="Updated" field="updatedAt" current={sort} dir={dir} onSort={handleSort} />
                <th style={{ padding: '0 12px 10px' }} />
              </tr></thead>
              <tbody>
                {studies.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>No studies found.</td></tr>
                ) : studies.map(s => (
                  <tr key={s.id} className="wb-row" style={{ borderTop: '1px solid var(--border-default)', opacity: busy === s.id ? 0.5 : 1 }}>
                    <td style={{ padding: '12px', verticalAlign: 'middle' }}><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} /></td>
                    <td style={tdStyle}>
                      <Link href={`/admin/studies/${s.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>{s.startupName || 'Untitled'}</Link>
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
                      <Link href={`/admin/studies/${s.id}`} style={{ ...btnGhost, textDecoration: 'none', marginRight: 6 }}>Open</Link>
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
          {data && <Pagination total={data.total} offset={offset} pageSize={PAGE_SIZE} onPage={setOffset} />}
        </div>
      )}
    </Shell>
  )
}
