'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { logoutAdmin } from './actions'

// ── helpers ────────────────────────────────────────────────────────
export function n(v: unknown): number {
  const x = typeof v === 'string' ? parseInt(v, 10) : (v as number)
  return Number.isFinite(x) ? x : 0
}
export function fmt(v: number): string { return v.toLocaleString('en-US') }
export function pct(part: number, whole: number): number { return whole > 0 ? Math.round((part / whole) * 100) : 0 }
export function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function formatDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── data hook ──────────────────────────────────────────────────────
export function useJson<T>(url: string): { data: T | null; error: string | null; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick(t => t + 1), [])
  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(url, { cache: 'no-store' })
      .then(async r => { if (!r.ok) throw new Error(`Request failed (${r.status})`); return r.json() })
      .then(d => { if (alive) { setData(d as T); setError(null) } })
      .catch(e => { if (alive) setError(String(e?.message || e)) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [url, tick])
  return { data, error, loading, reload }
}

/** POST/PATCH/DELETE helper. Returns true on success. */
export async function act(url: string, method: string, body?: unknown): Promise<boolean> {
  try {
    const r = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    return r.ok
  } catch { return false }
}

// ── shared bits ────────────────────────────────────────────────────
export function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 99, background: bg, color: fg, whiteSpace: 'nowrap' }}>{text}</span>
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    draft: ['Draft', 'var(--bg-subtle)', 'var(--text-faint)'],
    complete: ['Complete', 'var(--gold-100)', 'var(--gold-700)'],
    exported: ['Exported', 'var(--teal-100)', 'var(--teal-700)'],
  }
  const [t, bg, fg] = map[status] || [status, 'var(--bg-subtle)', 'var(--text-faint)']
  return <Pill text={t} bg={bg} fg={fg} />
}

export function VerifiedPill({ verified }: { verified: boolean }) {
  return verified
    ? <Pill text="Verified" bg="var(--success-100)" fg="var(--success-500)" />
    : <Pill text="Unverified" bg="var(--warning-100)" fg="var(--warning-500)" />
}

export const btnGhost: React.CSSProperties = { background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: 12, padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }
export const btnDanger: React.CSSProperties = { background: 'transparent', border: '1px solid var(--danger-500)', color: 'var(--danger-500)', fontSize: 12, padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }
export const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0 12px 10px', fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 500 }
export const tdStyle: React.CSSProperties = { padding: '12px', fontSize: 13, verticalAlign: 'middle', color: 'var(--text-secondary)' }

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="var(--text-primary)" strokeWidth="7.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const NAV: { key: string; label: string; href: string }[] = [
  { key: 'overview', label: 'Overview', href: '/admin' },
  { key: 'users', label: 'Users', href: '/admin/users' },
  { key: 'studies', label: 'Studies', href: '/admin/studies' },
]

export function AdminHeader({ active }: { active: 'overview' | 'users' | 'studies' }) {
  return (
    <>
      <style>{`
        .wb-card { background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 14px; }
        .wb-row:hover { background: var(--bg-subtle); }
        .wb-link:hover { opacity: 0.85; }
        .wb-nav { color: var(--text-muted); text-decoration: none; font-size: 13px; padding: 4px 2px; border-bottom: 2px solid transparent; }
        .wb-nav:hover { color: var(--text-primary); }
        .wb-nav-active { color: var(--text-primary); border-bottom-color: var(--gold-500); }
        .wb-input { background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 9px; padding: 9px 12px; font-size: 13px; color: var(--text-primary); width: 100%; font-family: inherit; }
        .wb-input:focus { outline: none; border-color: var(--gold-500); }
        @media (max-width: 900px) { .wb-3col { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) {
          .wb-header-inner { padding: 0 16px !important; }
          .wb-kpi { grid-template-columns: repeat(2, 1fr) !important; }
          .wb-tablewrap { overflow-x: auto; }
        }
      `}</style>
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="wb-header-inner" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <LogoMark />
              <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Wuduh</span>
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '3px 8px', borderRadius: 6 }}>Admin</span>
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {NAV.map(item => (
                <Link key={item.key} href={item.href} className={`wb-nav${active === item.key ? ' wb-nav-active' : ''}`}>{item.label}</Link>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/" className="wb-link" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>View site ↗</a>
            <ThemeToggle />
            <div style={{ width: 1, height: 16, background: 'var(--border-default)' }} />
            <form action={logoutAdmin}>
              <button type="submit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', padding: 0, fontFamily: 'inherit' }}>Log out</button>
            </form>
          </div>
        </div>
      </header>
    </>
  )
}

/** Page wrapper: bg + header + main with a title block. */
export function Shell({ active, eyebrow, title, subtitle, children }: {
  active: 'overview' | 'users' | 'studies'
  eyebrow?: string
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <AdminHeader active={active} />
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          {eyebrow && <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-500)', marginBottom: 10 }}>{eyebrow}</p>}
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 30, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  )
}

export function Loading() {
  return <div className="wb-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>Loading…</div>
}
export function ErrorCard({ error }: { error: string }) {
  return <div className="wb-card" style={{ padding: 22, color: 'var(--danger-500)', fontSize: 14 }}>Couldn&apos;t load: {error}</div>
}

export const PAGE_SIZE = 50

export function Pagination({ total, offset, pageSize, onPage }: { total: number; offset: number; pageSize: number; onPage: (offset: number) => void }) {
  const pages = Math.ceil(total / pageSize)
  const current = Math.floor(offset / pageSize)
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px 4px', fontSize: 13 }}>
      <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
        {fmt(offset + 1)}–{fmt(Math.min(offset + pageSize, total))} of {fmt(total)}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={{ ...btnGhost, opacity: current === 0 ? 0.4 : 1 }} disabled={current === 0} onClick={() => onPage(Math.max(0, offset - pageSize))}>← Prev</button>
        <button style={{ ...btnGhost, opacity: current >= pages - 1 ? 0.4 : 1 }} disabled={current >= pages - 1} onClick={() => onPage(offset + pageSize)}>Next →</button>
      </div>
    </div>
  )
}

export const btnWarn: React.CSSProperties = { background: 'transparent', border: '1px solid var(--warning-500)', color: 'var(--warning-500)', fontSize: 12, padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }

export function BannedPill() {
  return <Pill text="Banned" bg="var(--danger-100)" fg="var(--danger-500)" />
}

export function ExportCsvButton({ href, label }: { href: string; label?: string }) {
  return (
    <a href={href} download style={{ ...btnGhost, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      {label || 'Export CSV'}
    </a>
  )
}
