'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Incorrect email or password. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo wordmark */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-semibold text-navy-900 tracking-tight">
            Wuduh
          </h1>
          <p className="font-arabic text-base text-slate-500 mt-1">وضوح</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="font-display text-xl font-semibold text-navy-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Continue building your feasibility study.
          </p>

          {error && (
            <div className="bg-danger-100 text-danger-600 text-sm rounded-md px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={cn(
                  'w-full rounded-md border border-slate-200 px-3.5 py-2.5',
                  'text-sm text-navy-900 placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500',
                  'transition-colors duration-150'
                )}
                placeholder="••••••••"
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          New to Wuduh?{' '}
          <Link
            href="/signup"
            className="text-gold-600 font-medium hover:text-gold-700 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
