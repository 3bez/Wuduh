'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import { useLocale } from '@/components/ui/LocaleProvider'
import { authCopy } from '@/lib/i18n/auth'

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="var(--text-primary)" strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function ResetPasswordPage() {
  const { locale, isRtl } = useLocale()
  const t = authCopy[locale].reset
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password/update`,
    })

    if (error) {
      setError(error.message ?? authCopy[locale].login.errorGeneric)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <style>{`
        .rp-input { width: 100%; padding: 12px 14px; font-size: 15px; background: var(--bg-input); color: var(--text-primary); border: 1.5px solid var(--border-strong); border-radius: 10px; outline: none; transition: border-color 140ms, box-shadow 140ms; font-family: var(--font-sans), sans-serif; }
        .rp-input::placeholder { color: var(--text-hint); }
        .rp-input:focus { border-color: rgba(201,168,76,0.65); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .rp-submit { transition: opacity 140ms; }
        .rp-submit:hover:not(:disabled) { opacity: 0.86; }
        .rp-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .rp-link { color: var(--gold-500); text-decoration: none; transition: color 140ms; }
        .rp-link:hover { color: var(--gold-400); }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Wuduh</span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: '40px 36px' }}>
          {sent ? (
            <>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gold-100)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <h2 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.015em', textAlign: 'center', marginBottom: 10 }}>{t.sentHeading}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, textAlign: 'center', marginBottom: 28, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }} dangerouslySetInnerHTML={{ __html: t.sentBody(email) }} />
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>
                  {t.sentDidntGet}{' '}
                  <button onClick={() => setSent(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-500)', fontSize: 13, padding: 0, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif' }}>{t.sentTryDifferent}</button>.
                </p>
              </div>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', background: 'var(--text-primary)', color: 'var(--bg-page)', fontSize: 14, fontWeight: 500, borderRadius: 9, padding: '12px 0', textDecoration: 'none', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.sentBackToSignIn}</Link>
            </>
          ) : (
            <>
              <p style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: isRtl ? 12 : 10, letterSpacing: isRtl ? 0 : '0.12em', textTransform: isRtl ? 'none' : 'uppercase', color: 'var(--gold-500)', marginBottom: 10 }}>{t.eyebrow}</p>
              <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>{t.heading}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.sub}</p>

              {error && <div style={{ background: 'var(--danger-100)', color: 'var(--danger-500)', fontSize: 13, borderRadius: 9, padding: '11px 14px', marginBottom: 20, border: '1px solid', borderColor: 'rgba(192,73,47,0.2)' }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="rp-email" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.emailLabel}</label>
                  <input id="rp-email" type="email" autoComplete="email" required className="rp-input" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" />
                </div>
                <button type="submit" disabled={loading} className="rp-submit" style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-page)', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif' }}>
                  {loading ? t.submitting : t.submit}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)', marginTop: 24, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>
          {t.rememberPassword} <Link href="/login" className="rp-link" style={{ fontWeight: 500 }}>{t.signIn}</Link>
        </p>
      </div>
    </div>
  )
}
