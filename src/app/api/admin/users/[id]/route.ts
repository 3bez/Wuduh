import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'
import { auditLog } from '@/lib/admin/audit'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const user = await queryOne(`SELECT id, email, name, "emailVerified", banned, "banReason", "createdAt", "updatedAt" FROM users WHERE id = $1`, [id])
  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const studies = await query(`
    SELECT id, "startupName", language, status, "completionPercentage", "createdAt", "updatedAt",
      (SELECT count(*) FROM exports e WHERE e."studyId" = s.id)::int AS exports
    FROM studies s WHERE s."userId" = $1 ORDER BY s."updatedAt" DESC
  `, [id])
  const exports = await query(`
    SELECT e.id, e.language, e."completionSnapshot", e.pdf_url, e."createdAt", s."startupName"
    FROM exports e LEFT JOIN studies s ON s.id = e."studyId"
    WHERE e."userId" = $1 ORDER BY e."createdAt" DESC
  `, [id])
  const sessions = await query(`
    SELECT id, "ipAddress", "userAgent", "createdAt", "expiresAt", ("expiresAt" > now()) AS active
    FROM sessions WHERE "userId" = $1 ORDER BY "createdAt" DESC
  `, [id])
  return NextResponse.json({ user, studies, exports, sessions })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  // verify / unverify
  if (body?.action === 'verify' || body?.action === 'unverify') {
    await query(`UPDATE users SET "emailVerified" = $1 WHERE id = $2`, [body.action === 'verify', id])
    await auditLog(`user.${body.action}`, 'user', id)
    return NextResponse.json({ ok: true })
  }

  // ban / unban
  if (body?.action === 'ban' || body?.action === 'unban') {
    const reason = typeof body?.reason === 'string' ? body.reason.trim() || null : null
    await query(`UPDATE users SET banned = $1, "banReason" = $2 WHERE id = $3`, [body.action === 'ban', body.action === 'ban' ? reason : null, id])
    if (body.action === 'ban') {
      // Revoke all sessions on ban
      await query(`DELETE FROM sessions WHERE "userId" = $1`, [id])
    }
    await auditLog(`user.${body.action}`, 'user', id, { reason })
    return NextResponse.json({ ok: true })
  }

  // edit name / email
  const sets: string[] = []
  const vals: unknown[] = []
  if (typeof body?.name === 'string') { vals.push(body.name.trim() || null); sets.push(`name = $${vals.length}`) }
  if (typeof body?.email === 'string') {
    const email = body.email.trim().toLowerCase()
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    vals.push(email); sets.push(`email = $${vals.length}`)
  }
  if (sets.length === 0) return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  vals.push(id)
  try {
    await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals)
    await auditLog('user.edit', 'user', id, { fields: sets.map(s => s.split(' = ')[0]) })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'update failed'
    if (msg.includes('unique') || msg.includes('duplicate')) return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  // Grab email for audit before deleting
  const user = await queryOne<{ email: string }>(`SELECT email FROM users WHERE id = $1`, [id])
  await query(`DELETE FROM users WHERE id = $1`, [id])
  await auditLog('user.delete', 'user', id, { email: user?.email })
  return NextResponse.json({ ok: true })
}
