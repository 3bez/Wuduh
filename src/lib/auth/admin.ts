import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto from 'node:crypto'

// ── Multi-admin back-office auth ──────────────────────────────────
// Supports two modes:
// 1. Single password: env ADMIN_PASSWORD (backward compatible)
// 2. Named accounts: env ADMIN_ACCOUNTS="alice:pass1,bob:pass2"
// When using named accounts, the admin's name is embedded in the token
// so audit logs can track who performed each action.

const COOKIE = 'wuduh_admin'
const MAX_AGE_S = 60 * 60 * 24 * 7 // 7 days

export const ADMIN_COOKIE = COOKIE
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_S

function signingKey(): string {
  const pw = process.env.ADMIN_PASSWORD ?? ''
  const accounts = process.env.ADMIN_ACCOUNTS ?? ''
  return crypto.createHash('sha256').update('wuduh-admin|' + pw + '|' + accounts).digest('hex')
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', signingKey()).update(payload).digest('hex')
}

/** Parse ADMIN_ACCOUNTS env into { name, password } pairs. */
function getAdminAccounts(): { name: string; password: string }[] {
  const raw = process.env.ADMIN_ACCOUNTS ?? ''
  if (!raw) return []
  return raw.split(',').map(entry => {
    const colon = entry.indexOf(':')
    if (colon < 1) return null
    return { name: entry.slice(0, colon).trim(), password: entry.slice(colon + 1) }
  }).filter((a): a is { name: string; password: string } => a !== null)
}

/** True only if an admin password or accounts have been configured. */
export function adminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD ?? '').length > 0 || getAdminAccounts().length > 0
}

/** Constant-time password check. Returns the admin name if matched, null otherwise. */
export function checkAdminPassword(input: string): string | null {
  // Check named accounts first
  const accounts = getAdminAccounts()
  for (const acct of accounts) {
    const a = Buffer.from(input)
    const b = Buffer.from(acct.password)
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return acct.name
    }
  }

  // Fall back to single ADMIN_PASSWORD
  const expected = process.env.ADMIN_PASSWORD ?? ''
  if (!expected) return null
  const a = Buffer.from(input)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  if (!crypto.timingSafeEqual(a, b)) return null
  return 'owner'
}

/** Build a signed session token carrying admin name and expiry. */
export function createAdminToken(adminName: string): string {
  const exp = Date.now() + MAX_AGE_S * 1000
  const payload = `${adminName}|${exp}`
  return `${payload}.${sign(payload)}`
}

function verifyToken(token: string | undefined): { valid: boolean; name: string | null } {
  if (!token) return { valid: false, name: null }
  const dot = token.lastIndexOf('.')
  if (dot < 1) return { valid: false, name: null }
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = sign(payload)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return { valid: false, name: null }
  if (!crypto.timingSafeEqual(a, b)) return { valid: false, name: null }
  const pipe = payload.indexOf('|')
  const name = pipe > 0 ? payload.slice(0, pipe) : null
  const exp = parseInt(pipe > 0 ? payload.slice(pipe + 1) : payload, 10)
  if (!Number.isFinite(exp) || Date.now() > exp) return { valid: false, name: null }
  return { valid: true, name }
}

/** Is the current request an authenticated admin? */
export async function isAdmin(): Promise<boolean> {
  const c = await cookies()
  return verifyToken(c.get(COOKIE)?.value).valid
}

/** Get the name of the currently authenticated admin, or null. */
export async function getAdminName(): Promise<string | null> {
  const c = await cookies()
  const { valid, name } = verifyToken(c.get(COOKIE)?.value)
  return valid ? name : null
}

/** Page guard for the back office. Sends non-admins to the admin login. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login')
}
