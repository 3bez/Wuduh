import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query } from '@/lib/db'
import { auditLog } from '@/lib/admin/audit'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : []
  const action: string = body?.action || ''
  if (ids.length === 0) return NextResponse.json({ error: 'No users selected' }, { status: 400 })
  if (ids.length > 200) return NextResponse.json({ error: 'Too many users (max 200)' }, { status: 400 })

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')

  if (action === 'verify') {
    await query(`UPDATE users SET "emailVerified" = true WHERE id IN (${placeholders})`, ids)
    for (const id of ids) await auditLog('user.verify', 'user', id, { bulk: true })
    return NextResponse.json({ ok: true, affected: ids.length })
  }
  if (action === 'unverify') {
    await query(`UPDATE users SET "emailVerified" = false WHERE id IN (${placeholders})`, ids)
    for (const id of ids) await auditLog('user.unverify', 'user', id, { bulk: true })
    return NextResponse.json({ ok: true, affected: ids.length })
  }
  if (action === 'ban') {
    await query(`UPDATE users SET banned = true WHERE id IN (${placeholders})`, ids)
    await query(`DELETE FROM sessions WHERE "userId" IN (${placeholders})`, ids)
    for (const id of ids) await auditLog('user.ban', 'user', id, { bulk: true })
    return NextResponse.json({ ok: true, affected: ids.length })
  }
  if (action === 'delete') {
    await query(`DELETE FROM users WHERE id IN (${placeholders})`, ids)
    for (const id of ids) await auditLog('user.delete', 'user', id, { bulk: true })
    return NextResponse.json({ ok: true, affected: ids.length })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
