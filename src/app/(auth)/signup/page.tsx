'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
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

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-semibold text-navy-900 tracking-tight">
              Wuduh
            </h1>
            <p className="font-arabic text-base text-slate-500 mt-1">وضوح</p>
          </div>
          <div className="card p-8">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-navy-900 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-slate-500">
              We sent a confirmation link to <strong className="text-navy-900">{email}</strong>.
              Click it to activate your account and start building.
            </p>
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already confirmed?{' '}
            <Link href="/login" className="text-gold-600 font-medium hover:text-gold-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-semibold text-navy-900 tracking-tight">
            Wuduh
          </h1>
          <p className="font-arabic text-base text-slate-500 mt-1">وضوح</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display text-xl font-semibold text-navy-900 mb-1">
            Start your study
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Answer one card at a time. We'll assemble your feasibility study at the end.
          </p>

          {error && (
            <div className="bg-danger-100 text-danger-600 text-sm rounded-md px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className={cn(
                  'w-full rounded-md border border-slate-200 px-3.5 py-2.5',
                  'text-sm text-navy-900 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500',
                  'transition-colors duration-150'
                )}
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={cn(
                  'w-full rounded-md border border-slate-200 px-3.5 py-2.5',
                  'text-sm text-navy-900 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500',
                  'transition-colors duration-150'
                )}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={cn(
                  'w-full rounded-md border border-slate-200 px-3.5 py-2.5',
                  'text-sm text-navy-900 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500',
                  'transition-colors duration-150'
                )}
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full btn-primary mt-2',
                loading && 'opacity-60 cursor-not-allowed'
              )}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-600 font-medium hover:text-gold-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
