import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID = ['draft', 'complete', 'exported']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const status = body?.status
  if (!VALID.includes(status)) return NextResponse.json({ error: 'bad status' }, { status: 400 })
  await query(`UPDATE studies SET status = $1 WHERE id = $2`, [status, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  await query(`DELETE FROM studies WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
