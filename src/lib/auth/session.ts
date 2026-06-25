import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Guard for protected pages. Redirects to /login if not signed in, and to
 * /login?verify=1 if the account exists but the email is not yet verified.
 * Returns the verified user so the page can use it directly.
 */
export async function requireVerifiedUser() {
  const user = await getUser()
  if (!user) redirect('/login')
  if (!user.emailVerified) redirect('/login?verify=1')
  return user
}

/**
 * API-route equivalent of requireVerifiedUser. Returns the user only if signed
 * in AND email-verified; otherwise null. Route handlers should respond 401/403.
 * (No redirect — API routes return JSON, not navigations.)
 */
export async function getVerifiedUser() {
  const user = await getUser()
  if (!user || !user.emailVerified) return null
  return user
}
