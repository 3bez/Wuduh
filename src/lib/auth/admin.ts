import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto from 'node:crypto'

// ── Separate back-office auth ───────────────────────────────────────
// The admin area is NOT tied to Wuduh user accounts. Access is gated by
// a single owner password (env ADMIN_PASSWORD). On login we set a signed,
// httpOnly cookie; the signing key is derived from the password so it stays
// stable across deploys and invalidates automatically if the password changes.

const COOKIE = 'wuduh_admin'
const MAX_AGE_S = 60 * 60 * 24 * 7 // 7 days

export const ADMIN_COOKIE = COOKIE
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_S

function signingKey(): string {
  const pw = process.env.ADMIN_PASSWORD ?? ''
  return crypto.createHash('sha256').update('wuduh-admin|' + pw).digest('hex')
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', signingKey()).update(payload).digest('hex')
}

/** True only if an owner password has been configured. */
export function adminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD ?? '').length > 0
}

/** Constant-time password check against ADMIN_PASSWORD. */
export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? ''
  if (!expected) return false
  const a = Buffer.from(input)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

/** Build a signed session token carrying its own expiry. */
export function createAdminToken(): string {
  const exp = Date.now() + MAX_AGE_S * 1000
  const payload = String(exp)
  return `${payload}.${sign(payload)}`
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  const dot = token.lastIndexOf('.')
  if (dot < 1) return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = sign(payload)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  if (!crypto.timingSafeEqual(a, b)) return false
  const exp = parseInt(payload, 10)
  return Number.isFinite(exp) && Date.now() <= exp
}

/** Is the current request an authenticated admin? */
export async function isAdmin(): Promise<boolean> {
  const c = await cookies()
  return verifyToken(c.get(COOKIE)?.value)
}

/** Page guard for the back office. Sends non-admins to the admin login. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login')
}
