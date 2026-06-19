'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'

type State = 'verifying' | 'success' | 'error'

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

export default function ConfirmPage() {
  const router = useRouter()
  const [state, setState]     = useState<State>('verifying')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Better Auth handles email verification via the /api/auth/verify-email endpoint
    // This page just shows status based on URL params
    const params = new URLSearchParams(window.location.search)
    const error  = params.get('error')

    if (error) {
      setState('error')
      setMessage(error)
      return
    }

    // Check if already signed in
    authClient.getSession().then(({ data }) => {
      if (data?.session) {
        setState('success')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setState('error')
        setMessage('The confirmation link may have expired. Please request a new one.')
      }
    })
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <style>{`
        @keyframes confirm-spin { to { transform: rotate(360deg); } }
        @keyframes confirm-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .confirm-card { animation: confirm-in 300ms cubic-bezier(0.22,0.61,0.36,1) both; }
        @keyframes progress-fill { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 20, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Wuduh</span>
        </div>

        <div className="confirm-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: '48px 36px' }}>
          {state === 'verifying' && (
            <>
              <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto 24px' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke="var(--gold-500)" strokeWidth="3" strokeDasharray="34 104" strokeLinecap="round" style={{ animation: 'confirm-spin 1s linear infinite', transformOrigin: '50% 50%' }} />
                </svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Verifying your email…</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>This only takes a second.</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--teal-100)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.015em', marginBottom: 10 }}>Email confirmed!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 24 }}>Your account is active. Taking you to your dashboard now…</p>
              <div style={{ height: 3, background: 'var(--border-default)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: 'var(--teal-500)', borderRadius: 99, animation: 'progress-fill 2s linear forwards' }} />
              </div>
            </>
          )}

          {state === 'error' && (
            <>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-100)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10 }}>Link expired or invalid</h2>
              {message && <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: 'var(--danger-500)', marginBottom: 16 }}>{message}</p>}
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 28 }}>Confirmation links expire after 24 hours. Sign up again to get a fresh link.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/signup" style={{ display: 'block', background: 'var(--text-primary)', color: 'var(--bg-page)', borderRadius: 9, padding: '12px 0', fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>Request new link</Link>
                <Link href="/login" style={{ display: 'block', background: 'transparent', border: '1.5px solid var(--border-default)', color: 'var(--text-muted)', borderRadius: 9, padding: '11px 0', fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>Back to sign in</Link>
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 24 }}>
          Need help? <Link href="/#contact" style={{ color: 'var(--gold-500)', textDecoration: 'none' }}>Contact us</Link>
        </p>
      </div>
    </div>
  )
}
