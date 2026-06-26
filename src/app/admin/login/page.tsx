import { redirect } from 'next/navigation'
import { isAdmin, adminConfigured } from '@/lib/auth/admin'
import { loginAdmin } from '../actions'

export const dynamic = 'force-dynamic'

function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="var(--text-primary)" strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (await isAdmin()) redirect('/admin')
  const sp = await searchParams
  const hasError = sp?.error === '1'
  const configured = adminConfigured()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
          <LogoMark />
          <div>
            <div style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}>Wuduh</div>
            <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-700)', marginTop: 4 }}>Back office</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, padding: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.015em', marginBottom: 6 }}>Owner sign-in</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 22 }}>
            This area is separate from the Wuduh app. Enter the owner password to continue.
          </p>

          {!configured && (
            <div style={{ background: 'var(--warning-100)', color: 'var(--warning-500)', borderRadius: 10, padding: '11px 14px', fontSize: 12.5, lineHeight: 1.5, marginBottom: 18 }}>
              No owner password is set yet. Add an <strong>ADMIN_PASSWORD</strong> environment variable, then redeploy.
            </div>
          )}

          {hasError && (
            <div style={{ background: 'var(--danger-100)', color: 'var(--danger-500)', borderRadius: 10, padding: '11px 14px', fontSize: 13, marginBottom: 18 }}>
              Incorrect password. Try again.
            </div>
          )}

          <form action={loginAdmin}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8 }}>
              Owner password
            </label>
            <input
              className="wuduh-input"
              type="password"
              name="password"
              autoComplete="current-password"
              autoFocus
              required
              placeholder="••••••••••"
              style={{ marginBottom: 16 }}
            />
            <button
              type="submit"
              disabled={!configured}
              style={{
                width: '100%', background: 'var(--text-primary)', color: 'var(--bg-page)',
                fontSize: 14, fontWeight: 500, borderRadius: 9, padding: '12px 0',
                border: 'none', cursor: configured ? 'pointer' : 'not-allowed',
                opacity: configured ? 1 : 0.5,
              }}
            >
              Enter back office
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginTop: 20 }}>
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to wuduh.site</a>
        </p>
      </div>
    </div>
  )
}
