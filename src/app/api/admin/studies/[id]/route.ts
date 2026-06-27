import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID_STATUS = ['draft', 'complete', 'exported']
const VALID_LANG = ['en', 'ar']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const sets: string[] = []
  const vals: unknown[] = []
  if (body?.status !== undefined) {
    if (!VALID_STATUS.includes(body.status)) return NextResponse.json({ error: 'bad status' }, { status: 400 })
    vals.push(body.status); sets.push(`status = $${vals.length}`)
  }
  if (body?.language !== undefined) {
    if (!VALID_LANG.includes(body.language)) return NextResponse.json({ error: 'bad language' }, { status: 400 })
    vals.push(body.language); sets.push(`language = $${vals.length}`)
  }
  if (body?.startupName !== undefined) {
    vals.push(String(body.startupName).trim() || null); sets.push(`"startupName" = $${vals.length}`)
  }
  if (body?.completionPercentage !== undefined) {
    const c = Math.max(0, Math.min(100, parseInt(String(body.completionPercentage), 10) || 0))
    vals.push(c); sets.push(`"completionPercentage" = $${vals.length}`)
  }
  if (sets.length === 0) return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  vals.push(id)
  await query(`UPDATE studies SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await query(`DELETE FROM studies WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
