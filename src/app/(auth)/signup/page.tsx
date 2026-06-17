'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

// ── Password strength indicator ────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const len    = password.length >= 8
  const upper  = /[A-Z]/.test(password)
  const number = /[0-9]/.test(password)
  const score  = [len, upper, number].filter(Boolean).length

  const label  = score === 3 ? 'Strong' : score === 2 ? 'Good' : 'Weak'
  const color  = score === 3 ? 'var(--teal-500)' : score === 2 ? 'var(--gold-500)' : 'var(--danger-500)'
  const width  = `${(score / 3) * 100}%`

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 3, background: 'var(--border-default)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width, background: color, borderRadius: 99, transition: 'width 300ms, background 300ms' }} />
      </div>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color, marginTop: 5, letterSpacing: '0.06em' }}>
        {label}
      </p>
    </div>
  )
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
            <LogoMark size={28} />
            <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>Wuduh</span>
          </div>

          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 20, padding: '48px 36px',
          }}>
            {/* Teal check circle */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--teal-100)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.015em', marginBottom: 10 }}>
              Check your email
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 24 }}>
              We sent a confirmation link to{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{email}</strong>.
              Click it to activate your account and start building.
            </p>

            {/* What to expect */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '14px 16px', textAlign: 'left' }}>
              <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10 }}>
                What happens next
              </p>
              {[
                'Click the link in your email',
                'Choose Arabic or English',
                'Answer your first card',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, color: 'var(--text-faint)' }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 24 }}>
            Already confirmed?{' '}
            <Link href="/login" style={{ color: 'var(--gold-500)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────
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

      {/* ── Left decorative panel ── */}
      <div className="auth-panel">
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <pattern id="auth-net-s" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="#C9A84C" strokeWidth="0.8" strokeOpacity="0.15">
                <rect x="12" y="12" width="24" height="24" />
                <rect x="16.97" y="16.97" width="24" height="24" transform="rotate(45 24 24)" strokeOpacity="0.08" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-net-s)" />
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

          <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16 }}>
            Free to start
          </p>
          <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 32, fontWeight: 500, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.12, marginBottom: 20 }}>
            Your study,<br />your words.
          </h2>
          <p style={{ fontSize: 15, color: '#7BA0BF', lineHeight: 1.7, marginBottom: 40 }}>
            No templates. No AI filler. Just your answers to 52 focused questions, assembled into a study you&apos;ll be proud to send.
          </p>

          {/* Testimonial-style quote */}
          <div style={{ borderLeft: '2px solid rgba(201,168,76,0.4)', paddingLeft: 16 }}>
            <p style={{ fontSize: 14, color: '#AEC6D9', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 10 }}>
              &ldquo;It made me think through things I would have avoided until the investor meeting.&rdquo;
            </p>
            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4D7CA3' }}>
              Early user · Riyadh
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px', background: 'var(--bg-page)',
      }}>
        {/* Mobile logo */}
        <style>{`.su-mobile-logo { display: flex !important; } @media (min-width: 769px) { .su-mobile-logo { display: none !important; } }`}</style>
        <div className="su-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <LogoMark size={28} />
          <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>Wuduh</span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-500)', marginBottom: 10 }}>
            Create account
          </p>
          <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 26, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 6 }}>
            Start your study
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Free to start. No credit card required.
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-100)', color: 'var(--danger-500)', fontSize: 13, borderRadius: 9, padding: '11px 14px', marginBottom: 20, border: '1px solid', borderColor: 'rgba(192,73,47,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Full name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="fullName" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Full name</label>
            <input id="fullName" type="text" autoComplete="name" required className="auth-input"
              value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Layla Al-Rashid" />
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label>
            <input id="email" type="email" autoComplete="email" required className="auth-input"
              value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="password" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" type={showPass ? 'text' : 'password'} autoComplete="new-password" required minLength={8}
                className="auth-input" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters" style={{ paddingRight: 44 }} />
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
            <PasswordStrength password={password} />
          </div>

          <button type="submit" disabled={loading} className="auth-submit" style={{
            width: '100%', background: 'var(--text-primary)', color: 'var(--bg-page)',
            border: 'none', borderRadius: 10, padding: '13px 0',
            fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4, fontFamily: 'var(--font-sans), sans-serif',
          }}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>

          <p style={{ fontSize: 11, color: 'var(--text-hint)', textAlign: 'center', lineHeight: 1.5 }}>
            By creating an account you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--text-faint)', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: 'var(--text-faint)', textDecoration: 'underline' }}>Privacy Policy</Link>
          </p>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-faint)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" className="auth-link" style={{ fontWeight: 500 }}>Sign in</Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/" style={{ fontSize: 12, color: 'var(--text-hint)', textDecoration: 'none', transition: 'color 140ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-faint)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-hint)')}>
            ← Back to wuduh.site
          </Link>
        </div>
      </div>
    </div>
  )
}
