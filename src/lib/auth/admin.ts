import { requireVerifiedUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

/**
 * Owner/back-office access is controlled by an env allowlist:
 *   ADMIN_EMAILS="you@example.com,partner@example.com"
 * No schema change, no role column — just the owner(s) you list.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

/**
 * Page guard for the back office. Requires a verified user (redirects to
 * /login otherwise via requireVerifiedUser) AND an allowlisted admin email;
 * non-admins are bounced to their normal dashboard. Returns the admin user.
 */
export async function requireAdmin() {
  const user = await requireVerifiedUser()
  if (!isAdminEmail(user.email)) redirect('/dashboard')
  return user
}
