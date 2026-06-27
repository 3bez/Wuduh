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

function PasswordStrength({ password, locale }: { password: string; locale: 'en' | 'ar' }) {
  if (!password) return null
  const t = authCopy[locale].update
  const len = password.length >= 8; const upper = /[A-Z]/.test(password); const number = /[0-9]/.test(password)
  const score = [len, upper, number].filter(Boolean).length
  const label = score === 3 ? t.strengthStrong : score === 2 ? t.strengthGood : t.strengthWeak
  const color = score === 3 ? 'var(--teal-500)' : score === 2 ? 'var(--gold-500)' : 'var(--danger-500)'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 3, background: 'var(--border-default)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(score / 3) * 100}%`, background: color, borderRadius: 99, transition: 'width 300ms, background 300ms' }} />
      </div>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color, marginTop: 5, letterSpacing: '0.06em' }}>{label}</p>
    </div>
  )
}

export default function UpdatePasswordPage() {
  const { locale, isRtl } = useLocale()
  const t = authCopy[locale].update
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [done, setDone]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError(t.errorMinLength); return }
    if (password !== confirm) { setError(t.errorMismatch); return }

    setLoading(true)
    const token = new URLSearchParams(window.location.search).get('token') ?? ''

    const { error } = await authClient.resetPassword({ newPassword: password, token })

    if (error) {
      setError(error.message ?? authCopy[locale].login.errorGeneric)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => { window.location.href = '/dashboard' }, 2000)
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <style>{`
        .up-input { width: 100%; padding: 12px 14px; font-size: 15px; background: var(--bg-input); color: var(--text-primary); border: 1.5px solid var(--border-strong); border-radius: 10px; outline: none; transition: border-color 140ms, box-shadow 140ms; font-family: var(--font-sans), sans-serif; }
        .up-input::placeholder { color: var(--text-hint); }
        .up-input:focus { border-color: rgba(201,168,76,0.65); box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .up-submit { transition: opacity 140ms; }
        .up-submit:hover:not(:disabled) { opacity: 0.86; }
        .up-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .up-show { background: none; border: none; cursor: pointer; color: var(--text-hint); padding: 0; display: flex; align-items: center; transition: color 140ms; }
        @keyframes up-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .up-done { animation: up-in 300ms cubic-bezier(0.22,0.61,0.36,1) both; }
        @keyframes up-progress { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Wuduh</span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: '40px 36px' }}>
          {done ? (
            <div className="up-done" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--teal-100)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.015em', marginBottom: 10 }}>{t.doneHeading}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 24, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.doneSub}</p>
              <div style={{ height: 3, background: 'var(--border-default)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--teal-500)', borderRadius: 99, animation: 'up-progress 2s linear forwards' }} />
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: isRtl ? 12 : 10, letterSpacing: isRtl ? 0 : '0.12em', textTransform: isRtl ? 'none' : 'uppercase', color: 'var(--gold-500)', marginBottom: 10 }}>{t.eyebrow}</p>
              <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>{t.heading}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.sub}</p>

              {error && <div style={{ background: 'var(--danger-100)', color: 'var(--danger-500)', fontSize: 13, borderRadius: 9, padding: '11px 14px', marginBottom: 20, border: '1px solid', borderColor: 'rgba(192,73,47,0.2)' }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="password" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.newPasswordLabel}</label>
                  <div style={{ position: 'relative' }}>
                    <input id="password" type={showPass ? 'text' : 'password'} autoComplete="new-password" required minLength={8} className="up-input" autoFocus value={password} onChange={e => setPassword(e.target.value)} placeholder={t.newPasswordPlaceholder} dir="ltr" style={{ paddingRight: 44 }} />
                    <button type="button" className="up-show" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                      {showPass ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  <PasswordStrength password={password} locale={locale} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="confirm" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}>{t.confirmLabel}</label>
                  <input id="confirm" type={showPass ? 'text' : 'password'} autoComplete="new-password" required className="up-input" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t.confirmPlaceholder} dir="ltr" style={{ borderColor: confirm && confirm !== password ? 'var(--danger-500)' : undefined }} />
                  {confirm && confirm !== password && <p style={{ fontSize: 12, color: 'var(--danger-500)', fontFamily: 'var(--font-mono), monospace' }}>{t.matchError}</p>}
                  {confirm && confirm === password && <p style={{ fontSize: 12, color: 'var(--teal-500)', fontFamily: 'var(--font-mono), monospace' }}>{t.matchSuccess}</p>}
                </div>

                <button type="submit" disabled={loading || (!!confirm && confirm !== password)} className="up-submit" style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-page)', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 500, cursor: loading || (!!confirm && confirm !== password) ? 'not-allowed' : 'pointer', fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif', marginTop: 4 }}>
                  {loading ? t.submitting : t.submit}
                </button>
              </form>
            </>
          )}
        </div>

        {!done && <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)', marginTop: 24, fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : undefined }}><Link href="/login" style={{ color: 'var(--gold-500)', textDecoration: 'none', fontWeight: 500 }}>{isRtl ? 'العودة لتسجيل الدخول \u2192' : '\u2190 Back to sign in'}</Link></p>}
      </div>
    </div>
  )
}
