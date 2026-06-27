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
  if (ids.length === 0) return NextResponse.json({ error: 'No studies selected' }, { status: 400 })
  if (ids.length > 200) return NextResponse.json({ error: 'Too many studies (max 200)' }, { status: 400 })

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')

  if (action === 'delete') {
    await query(`DELETE FROM studies WHERE id IN (${placeholders})`, ids)
    for (const id of ids) await auditLog('study.delete', 'study', id, { bulk: true })
    return NextResponse.json({ ok: true, affected: ids.length })
  }
  if (action === 'status') {
    const status = body?.status
    if (!['draft', 'complete', 'exported'].includes(status)) return NextResponse.json({ error: 'Bad status' }, { status: 400 })
    await query(`UPDATE studies SET status = $${ids.length + 1} WHERE id IN (${placeholders})`, [...ids, status])
    for (const id of ids) await auditLog('study.edit', 'study', id, { bulk: true, status })
    return NextResponse.json({ ok: true, affected: ids.length })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
