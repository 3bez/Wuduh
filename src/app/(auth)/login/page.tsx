'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth/client'
import { useLocale } from '@/components/ui/LocaleProvider'
import { authCopy } from '@/lib/i18n/auth'

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="var(--text-primary)" strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { locale, isRtl } = useLocale()
  const t = authCopy[locale].login
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signIn.email({ email, password })

      if (error) {
        setError(
          error.message === 'Email not verified'
            ? t.errorNotVerified
            : t.errorInvalidCredentials
        )
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(t.errorGeneric)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex' }}>
      <style>{`
        .auth-input {
          width: 100%; padding: 12px 14px; font-size: 15px;
          background: var(--bg-input); color: var(--text-primary);
          border: 1.5px solid var(--border-strong); border-radius: 10px;
          outline: none; transition: border-color 140ms, box-shadow 140ms;
          font-family: var(--font-sans), sans-serif;
        }
        .auth-input::placeholder { color: var(--text-hint); }
        .auth-input:focus { border-color: rgba(201,168,76,0.65); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .auth-submit { transition: opacity 140ms; }
        .auth-submit:hover:not(:disabled) { opacity: 0.86; }
        .auth-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .auth-link { color: var(--gold-500); text-decoration: none; transition: color 140ms; }
        .auth-link:hover { color: var(--gold-400); }
        .auth-pass-toggle { background: none; border: none; cursor: pointer; color: var(--text-hint); padding: 0; display: flex; align-items: center; transition: color 140ms; }
        .auth-pass-toggle:hover { color: var(--text-faint); }
        .auth-panel { background: #0D1B2A; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 64px 56px; position: relative; overflow: hidden; }
        @media (max-width: 768px) { .auth-panel { display: none; } }
      `}</style>

      {/* ── Left panel ── */}
      <div className="auth-panel">
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <pattern id="auth-net" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.15">
                <rect x="12" y="12" width="24" height="24" />
                <rect x="16.97" y="16.97" width="24" height="24" transform="rotate(45 24 24)" strokeOpacity="0.08" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-net)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <svg width="36" height="36" viewBox="0 0 96 96" fill="none">
              <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
              <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="#AEC6D9" strokeWidth="7.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>Wuduh</span>
            <span style={{ fontFamily: 'var(--font-arabic), sans-serif', fontSize: 15, color: '#C9A84C', direction: 'rtl' }}>وضوح</span>
          </div>
          <p style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: isRtl ? 12 : 10, letterSpacing: isRtl ? 0 : '0.14em', textTransform: isRtl ? 'none' : 'uppercase', color: '#C9A84C', marginBottom: 16, direction: isRtl ? 'rtl' : 'ltr' }}>
            {t.panelEyebrow}
          </p>
          <h2 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: isRtl ? 30 : 32, fontWeight: 500, color: '#fff', letterSpacing: isRtl ? 0 : '-0.025em', lineHeight: 1.12, marginBottom: 20, direction: isRtl ? 'rtl' : 'ltr' }}>
            {t.panelHeading.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </h2>
          <p style={{ fontSize: 15, color: '#7BA0BF', lineHeight: 1.7, marginBottom: 40, direction: isRtl ? 'rtl' : 'ltr', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>
            {t.panelSub}
          </p>
          <div style={{ display: 'flex', gap: 24, direction: isRtl ? 'rtl' : 'ltr' }}>
            {t.panelStats.map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {n}<span style={{ color: '#C9A84C' }}>.</span>
                </div>
                <div style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: 10, letterSpacing: isRtl ? 0 : '0.08em', textTransform: isRtl ? 'none' : 'uppercase', color: '#4D7CA3', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div dir={isRtl ? 'rtl' : 'ltr'} style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', background: 'var(--bg-page)' }}>
        <div style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 40 }} className="auth-mobile-logo">
          <LogoMark size={28} />
          <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>Wuduh</span>
        </div>
        <style>{`.auth-mobile-logo { display: flex !important; } @media (min-width: 769px) { .auth-mobile-logo { display: none !important; } }`}</style>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: isRtl ? 12 : 10, letterSpacing: isRtl ? 0 : '0.12em', textTransform: isRtl ? 'none' : 'uppercase', color: 'var(--gold-500)', marginBottom: 10 }}>{t.eyebrow}</p>
          <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 26, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>{t.heading}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.sub}</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-100)', color: 'var(--danger-500)', fontSize: 13, borderRadius: 9, padding: '11px 14px', marginBottom: 20, border: '1px solid', borderColor: 'rgba(192,73,47,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.emailLabel}</label>
            <input id="email" type="email" autoComplete="email" required className="auth-input"
              value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label htmlFor="password" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.passwordLabel}</label>
              <Link href="/reset-password" className="auth-link" style={{ fontSize: 12, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.forgotPassword}</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input id="password" type={showPass ? 'text' : 'password'} autoComplete="current-password" required className="auth-input"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" style={{ paddingRight: 44 }} />
              <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit" style={{
            width: '100%', background: 'var(--text-primary)', color: 'var(--bg-page)',
            border: 'none', borderRadius: 10, padding: '13px 0',
            fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif',
          }}>
            {loading ? t.submitting : t.submit}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)', marginTop: 28, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>
          {t.newToWuduh}{' '}
          <Link href="/signup" className="auth-link" style={{ fontWeight: 500 }}>{t.createAccount}</Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/" style={{ fontSize: 12, color: 'var(--text-hint)', textDecoration: 'none', transition: 'color 140ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-hint)')}>
            {authCopy[locale].backToSite}
          </Link>
        </div>
      </div>
    </div>
  )
}
